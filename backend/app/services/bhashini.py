"""Async clients for the four upstream Bhashini/Canvas services.

Replaces the four sync service classes. Every call now:

* runs on ``httpx.AsyncClient`` instead of blocking the event loop with ``requests``
* has a timeout (six call sites previously had none)
* verifies TLS (all nine call sites previously passed ``verify=False``)
* resolves its endpoint at call time from settings, not from a module-level dict
  populated at *import* time - which meant a ``.env`` loaded afterwards produced
  ``None`` for every language
"""

from __future__ import annotations

import base64
import logging
from typing import Any

import httpx
from langdetect import DetectorFactory, LangDetectException, detect

from app.core.config import Settings
from app.services import languages
from app.services.http import BhashiniNotConfigured, post_with_retry
from app.services.media import decode_media, sniff_audio, sniff_image

# langdetect is randomised unless seeded, so the same text could pick different
# languages on consecutive calls.
DetectorFactory.seed = 0

logger = logging.getLogger(__name__)


class UpstreamError(Exception):
    """An upstream call failed in a way worth telling the user about."""


def _auth_headers(token: str | None) -> dict[str, str]:
    return {"access-token": token} if token else {}


async def _call(
    client: httpx.AsyncClient,
    settings: Settings,
    service: str,
    keys: tuple[str, ...],
    **kwargs: Any,
) -> httpx.Response:
    endpoint = settings.bhashini.resolve(service, *keys)
    if not endpoint.url:
        raise BhashiniNotConfigured(service, keys)

    token = endpoint.token.get_secret_value() if endpoint.token else None
    label = f"{service}/{keys[0] if keys else 'default'}"

    response = await post_with_retry(
        client,
        endpoint.url,
        max_retries=settings.bhashini.max_retries,
        label=label,
        headers=_auth_headers(token),
        **kwargs,
    )
    if response.status_code != 200:
        # The body is logged, not returned: it can echo the URL and request details.
        logger.error(
            "upstream %s returned %s: %s", label, response.status_code, response.text[:500]
        )
        raise UpstreamError(f"The {service.upper()} service returned an error. Please try again.")
    return response


# --- Machine translation ----------------------------------------------------


async def translate(
    client: httpx.AsyncClient,
    settings: Settings,
    *,
    text: str,
    source_lang: str,
    target_lang: str,
) -> str:
    keys = (f"{source_lang.lower()}_{target_lang.lower()}", source_lang.lower())
    response = await _call(client, settings, "mt", keys, json={"input_text": text})

    payload = response.json()
    output = payload.get("data", {}).get("output_text") if isinstance(payload, dict) else None
    if not output:
        logger.error("unexpected MT response shape: %s", str(payload)[:300])
        raise UpstreamError("The translation service returned an unexpected response.")
    return str(output)


# --- Text to speech ---------------------------------------------------------


def detect_language(text: str, supported: tuple[str, ...]) -> str:
    try:
        if not text.strip():
            raise LangDetectException(0, "empty text")
        detected = detect(text)
    except LangDetectException:
        logger.debug("language detection failed; defaulting to English")
        return "en"

    # Normalise regional tags such as "zh-cn".
    code = detected.split("-")[0]
    if code not in supported:
        logger.debug("detected language %r is not supported for TTS; using English", code)
        return "en"
    return code


async def synthesize_speech(
    client: httpx.AsyncClient,
    settings: Settings,
    *,
    text: str,
    gender: str,
    language: str | None = None,
) -> bytes:
    lang = language or detect_language(text, languages.TTS_LANGUAGES)
    response = await _call(client, settings, "tts", (lang,), json={"text": text, "gender": gender})

    content_type = response.headers.get("content-type", "")
    if content_type.startswith("audio/"):
        # The old check was `if "data" in content_type`, which tested whether the
        # literal substring "data" appeared in the header - almost never true.
        return response.content

    try:
        payload = response.json()
    except ValueError:
        return response.content  # not JSON: assume raw audio

    data = payload.get("data", payload) if isinstance(payload, dict) else {}
    if not isinstance(data, dict):
        raise UpstreamError("The speech service returned an unexpected response.")

    inner = data.get("data")
    nested: dict[str, Any] = inner if isinstance(inner, dict) else {}
    s3_url = nested.get("s3_url") or data.get("s3_url")
    if s3_url:
        audio = await client.get(s3_url)
        if audio.status_code != 200:
            raise UpstreamError("The generated audio could not be downloaded.")
        return audio.content

    for field in ("audioContent", "audio", "data"):
        value = data.get(field)
        if isinstance(value, str):
            try:
                return base64.b64decode(value)
            except (ValueError, TypeError):
                continue
        if isinstance(value, bytes):
            return value

    logger.error("unexpected TTS response keys: %s", sorted(data))
    raise UpstreamError("The speech service returned an unexpected response.")


# --- Automatic speech recognition -------------------------------------------


async def recognize_speech(
    client: httpx.AsyncClient,
    settings: Settings,
    *,
    audio_data: str,
    language: str = "en",
) -> str:
    audio = await decode_media(
        audio_data, max_bytes=settings.bhashini.max_upload_bytes, kind="audio"
    )
    filename, content_type = sniff_audio(audio)

    response = await _call(
        client,
        settings,
        "asr",
        (language.lower(),),
        files={"audio_file": (filename, audio, content_type)},
    )
    payload = response.json()
    text = _extract(
        payload,
        ("recognized_text", "transcription", "text", "transcribed_text"),
    )
    if text is None:
        logger.error("unexpected ASR response shape: %s", str(payload)[:300])
        raise UpstreamError("No speech could be recognised in that recording.")
    return text


# --- Optical character recognition ------------------------------------------


async def extract_text(
    client: httpx.AsyncClient,
    settings: Settings,
    *,
    image_data: str,
    language: str = "en",
) -> str:
    image = await decode_media(
        image_data, max_bytes=settings.bhashini.max_upload_bytes, kind="image"
    )
    filename, content_type = sniff_image(image)

    response = await _call(
        client,
        settings,
        "ocr",
        (language.lower(),),
        files={"file": (filename, image, content_type)},
    )
    payload = response.json()
    text = _extract(payload, ("decoded_text", "text", "extracted_text"))
    if text is None:
        logger.error("unexpected OCR response shape: %s", str(payload)[:300])
        raise UpstreamError("No text could be read from that image.")
    return text


def _extract(payload: Any, fields: tuple[str, ...]) -> str | None:
    """Pull the first present field, checking ``data`` then the top level."""
    if not isinstance(payload, dict):
        return None

    if payload.get("status") == "error" or payload.get("error"):
        message = payload.get("message") or payload.get("error")
        raise UpstreamError(str(message) if message else "The service reported an error.")

    nested = payload.get("data")
    for source in (nested if isinstance(nested, dict) else {}, payload):
        for field in fields:
            value = source.get(field)
            if isinstance(value, str) and value.strip():
                return value
    return None
