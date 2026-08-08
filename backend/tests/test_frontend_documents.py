"""Validate every frontend GraphQL document against the real schema.

This is the guard that would have caught the two schema/client mismatches that
shipped: a query for `getSupportedLanguages`, a field the schema never had, and a
mutation document shaped for a resolver that had been shadowed by a mock. Both
failed silently in the browser because Apollo was configured with
`errorPolicy: 'all'`.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest
from graphql import parse, validate

from app.graphql.schema import schema

REPO_ROOT = Path(__file__).resolve().parents[2]
QUERIES_FILE = REPO_ROOT / "frontend" / "graphql" / "queries.ts"
SCHEMA_FILE = REPO_ROOT / "backend" / "schema.graphql"

DOCUMENT_RE = re.compile(r"export const (\w+)\s*=\s*gql`(.*?)`", re.DOTALL)


def graphql_schema():
    """The underlying graphql-core schema strawberry wraps."""
    return schema._schema


def frontend_documents() -> list[tuple[str, str]]:
    if not QUERIES_FILE.exists():  # pragma: no cover - repo layout guard
        pytest.skip(f"{QUERIES_FILE} not found")
    return DOCUMENT_RE.findall(QUERIES_FILE.read_text(encoding="utf-8"))


@pytest.mark.parametrize(
    ("name", "body"), frontend_documents(), ids=lambda v: v if isinstance(v, str) else ""
)
def test_document_validates_against_schema(name: str, body: str) -> None:
    errors = validate(graphql_schema(), parse(body))
    assert not errors, f"{name} does not match the schema: " + "; ".join(e.message for e in errors)


def test_every_document_is_covered() -> None:
    """Guard against the regex silently matching nothing."""
    assert len(frontend_documents()) >= 20


def test_committed_schema_matches_the_code() -> None:
    """`schema.graphql` is the artifact CI and the frontend types are read against."""
    assert SCHEMA_FILE.exists(), "backend/schema.graphql is missing"
    committed = SCHEMA_FILE.read_text(encoding="utf-8").strip()
    assert committed == schema.as_str().strip(), (
        "backend/schema.graphql is stale. Regenerate it with:\n"
        "  uv run strawberry export-schema app.graphql.schema:schema > schema.graphql"
    )
