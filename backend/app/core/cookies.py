"""Auth cookie handling.

The previous model kept the JWT in ``localStorage`` and mirrored it into a
JavaScript-readable cookie, so any XSS anywhere on the page was a full account
takeover. Both cookies here are ``HttpOnly`` - script cannot read them - and the
frontend never sees a token at all.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import Response

if TYPE_CHECKING:
    from app.core.config import Settings

ACCESS_COOKIE = "tt_access"
REFRESH_COOKIE = "tt_refresh"
# Read by the Next.js route guard (proxy.ts) to decide whether to render a
# protected page. It deliberately carries no token - only "a session exists" -
# so it is safe for it to be readable by script.
SESSION_HINT_COOKIE = "tt_session"

# The refresh token is only ever sent to the GraphQL endpoint, so scoping it
# there keeps it off every other request.
REFRESH_PATH = "/graphql"


def _common(settings: Settings) -> dict[str, object]:
    return {
        "httponly": True,
        # Lax rather than Strict: Strict would drop the cookie on any top-level
        # navigation *into* the app, so a user following a link would appear
        # signed out until they navigated again.
        "samesite": "lax",
        "secure": settings.cookie_secure,
        "domain": settings.cookie_domain,
    }


def set_auth_cookies(
    response: Response, settings: Settings, *, access_token: str, refresh_token: str
) -> None:
    response.set_cookie(
        ACCESS_COOKIE,
        access_token,
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
        **_common(settings),  # type: ignore[arg-type]
    )
    response.set_cookie(
        REFRESH_COOKIE,
        refresh_token,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path=REFRESH_PATH,
        **_common(settings),  # type: ignore[arg-type]
    )
    # Not HttpOnly, and holds no secret: it exists so the route guard and the
    # client can tell "signed in" from "signed out" without a round trip.
    response.set_cookie(
        SESSION_HINT_COOKIE,
        "1",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path="/",
        httponly=False,
        samesite="lax",
        secure=settings.cookie_secure,
        domain=settings.cookie_domain,
    )


def clear_auth_cookies(response: Response, settings: Settings) -> None:
    for name, path in (
        (ACCESS_COOKIE, "/"),
        (REFRESH_COOKIE, REFRESH_PATH),
        (SESSION_HINT_COOKIE, "/"),
    ):
        response.delete_cookie(
            name,
            path=path,
            domain=settings.cookie_domain,
            samesite="lax",
            secure=settings.cookie_secure,
        )
