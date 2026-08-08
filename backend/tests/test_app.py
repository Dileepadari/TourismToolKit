"""End-to-end tests through the ASGI app.

This is the only level that exercises CORS, the `context_getter`, and
Authorization-header parsing - the parts a direct `schema.execute` skips.
"""

from __future__ import annotations

import uuid

import httpx
import pytest


async def test_health(client: httpx.AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


async def test_health_detail_lists_configured_services(client: httpx.AsyncClient):
    response = await client.get("/health/detail")
    assert response.status_code == 200
    assert "bhashini" in response.json()


async def test_root(client: httpx.AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["graphql"] == "/graphql"


async def test_graphql_endpoint_answers_queries(client: httpx.AsyncClient):
    response = await client.post(
        "/graphql", json={"query": "{ getSupportedLanguages { languages { code } } }"}
    )
    assert response.status_code == 200
    assert response.json()["data"]["getSupportedLanguages"]["languages"]


async def test_bearer_token_reaches_resolvers(client: httpx.AsyncClient):
    """The header -> context -> resolver path, which `schema.execute` bypasses."""
    # This test goes through the real app, so it commits outside the rollback
    # fixture - a fresh identity each run keeps it repeatable.
    unique = uuid.uuid4().hex[:10]
    email = f"asgi-{unique}@example.com"

    register = await client.post(
        "/graphql",
        json={
            "query": """
              mutation Register($input: RegisterInput!) {
                register(input: $input) { success token }
              }
            """,
            "variables": {
                "input": {
                    "email": email,
                    "username": f"asgi{unique}",
                    "password": "correcthorse1",
                }
            },
        },
    )
    assert register.json()["data"]["register"]["success"] is True
    # No token in the body - the credential arrives as HttpOnly cookies, which
    # the client then sends automatically on the follow-up request.
    assert register.json()["data"]["register"]["token"] is None
    assert "tt_access" in register.cookies
    assert "tt_refresh" in register.cookies

    me = await client.post("/graphql", json={"query": "{ me { email } }"})
    assert me.json()["data"]["me"]["email"] == email


async def test_empty_authorization_header_is_treated_as_anonymous(client: httpx.AsyncClient):
    """The frontend sends `authorization: ""` when signed out."""
    response = await client.post(
        "/graphql", json={"query": "{ me { email } }"}, headers={"authorization": ""}
    )
    assert response.status_code == 200
    assert response.json()["data"]["me"] is None


async def test_garbage_token_is_anonymous_not_an_error(client: httpx.AsyncClient):
    response = await client.post(
        "/graphql",
        json={"query": "{ me { email } }"},
        headers={"authorization": "Bearer not-a-jwt"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["me"] is None


@pytest.mark.parametrize("origin", ["http://localhost:3000", "http://127.0.0.1:3000"])
async def test_cors_allows_configured_origins(client: httpx.AsyncClient, origin: str):
    response = await client.options(
        "/graphql",
        headers={
            "origin": origin,
            "access-control-request-method": "POST",
            "access-control-request-headers": "content-type",
        },
    )
    assert response.headers.get("access-control-allow-origin") == origin


async def test_cors_refuses_an_unknown_origin(client: httpx.AsyncClient):
    response = await client.options(
        "/graphql",
        headers={
            "origin": "https://evil.test",
            "access-control-request-method": "POST",
        },
    )
    assert response.headers.get("access-control-allow-origin") != "https://evil.test"


async def test_concurrent_root_fields_in_one_query(client: httpx.AsyncClient):
    """Regression: GraphQL runs sibling root fields concurrently.

    They used to share a single request-scoped AsyncSession, which is not safe
    for concurrent use - asking for two database-backed fields at once raised
    "this session is provisioning a new connection". Each resolver now takes its
    own session from the factory.
    """
    response = await client.post(
        "/graphql",
        json={
            "query": """
              {
                getPlaces(limit: 2) { id name }
                getEmergencyContacts(country: "India") { id number }
                getCultureTips(country: "India") { id tipText }
                getDictionaryEntries(limit: 2) { id word }
                getSupportedLanguages { languages { code } }
              }
            """
        },
    )

    body = response.json()
    assert body.get("errors") is None, body.get("errors")
    assert set(body["data"]) == {
        "getPlaces",
        "getEmergencyContacts",
        "getCultureTips",
        "getDictionaryEntries",
        "getSupportedLanguages",
    }
