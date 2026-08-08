"""Settings, with emphasis on the two bugs it exists to prevent."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.core.config import BhashiniSettings, Settings

STRONG_SECRET = "x" * 40


def make_settings(**env: str) -> Settings:
    return Settings(_env_file=None, **env)  # type: ignore[call-arg]


# --- JWT secret -------------------------------------------------------------


def test_secret_key_is_accepted_as_a_legacy_alias():
    """AuthService read SECRET_KEY while everything else set JWT_SECRET_KEY.

    They never met, so every deployment signed tokens with a hardcoded default.
    Both names now resolve to the same setting.
    """
    settings = make_settings(SECRET_KEY=STRONG_SECRET)
    assert settings.jwt_secret_key.get_secret_value() == STRONG_SECRET


def test_jwt_secret_key_wins_over_the_legacy_alias():
    settings = make_settings(JWT_SECRET_KEY=STRONG_SECRET, SECRET_KEY="y" * 40)
    assert settings.jwt_secret_key.get_secret_value() == STRONG_SECRET


@pytest.mark.parametrize(
    "secret",
    [
        "",
        "your-secret-key-change-in-production",
        "your-super-secret-key-change-in-production",
        "short",
    ],
)
def test_production_refuses_a_weak_secret(secret: str):
    with pytest.raises(ValidationError, match="JWT_SECRET_KEY"):
        make_settings(ENVIRONMENT="production", JWT_SECRET_KEY=secret)


def test_development_generates_an_ephemeral_secret():
    """A fresh clone must still run, but must not sign with a known key."""
    settings = make_settings(ENVIRONMENT="development")
    assert settings.jwt_secret_key is not None
    assert len(settings.jwt_secret_key.get_secret_value()) >= 32


def test_production_disables_the_graphql_ide():
    settings = make_settings(ENVIRONMENT="production", JWT_SECRET_KEY=STRONG_SECRET)
    assert settings.graphql_ide is False


def test_secret_never_appears_in_repr():
    settings = make_settings(JWT_SECRET_KEY=STRONG_SECRET)
    assert STRONG_SECRET not in repr(settings)


# --- Database URL -----------------------------------------------------------


@pytest.mark.parametrize(
    "given",
    ["postgresql://u:p@h:5432/db", "postgresql+psycopg2://u:p@h:5432/db"],
)
def test_database_url_is_normalised_to_psycopg3(given: str):
    """Existing compose/deploy values must keep working unchanged."""
    settings = make_settings(DATABASE_URL=given)
    assert settings.database_url == "postgresql+psycopg://u:p@h:5432/db"


def test_already_normalised_url_is_left_alone():
    url = "postgresql+psycopg://u:p@h:5432/db"
    assert make_settings(DATABASE_URL=url).database_url == url


# --- CORS -------------------------------------------------------------------


def test_cors_origins_parses_a_comma_separated_list():
    """pydantic-settings JSON-decodes complex types by default, which would reject this."""
    settings = make_settings(CORS_ORIGINS="http://a.test, http://b.test ,")
    assert settings.cors_origins == ["http://a.test", "http://b.test"]


def test_cors_origins_defaults_match_the_previously_hardcoded_list():
    origins = make_settings().cors_origins
    assert "http://localhost:3000" in origins
    assert "https://tourism-toolkit.vercel.app" in origins


# --- Bhashini endpoint folding ---------------------------------------------


def bhashini(**env: str) -> BhashiniSettings:
    return BhashiniSettings(_env_file=None, **env)  # type: ignore[call-arg]


def test_flat_env_vars_fold_into_nested_endpoints(monkeypatch):
    monkeypatch.setenv("BASHINI_ASR_API_URL_HI", "https://api.test/asr/hi")
    monkeypatch.setenv("BASHINI_ASR_API_TOKEN_HI", "token-hi")

    resolved = bhashini().resolve("asr", "hi")
    assert resolved.url == "https://api.test/asr/hi"
    assert resolved.token.get_secret_value() == "token-hi"


def test_mt_language_pairs_fold_correctly(monkeypatch):
    monkeypatch.setenv("BASHINI_MT_API_URL_EN_HI", "https://api.test/mt/en-hi")
    assert bhashini().resolve("mt", "en_hi").url == "https://api.test/mt/en-hi"


def test_resolution_falls_back_through_keys_then_default(monkeypatch):
    monkeypatch.setenv("BASHINI_TTS_API_URL_DEFAULT", "https://api.test/tts")
    monkeypatch.setenv("BASHINI_TTS_API_URL_HI", "https://api.test/tts/hi")

    settings = bhashini()
    assert settings.resolve("tts", "hi").url == "https://api.test/tts/hi"
    # No Tamil endpoint configured -> the default.
    assert settings.resolve("tts", "ta").url == "https://api.test/tts"


def test_token_falls_back_to_the_global_default(monkeypatch):
    """The old TTS code fell back to the default *URL* while leaving the token None."""
    monkeypatch.setenv("BASHINI_TTS_API_URL_HI", "https://api.test/tts/hi")
    monkeypatch.setenv("BASHINI_API_TOKEN_DEFAULT", "global-token")

    resolved = bhashini().resolve("tts", "hi")
    assert resolved.token.get_secret_value() == "global-token"


def test_correctly_spelled_prefix_is_also_accepted(monkeypatch):
    monkeypatch.setenv("BHASHINI_OCR_API_URL_TA", "https://api.test/ocr/ta")
    assert bhashini().resolve("ocr", "ta").url == "https://api.test/ocr/ta"


def test_unconfigured_service_resolves_to_an_empty_endpoint():
    resolved = bhashini().resolve("asr", "zz")
    assert resolved.url is None
    assert resolved.configured is False


def test_describe_lists_configured_endpoints_without_values(monkeypatch):
    monkeypatch.setenv("BASHINI_ASR_API_URL_HI", "https://api.test/asr/hi")
    monkeypatch.setenv("BASHINI_ASR_API_TOKEN_HI", "super-secret-token")

    described = bhashini().describe()
    assert "asr=[hi]" in described
    assert "super-secret-token" not in described
    assert "https://api.test" not in described


def test_empty_env_values_are_ignored(monkeypatch):
    monkeypatch.setenv("BASHINI_ASR_API_URL_HI", "   ")
    assert bhashini().resolve("asr", "hi").url is None
