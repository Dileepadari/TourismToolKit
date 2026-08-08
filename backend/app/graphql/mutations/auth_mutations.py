"""Registration, sign-in, refresh and sign-out.

Both `login` and `register` previously existed *twice*: a real database-backed
pair on the Query type, and a second pair on Mutation - where ``register`` was a
mock that returned a valid JWT for ``user_id=1`` without writing a row. Since the
frontend sends ``mutation Register``, the mock is what it hit, so signup never
persisted an account.

Tokens are now delivered as HttpOnly cookies rather than in the response body, so
the client never handles a credential and an XSS cannot steal one.
"""

from __future__ import annotations

import logging

import strawberry
from sqlmodel import select

from app.core.cookies import REFRESH_COOKIE, clear_auth_cookies, set_auth_cookies
from app.database.models import User, utcnow
from app.graphql.context import Info
from app.graphql.types.tourism_types import (
    AuthResponse,
    LoginInput,
    LogoutResponse,
    PasswordResetResponse,
    RegisterInput,
)
from app.graphql.types.tourism_types import (
    User as UserType,
)
from app.services import auth, sessions

logger = logging.getLogger(__name__)


async def _establish_session(info: Info, user: User) -> None:
    """Mint an access + refresh pair and attach both as cookies."""
    settings = info.context.settings
    async with info.context.db() as session:
        refresh_token = await sessions.issue_refresh_token(
            session, user, settings, user_agent=info.context.user_agent
        )

    if info.context.response is not None:
        set_auth_cookies(
            info.context.response,
            settings,
            access_token=auth.create_access_token(user, settings),
            refresh_token=refresh_token,
        )


@strawberry.type
class AuthMutation:
    @strawberry.mutation
    async def register(self, info: Info, input: RegisterInput) -> AuthResponse:
        try:
            async with info.context.db() as session:
                user = await auth.create_user(
                    session,
                    email=input.email,
                    username=input.username,
                    password=input.password,
                    full_name=input.full_name,
                    preferred_language=input.preferred_language,
                    preferred_theme=input.preferred_theme,
                    home_country=input.home_country,
                )
        except auth.AuthError as exc:
            return AuthResponse(success=False, message=str(exc), token=None, user=None)

        await _establish_session(info, user)
        logger.info("registered user id=%s", user.id)
        return AuthResponse(
            success=True,
            message="Account created successfully",
            # The credential lives in the cookie. `token` stays in the schema as
            # null so existing clients keep parsing the response.
            token=None,
            user=UserType.from_model(user),
        )

    @strawberry.mutation
    async def login(self, info: Info, input: LoginInput) -> AuthResponse:
        try:
            async with info.context.db() as session:
                user = await auth.authenticate_user(session, input.email, input.password)
        except auth.AuthError as exc:
            return AuthResponse(success=False, message=str(exc), token=None, user=None)

        await _establish_session(info, user)
        return AuthResponse(
            success=True,
            message="Signed in successfully",
            token=None,
            user=UserType.from_model(user),
        )

    @strawberry.mutation
    async def refresh_session(self, info: Info) -> AuthResponse:
        """Exchange the refresh cookie for a new access token, rotating both."""
        raw = info.context.cookies.get(REFRESH_COOKIE)
        if not raw:
            return AuthResponse(success=False, message="Not signed in.", token=None, user=None)

        settings = info.context.settings
        try:
            async with info.context.db() as session:
                user, replacement = await sessions.rotate_refresh_token(
                    session, raw, settings, user_agent=info.context.user_agent
                )
        except sessions.SessionError as exc:
            if info.context.response is not None:
                clear_auth_cookies(info.context.response, settings)
            return AuthResponse(success=False, message=str(exc), token=None, user=None)

        if info.context.response is not None:
            set_auth_cookies(
                info.context.response,
                settings,
                access_token=auth.create_access_token(user, settings),
                refresh_token=replacement,
            )
        return AuthResponse(
            success=True,
            message="Session refreshed",
            token=None,
            user=UserType.from_model(user),
        )

    @strawberry.mutation
    async def logout(self, info: Info, everywhere: bool = False) -> LogoutResponse:
        """End this session, or every session for the user.

        This is what a stateless token could not do: "logging out" used to clear
        client storage only, leaving the token valid until it expired.
        """
        settings = info.context.settings
        raw = info.context.cookies.get(REFRESH_COOKIE)
        user = await info.context.user()
        ended = 0

        async with info.context.db() as session:
            if everywhere and user is not None:
                ended = await sessions.revoke_all_for_user(session, user.id)  # type: ignore[arg-type]
            elif raw:
                await sessions.revoke(session, raw)
                ended = 1

        if info.context.response is not None:
            clear_auth_cookies(info.context.response, settings)

        return LogoutResponse(
            success=True,
            message="Signed out everywhere" if everywhere else "Signed out",
            sessions_ended=ended,
        )

    @strawberry.mutation
    async def request_password_reset(self, info: Info, email: str) -> PasswordResetResponse:
        """Start a password reset.

        Always reports success: telling the caller whether an address is
        registered would turn this into an account-enumeration oracle.

        No email is sent - there is no mail transport configured. The link is
        logged instead, which is enough for development and self-hosting; wiring
        a provider is the one remaining step for a public deployment.
        """
        settings = info.context.settings
        async with info.context.db() as session:
            user = (
                await session.exec(select(User).where(User.email == email.strip().lower()))
            ).first()

            if user is not None and user.is_active:
                token = await sessions.issue_password_reset_token(session, user, settings)
                logger.warning(
                    "password reset requested for user id=%s; no mail transport is "
                    "configured, so deliver this link manually: /auth/reset-password?token=%s",
                    user.id,
                    token,
                )

        return PasswordResetResponse(
            success=True,
            message=("If an account exists for that address, a reset link has been generated."),
        )

    @strawberry.mutation
    async def reset_password(
        self, info: Info, token: str, new_password: str
    ) -> PasswordResetResponse:
        """Complete a reset, then end every existing session for that user."""
        try:
            async with info.context.db() as session:
                user = await sessions.consume_password_reset_token(session, token)
                user.password_hash = auth.hash_password(new_password)
                user.updated_at = utcnow()
                session.add(user)
                await session.commit()

                # A password change must invalidate sessions elsewhere - that is
                # the whole point of changing it after a compromise.
                await sessions.revoke_all_for_user(session, user.id)  # type: ignore[arg-type]
        except (sessions.SessionError, auth.AuthError) as exc:
            return PasswordResetResponse(success=False, message=str(exc))

        if info.context.response is not None:
            clear_auth_cookies(info.context.response, info.context.settings)

        return PasswordResetResponse(
            success=True, message="Password updated. Please sign in with your new password."
        )
