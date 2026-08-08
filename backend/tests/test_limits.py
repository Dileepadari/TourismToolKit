"""Rate limiting and query cost limits.

Neither existed: `DEVELOPMENT.md` documented a rate-limit table that had never
been implemented, and `MaxTokensLimiter` capped document size but not its shape.
"""

from __future__ import annotations

import pytest

from app.core.ratelimit import AI_OPERATIONS, AUTH_OPERATIONS, Limit, bucket_for, limiter


@pytest.fixture(autouse=True)
def clean_limiter():
    limiter.reset()
    yield
    limiter.reset()


# --- Limit parsing ----------------------------------------------------------


def test_limit_parsing():
    limit = Limit.parse("10/60")
    assert limit.count == 10
    assert limit.window_seconds == 60


@pytest.mark.parametrize("spec", ["", "abc", "10", "10/", "/60", "0/60", "10/0", "-1/60"])
def test_invalid_limit_specs_are_rejected(spec: str):
    with pytest.raises(ValueError, match="invalid rate limit"):
        Limit.parse(spec)


@pytest.mark.parametrize("field", sorted(AUTH_OPERATIONS))
def test_auth_operations_use_the_auth_bucket(field: str):
    assert bucket_for(field) == "auth"


@pytest.mark.parametrize("field", sorted(AI_OPERATIONS))
def test_ai_operations_use_the_ai_bucket(field: str):
    """These cost real money per call upstream."""
    assert bucket_for(field) == "ai"


def test_everything_else_uses_the_default_bucket():
    assert bucket_for("getPlaces") == "default"


# --- Counter behaviour ------------------------------------------------------


def test_requests_are_allowed_up_to_the_limit():
    limit = Limit(count=3, window_seconds=60)
    for _ in range(3):
        assert limiter.hit("key", limit).allowed is True
    assert limiter.hit("key", limit).allowed is False


def test_remaining_counts_down():
    limit = Limit(count=3, window_seconds=60)
    assert limiter.hit("key", limit).remaining == 2
    assert limiter.hit("key", limit).remaining == 1
    assert limiter.hit("key", limit).remaining == 0


def test_keys_are_independent():
    limit = Limit(count=1, window_seconds=60)
    assert limiter.hit("alice", limit).allowed is True
    assert limiter.hit("bob", limit).allowed is True
    assert limiter.hit("alice", limit).allowed is False


def test_window_resets():
    limit = Limit(count=1, window_seconds=60)
    assert limiter.hit("key", limit, now=1000.0).allowed is True
    assert limiter.hit("key", limit, now=1030.0).allowed is False
    # Past the window, the counter starts again.
    assert limiter.hit("key", limit, now=1061.0).allowed is True


def test_retry_after_reflects_the_remaining_window():
    limit = Limit(count=1, window_seconds=60)
    limiter.hit("key", limit, now=1000.0)
    decision = limiter.hit("key", limit, now=1010.0)
    assert decision.allowed is False
    assert 45 <= decision.retry_after <= 50


# --- Through the schema -----------------------------------------------------


async def test_login_attempts_are_rate_limited(client, unique_credentials):
    """Credential stuffing is the thing this guards."""
    document = {
        "query": "mutation L($i: LoginInput!) { login(input: $i) { success } }",
        "variables": {"i": {"email": "nobody@example.com", "password": "wrong"}},
    }

    limited = None
    for _ in range(30):
        response = await client.post("/graphql", json=document)
        errors = response.json().get("errors")
        if errors and any(e.get("extensions", {}).get("code") == "RATE_LIMITED" for e in errors):
            limited = errors
            break

    assert limited is not None, "login was never rate limited"
    assert limited[0]["extensions"]["retryAfter"] > 0


async def test_reads_are_not_limited_as_tightly(client):
    """A normal browsing session must not trip the limiter."""
    for _ in range(25):
        response = await client.post(
            "/graphql", json={"query": "{ getSupportedLanguages { languages { code } } }"}
        )
        assert response.json().get("errors") is None


async def test_deeply_nested_queries_are_rejected(execute, settings):
    # The depth check runs before schema validation, so the field names do not
    # need to exist - the point is that a parseable but abusive document is
    # rejected on shape alone, which is what protects against a hostile client.
    depth = settings.graphql_max_depth + 3
    query = "{ " + "a { " * depth + "b" + " }" * depth + " }"

    result = await execute(query)
    assert result.errors
    assert any("too deeply nested" in str(e.message) for e in result.errors)


async def test_alias_heavy_queries_are_rejected(execute, settings):
    aliases = " ".join(
        f"a{i}: getSupportedLanguages {{ languages {{ code }} }}"
        for i in range(settings.graphql_max_aliases + 5)
    )
    result = await execute("{ " + aliases + " }")

    assert result.errors
    assert any("too many aliases" in str(e.message) for e in result.errors)


async def test_ordinary_queries_pass_the_cost_check(execute):
    result = await execute("{ getSupportedLanguages { languages { code name } } }")
    assert result.errors is None
