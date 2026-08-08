"""The Bhashini/Canvas client and the mutations built on it.

All outbound HTTP is intercepted by respx; the `mock_http` fixture's catch-all
route fails any un-mocked call rather than letting CI reach the real upstream.
"""

from __future__ import annotations

import base64
import ssl

import httpx
import pytest
import respx

from app.core.config import Settings
from app.services import bhashini
from app.services.http import (
    RETRY_STATUS,
    BhashiniNotConfigured,
    build_http_client,
    build_ssl_context,
)
from app.services.media import (
    InvalidPayload,
    PayloadTooLarge,
    decode_media,
    sniff_audio,
    sniff_image,
)

MT_URL = "https://api.test/mt"
ASR_URL = "https://api.test/asr"

TRANSLATE = """
mutation T($input: MTInput!) {
  translateText(input: $input) { success translatedText message }
}
"""

TRANSCRIBE = """
mutation A($input: ASRInput!) {
  transcribeAudio(input: $input) { success message transcribedText error }
}
"""


@pytest.fixture
def configured(monkeypatch, settings: Settings) -> Settings:
    monkeypatch.setenv("BASHINI_MT_API_URL_EN_HI", MT_URL)
    monkeypatch.setenv("BASHINI_MT_API_TOKEN_EN_HI", "mt-token")
    monkeypatch.setenv("BASHINI_ASR_API_URL_EN", ASR_URL)
    monkeypatch.setenv("BASHINI_API_TOKEN_DEFAULT", "default-token")

    from app.core.config import BhashiniSettings

    settings.bhashini = BhashiniSettings(_env_file=None)  # type: ignore[call-arg]
    return settings


# --- Payload guards ---------------------------------------------------------


async def test_oversized_payload_is_rejected_before_decoding():
    """Both AI mutations decoded unbounded client base64 with no cap."""
    payload = base64.b64encode(b"x" * 4096).decode()
    with pytest.raises(PayloadTooLarge, match="too large"):
        await decode_media(payload, max_bytes=1024, kind="image")


async def test_invalid_base64_gives_a_clean_error():
    with pytest.raises(InvalidPayload, match="not valid base64"):
        await decode_media("!!!not base64!!!", max_bytes=1024, kind="audio")


async def test_empty_payload_is_rejected():
    with pytest.raises(InvalidPayload, match="No image data"):
        await decode_media("", max_bytes=1024, kind="image")


async def test_data_uri_prefix_is_stripped():
    raw = base64.b64encode(b"hello").decode()
    assert (
        await decode_media(f"data:image/png;base64,{raw}", max_bytes=1024, kind="image") == b"hello"
    )


@pytest.mark.parametrize(
    ("data", "expected"),
    [
        (b"RIFF....WAVE", "audio/wav"),
        (b"ID3\x04and more", "audio/mpeg"),
        (b"OggS....", "audio/ogg"),
        (b"unknown-bytes", "audio/wav"),
    ],
)
def test_audio_sniffing(data: bytes, expected: str):
    assert sniff_audio(data)[1] == expected


@pytest.mark.parametrize(
    ("data", "expected"),
    [
        (b"\xff\xd8\xffrest", "image/jpeg"),
        (b"\x89PNG\r\n", "image/png"),
        (b"GIF89a...", "image/gif"),
        (b"whatever", "image/jpeg"),
    ],
)
def test_image_sniffing(data: bytes, expected: str):
    assert sniff_image(data)[1] == expected


# --- TLS policy -------------------------------------------------------------


def test_verification_is_on_by_default(settings: Settings):
    """Both upstream hosts serve valid public chains; the nine `verify=False`
    call sites this replaces were never necessary."""
    assert isinstance(build_ssl_context(settings), ssl.SSLContext)


def test_disabling_verification_is_refused_in_production(settings: Settings):
    from app.core.config import BhashiniSettings

    insecure = settings.model_copy()
    insecure.environment = "production"
    insecure.bhashini = BhashiniSettings(_env_file=None, BHASHINI_VERIFY_SSL="false")  # type: ignore[call-arg]

    with pytest.raises(RuntimeError, match="refused in production"):
        build_ssl_context(insecure)


def test_disabling_verification_warns_outside_production(settings: Settings):
    from unittest.mock import patch

    from app.core.config import BhashiniSettings

    insecure = settings.model_copy()
    insecure.bhashini = BhashiniSettings(_env_file=None, BHASHINI_VERIFY_SSL="false")  # type: ignore[call-arg]

    with patch("app.services.http.logger") as mock_logger:
        assert build_ssl_context(insecure) is False

    mock_logger.warning.assert_called_once()
    assert "DISABLED" in mock_logger.warning.call_args.args[0]


def test_client_applies_the_configured_timeout(settings: Settings):
    client = build_http_client(settings)
    assert client.timeout.read == settings.bhashini.timeout
    assert client.timeout.connect == settings.bhashini.connect_timeout


# --- Translation ------------------------------------------------------------


async def test_translate_success(execute, configured, mock_http):
    mock_http.post(MT_URL).mock(
        return_value=httpx.Response(200, json={"data": {"output_text": "नमस्ते"}})
    )
    result = await execute(
        TRANSLATE, {"input": {"text": "Hello", "sourceLang": "en", "targetLang": "hi"}}
    )

    assert result.data["translateText"]["success"] is True
    assert result.data["translateText"]["translatedText"] == "नमस्ते"


async def test_translate_sends_the_access_token(execute, configured, mock_http):
    route = mock_http.post(MT_URL).mock(
        return_value=httpx.Response(200, json={"data": {"output_text": "ok"}})
    )
    await execute(TRANSLATE, {"input": {"text": "Hi", "sourceLang": "en", "targetLang": "hi"}})

    assert route.calls.last.request.headers["access-token"] == "mt-token"


async def test_unconfigured_language_reports_a_useful_message(execute, configured, mock_http):
    result = await execute(
        TRANSLATE, {"input": {"text": "Hi", "sourceLang": "zz", "targetLang": "yy"}}
    )
    assert result.data["translateText"]["success"] is False
    assert "not configured" in result.data["translateText"]["message"]


async def test_upstream_error_does_not_leak_internals(execute, configured, mock_http):
    mock_http.post(MT_URL).mock(
        return_value=httpx.Response(500, text="Traceback: secret internals at https://api.test/mt")
    )
    result = await execute(
        TRANSLATE, {"input": {"text": "Hi", "sourceLang": "en", "targetLang": "hi"}}
    )

    message = result.data["translateText"]["message"]
    assert result.data["translateText"]["success"] is False
    assert "secret internals" not in message
    assert "api.test" not in message


async def test_unexpected_response_shape_is_reported_cleanly(execute, configured, mock_http):
    mock_http.post(MT_URL).mock(return_value=httpx.Response(200, json={"unexpected": True}))
    result = await execute(
        TRANSLATE, {"input": {"text": "Hi", "sourceLang": "en", "targetLang": "hi"}}
    )
    assert result.data["translateText"]["success"] is False


# --- Retries ----------------------------------------------------------------


@pytest.mark.parametrize("status", sorted(RETRY_STATUS))
async def test_transient_statuses_are_retried_then_succeed(configured, http_client, status: int):
    with respx.mock:
        route = respx.post(MT_URL).mock(
            side_effect=[
                httpx.Response(status),
                httpx.Response(200, json={"data": {"output_text": "recovered"}}),
            ]
        )
        result = await bhashini.translate(
            http_client, configured, text="Hi", source_lang="en", target_lang="hi"
        )

    assert result == "recovered"
    assert route.call_count == 2


async def test_client_errors_are_not_retried(configured, http_client):
    with respx.mock:
        route = respx.post(MT_URL).mock(return_value=httpx.Response(400, text="bad request"))
        with pytest.raises(bhashini.UpstreamError):
            await bhashini.translate(
                http_client, configured, text="Hi", source_lang="en", target_lang="hi"
            )

    assert route.call_count == 1


async def test_missing_configuration_raises_before_any_request(configured, http_client):
    with pytest.raises(BhashiniNotConfigured):
        await bhashini.extract_text(http_client, configured, image_data="AAAA", language="hi")


# --- Speech recognition -----------------------------------------------------


async def test_transcribe_success(execute, configured, mock_http):
    mock_http.post(ASR_URL).mock(
        return_value=httpx.Response(
            200, json={"status": "success", "data": {"recognized_text": "hello world"}}
        )
    )
    audio = base64.b64encode(b"RIFF....WAVEdata").decode()
    result = await execute(TRANSCRIBE, {"input": {"audioData": audio, "language": "en"}})

    assert result.data["transcribeAudio"]["success"] is True
    assert result.data["transcribeAudio"]["transcribedText"] == "hello world"


async def test_oversized_audio_is_refused_by_the_mutation(execute, configured, mock_http):
    configured.bhashini.max_upload_bytes = 16
    audio = base64.b64encode(b"RIFF" + b"x" * 4096).decode()
    result = await execute(TRANSCRIBE, {"input": {"audioData": audio, "language": "en"}})

    assert result.data["transcribeAudio"]["success"] is False
    assert "too large" in result.data["transcribeAudio"]["error"]


async def test_language_detection_is_deterministic():
    """langdetect randomises unless seeded, so the same text could pick differently."""
    from app.services.languages import TTS_LANGUAGES

    text = "This is a reasonably long English sentence for detection purposes."
    results = {bhashini.detect_language(text, TTS_LANGUAGES) for _ in range(5)}
    assert results == {"en"}


def test_unsupported_detected_language_falls_back_to_english():
    from app.services.languages import TTS_LANGUAGES

    # Tamil is not in the TTS coverage list.
    assert bhashini.detect_language("இது ஒரு தமிழ் வாக்கியம் ஆகும்", TTS_LANGUAGES) == "en"
