"""Application settings.

Replaces the old ``app/config.py``, which was a plain class of ``os.getenv`` calls
whose ``JWT_SECRET_KEY`` was never read by anything - ``AuthService`` read a
*different* variable (``SECRET_KEY``) with a hardcoded fallback, so every
deployment signed its JWTs with a publicly known default.
"""

from __future__ import annotations

import logging
import os
import re
import secrets
from collections import defaultdict
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any, Literal

from dotenv import dotenv_values
from pydantic import (
    AliasChoices,
    BaseModel,
    Field,
    SecretStr,
    field_validator,
    model_validator,
)
from pydantic_settings import (
    BaseSettings,
    NoDecode,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
)

logger = logging.getLogger(__name__)

ENV_FILE = os.getenv("ENV_FILE", ".env")

# The literals the project has shipped as fallbacks. Refused in production.
WEAK_SECRETS = frozenset(
    {
        "your-secret-key-change-in-production",
        "your-super-secret-key-change-in-production",
        "change-me",
        "secret",
    }
)


# ---------------------------------------------------------------------------
# Bhashini endpoints
# ---------------------------------------------------------------------------

# The upstream API is configured through ~48 flat environment variables following
# a regular scheme. Rather than declaring 48 fields (which rot the moment a
# language is added) they are folded into a nested mapping by this one pattern.
#
#   BASHINI_ASR_API_URL_HI      -> endpoints["asr"]["hi"].url
#   BASHINI_OCR_API_TOKEN_TA    -> endpoints["ocr"]["ta"].token
#   BASHINI_MT_API_URL_EN_HI    -> endpoints["mt"]["en_hi"].url
#   BASHINI_TTS_API_URL_DEFAULT -> endpoints["tts"]["default"].url
#
# `BH?ASHINI` accepts both the misspelled prefix the project already uses in
# every .env file and the correctly spelled one, so deployments can be corrected
# without a flag day.
_BHASHINI_RE = re.compile(
    r"^BH?ASHINI_(?P<svc>ASR|TTS|OCR|MT)_API_(?P<kind>URL|TOKEN)_(?P<key>[A-Z0-9]+(?:_[A-Z0-9]+)*)$"
)


class Endpoint(BaseModel):
    """A resolved upstream URL and its access token."""

    url: str | None = None
    token: SecretStr | None = None

    @property
    def configured(self) -> bool:
        return bool(self.url)


class BhashiniEnvSource(PydanticBaseSettingsSource):
    """Folds the flat ``BASHINI_*`` namespace into ``endpoints``.

    Reads the process environment *and* the dotenv file, because the fold has to
    happen before the app's own ``load_dotenv()`` would otherwise run.
    """

    def get_field_value(self, field: Any, field_name: str) -> tuple[Any, str, bool]:
        # Not used: this source supplies exactly one synthesised field via __call__.
        raise NotImplementedError

    def __call__(self) -> dict[str, Any]:
        raw: dict[str, str | None] = {}
        env_path = Path(ENV_FILE)
        if env_path.is_file():
            raw.update(dotenv_values(env_path))
        raw.update(os.environ)

        acc: dict[str, dict[str, dict[str, str]]] = defaultdict(lambda: defaultdict(dict))
        for name, value in raw.items():
            if not value or not value.strip():
                continue
            match = _BHASHINI_RE.match(name)
            if match:
                svc = match["svc"].lower()
                key = match["key"].lower()
                acc[svc][key][match["kind"].lower()] = value.strip()

        return {"endpoints": {svc: dict(table) for svc, table in acc.items()}}


class BhashiniSettings(BaseSettings):
    """Configuration for the four upstream AI services."""

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    endpoints: dict[str, dict[str, Endpoint]] = Field(default_factory=dict)

    default_token: SecretStr | None = Field(
        default=None,
        validation_alias=AliasChoices("BASHINI_API_TOKEN_DEFAULT", "BHASHINI_API_TOKEN_DEFAULT"),
    )

    # TLS. Verification stays ON by default: these requests carry the access token
    # in a header, so a passive MITM on any of them harvests every credential.
    # `ca_bundle` is the correct escape hatch for an institutional host serving an
    # incomplete chain - it is loaded *in addition to* the public CA set.
    verify_ssl: bool = Field(
        default=True,
        validation_alias=AliasChoices("BHASHINI_VERIFY_SSL", "BASHINI_VERIFY_SSL"),
    )
    ca_bundle: Path | None = Field(
        default=None,
        validation_alias=AliasChoices("BHASHINI_CA_BUNDLE", "BASHINI_CA_BUNDLE"),
    )

    timeout: float = Field(
        default=30.0, validation_alias=AliasChoices("BHASHINI_TIMEOUT", "BASHINI_TIMEOUT")
    )
    connect_timeout: float = Field(
        default=5.0,
        validation_alias=AliasChoices("BHASHINI_CONNECT_TIMEOUT", "BASHINI_CONNECT_TIMEOUT"),
    )
    max_retries: int = Field(
        default=2, validation_alias=AliasChoices("BHASHINI_MAX_RETRIES", "BASHINI_MAX_RETRIES")
    )
    max_upload_bytes: int = Field(
        default=10 * 1024 * 1024,
        validation_alias=AliasChoices("BHASHINI_MAX_UPLOAD_BYTES", "BASHINI_MAX_UPLOAD_BYTES"),
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        return (
            init_settings,
            BhashiniEnvSource(settings_cls),
            env_settings,
            dotenv_settings,
            file_secret_settings,
        )

    def resolve(self, service: str, *keys: str) -> Endpoint:
        """Resolve an endpoint, trying each key in order then ``default``.

        The token falls back independently of the URL - the old ``tts.py`` fell
        back to the default URL while keeping a ``None`` token, which produced
        authenticated-looking calls with no credential.
        """
        table = self.endpoints.get(service, {})
        fallback = table.get("default", Endpoint())
        chosen = next((table[k] for k in (*keys, "default") if k in table), Endpoint())
        return Endpoint(
            url=chosen.url or fallback.url,
            token=chosen.token or fallback.token or self.default_token,
        )

    def configured(self) -> dict[str, list[str]]:
        """Which keys have a URL, per service. Names only - never values."""
        return {
            svc: sorted(key for key, ep in table.items() if ep.configured)
            for svc, table in sorted(self.endpoints.items())
        }

    def describe(self) -> str:
        found = self.configured()
        if not found:
            return "none configured - translation, speech and OCR features will be unavailable"
        return " ".join(f"{svc}=[{','.join(keys)}]" for svc, keys in found.items())


# ---------------------------------------------------------------------------
# Root settings
# ---------------------------------------------------------------------------


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    environment: Literal["development", "staging", "production"] = "development"
    log_level: str = "INFO"
    # JSON logs in production so an aggregator can parse them; readable lines
    # in development. Forced on in production by the validator below.
    log_json: bool = False
    debug: bool = False

    # Database ---------------------------------------------------------------
    database_url: str = (
        "postgresql+psycopg://tourism_user:tourism_password@localhost:5432/tourism_db"
    )
    db_echo: bool = False
    db_pool_size: int = 5
    db_max_overflow: int = 10
    db_pool_recycle: int = 1800

    # Auth -------------------------------------------------------------------
    # One secret, two accepted names. `SECRET_KEY` is what the old AuthService
    # actually read; `JWT_SECRET_KEY` is what every doc, compose file and
    # Dockerfile sets. Accepting both is what closes that gap.
    jwt_secret_key: SecretStr | None = Field(
        default=None,
        validation_alias=AliasChoices("JWT_SECRET_KEY", "SECRET_KEY"),
    )
    jwt_algorithm: Literal["HS256", "HS384", "HS512"] = "HS256"
    # Short-lived: the access token cannot be revoked, so its blast radius is
    # bounded by its lifetime. Continuity comes from the refresh token instead.
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30
    password_reset_expire_minutes: int = 30

    # Cookies -----------------------------------------------------------------
    # Secure is forced on in production by the validator below; it is off by
    # default so http://localhost development works.
    cookie_secure: bool = False
    cookie_domain: str | None = None

    # HTTP -------------------------------------------------------------------
    cors_origins: Annotated[list[str], NoDecode] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://10.2.129.197:3000",
        "https://tourismtoolkit.dileepadari.dev",
        "https://tourism-toolkit.vercel.app",
    ]
    cors_origin_regex: str | None = None
    graphql_ide: bool = True

    # Rate limits, as "<count>/<window-seconds>". Auth is tight because it
    # guards credential stuffing; the AI mutations are tight because each call
    # costs real money upstream.
    rate_limit_enabled: bool = True
    rate_limit_auth: str = "10/60"
    rate_limit_ai: str = "30/60"
    rate_limit_default: str = "300/60"

    # Query cost. MaxTokensLimiter caps document *size*; these cap shape.
    graphql_max_depth: int = 12
    graphql_max_aliases: int = 30

    bhashini: BhashiniSettings = Field(default_factory=BhashiniSettings)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_csv(cls, value: Any) -> Any:
        # NoDecode + this validator are both required: pydantic-settings JSON-decodes
        # complex types by default, which would reject `CORS_ORIGINS=http://a,http://b`.
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("database_url", mode="after")
    @classmethod
    def _use_psycopg3_driver(cls, value: str) -> str:
        # Accept the bare `postgresql://` that compose and every deploy target
        # already set, and the psycopg2 form, without anyone having to edit them.
        for legacy in ("postgresql+psycopg2://", "postgresql://"):
            if value.startswith(legacy):
                return "postgresql+psycopg://" + value[len(legacy) :]
        return value

    @model_validator(mode="after")
    def _validate_secret(self) -> Settings:
        raw = self.jwt_secret_key.get_secret_value() if self.jwt_secret_key else ""
        is_weak = not raw or raw in WEAK_SECRETS or len(raw) < 32

        if self.environment == "production":
            if is_weak:
                raise ValueError(
                    "JWT_SECRET_KEY must be set to a strong random value (>=32 chars) in "
                    "production. Generate one with: python -c "
                    "'import secrets; print(secrets.token_urlsafe(48))'"
                )
            # An introspectable GraphQL IDE in production is a free schema map.
            self.graphql_ide = False
            # Auth cookies must never travel over plaintext in production.
            self.cookie_secure = True
            self.log_json = True
        elif is_weak:
            # Outside production, fail soft so a fresh clone runs - but make the
            # consequence explicit rather than silently signing with a known key.
            self.jwt_secret_key = SecretStr(secrets.token_urlsafe(48))
            logger.warning(
                "JWT_SECRET_KEY is unset or weak; generated an ephemeral key. "
                "All tokens become invalid when this process restarts. "
                "Set JWT_SECRET_KEY in your .env to persist sessions."
            )
        return self

    @property
    def database_url_sync(self) -> str:
        """psycopg 3 drives sync and async off the same URL; alembic uses this."""
        return self.database_url

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
