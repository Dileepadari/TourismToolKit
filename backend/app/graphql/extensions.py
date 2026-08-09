"""Schema extensions: rate limiting and query cost.

`MaxTokensLimiter` already caps document *size*. These cap what a document can
*cost*: how deep it nests, how many aliases it uses, and how often a caller may
invoke the expensive operations.
"""

from __future__ import annotations

import logging
from collections.abc import Iterator
from typing import Any

from graphql import GraphQLError, OperationDefinitionNode
from graphql.language import FieldNode, FragmentDefinitionNode, InlineFragmentNode
from strawberry.extensions import SchemaExtension

from app.core.ratelimit import Limit, bucket_for, limiter

logger = logging.getLogger(__name__)


def _selected_root_fields(document: Any) -> Iterator[str]:
    """Root field names of every operation in the document."""
    for definition in document.definitions:
        if not isinstance(definition, OperationDefinitionNode):
            continue
        for selection in definition.selection_set.selections:
            if isinstance(selection, FieldNode):
                yield selection.name.value


def _max_depth(node: Any, fragments: dict[str, FragmentDefinitionNode], depth: int = 0) -> int:
    selection_set = getattr(node, "selection_set", None)
    if selection_set is None:
        return depth

    deepest = depth
    for selection in selection_set.selections:
        if isinstance(selection, FieldNode):
            deepest = max(deepest, _max_depth(selection, fragments, depth + 1))
        elif isinstance(selection, InlineFragmentNode):
            deepest = max(deepest, _max_depth(selection, fragments, depth))
        else:  # fragment spread
            fragment = fragments.get(selection.name.value)
            if fragment is not None:
                deepest = max(deepest, _max_depth(fragment, fragments, depth))
    return deepest


def _alias_count(document: Any) -> int:
    total = 0
    stack = list(document.definitions)
    while stack:
        node = stack.pop()
        if isinstance(node, FieldNode) and node.alias is not None:
            total += 1
        selection_set = getattr(node, "selection_set", None)
        if selection_set is not None:
            stack.extend(selection_set.selections)
    return total


class QueryCostLimiter(SchemaExtension):
    """Reject documents that nest too deeply or alias too heavily."""

    def on_validate(self) -> Iterator[None]:
        # Checks run *before* the yield: the document is already parsed by this
        # point, and populating `pre_execution_errors` here short-circuits
        # execution. Doing it after the yield is too late to stop anything.
        execution = self.execution_context
        document = execution.graphql_document
        settings = getattr(execution.context, "settings", None)
        if document is None or settings is None:
            yield
            return

        fragments = {
            d.name.value: d for d in document.definitions if isinstance(d, FragmentDefinitionNode)
        }

        depth = max(
            (
                _max_depth(d, fragments)
                for d in document.definitions
                if isinstance(d, OperationDefinitionNode)
            ),
            default=0,
        )
        if depth > settings.graphql_max_depth:
            execution.pre_execution_errors = (execution.pre_execution_errors or []) + [
                GraphQLError(
                    f"Query is too deeply nested ({depth} levels; "
                    f"the limit is {settings.graphql_max_depth})."
                )
            ]
            yield
            return

        aliases = _alias_count(document)
        if aliases > settings.graphql_max_aliases:
            execution.pre_execution_errors = (execution.pre_execution_errors or []) + [
                GraphQLError(
                    f"Query uses too many aliases ({aliases}; "
                    f"the limit is {settings.graphql_max_aliases})."
                )
            ]

        yield


class RateLimiter(SchemaExtension):
    """Apply a per-client limit to each root field in the document."""

    def on_validate(self) -> Iterator[None]:
        # `on_operation` starts before the document is parsed, so the field names
        # are not knowable there.
        execution = self.execution_context
        context = execution.context
        settings = getattr(context, "settings", None)

        if settings is None or not settings.rate_limit_enabled:
            yield
            return

        document = execution.graphql_document
        if document is None:
            yield
            return

        specs = {
            "auth": Limit.parse(settings.rate_limit_auth),
            "session": Limit.parse(settings.rate_limit_session),
            "ai": Limit.parse(settings.rate_limit_ai),
            "default": Limit.parse(settings.rate_limit_default),
        }
        # Authenticated callers are limited per account; anonymous ones per IP,
        # which is coarse behind a shared NAT but is all that is available.
        identity = (
            f"user:{context.user_id}" if context.user_id is not None else f"ip:{context.client_ip}"
        )

        for field_name in _selected_root_fields(document):
            bucket = bucket_for(field_name)
            decision = limiter.hit(f"{identity}:{bucket}", specs[bucket])
            if not decision.allowed:
                logger.warning(
                    "rate limit hit: %s bucket=%s field=%s", identity, bucket, field_name
                )
                execution.pre_execution_errors = (execution.pre_execution_errors or []) + [
                    GraphQLError(
                        "Too many requests. Please wait "
                        f"{decision.retry_after} seconds and try again.",
                        extensions={"code": "RATE_LIMITED", "retryAfter": decision.retry_after},
                    )
                ]
                yield
                return

        yield
