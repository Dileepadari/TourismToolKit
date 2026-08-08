"""Decoding and validating client-supplied base64 media.

``asr.py`` and ``ocr.py`` each decoded unbounded, client-supplied base64 on an
*unauthenticated* mutation with no size cap - a trivial memory exhaustion. They
also duplicated magic-byte sniffing.
"""

from __future__ import annotations

import asyncio
import base64
import binascii
import logging

logger = logging.getLogger(__name__)


class PayloadTooLarge(Exception):
    pass


class InvalidPayload(Exception):
    pass


def _strip_data_uri(payload: str) -> str:
    # "data:image/png;base64,AAAA" -> "AAAA"
    if "," in payload:
        return payload.split(",", 1)[1]
    return payload


async def decode_media(payload: str, *, max_bytes: int, kind: str) -> bytes:
    """Decode base64 media, refusing oversized input *before* allocating it."""
    raw = _strip_data_uri(payload).strip()
    if not raw:
        raise InvalidPayload(f"No {kind} data was provided.")

    # base64 inflates by 4/3, so the decoded size is knowable without decoding.
    approx_bytes = len(raw) * 3 // 4
    if approx_bytes > max_bytes:
        raise PayloadTooLarge(
            f"The {kind} is too large ({approx_bytes // 1024}KB); "
            f"the limit is {max_bytes // 1024}KB."
        )

    try:
        # Decoding several MB is CPU-bound; keep it off the event loop.
        return await asyncio.to_thread(base64.b64decode, raw, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise InvalidPayload(f"The {kind} data is not valid base64.") from exc


def sniff_audio(data: bytes) -> tuple[str, str]:
    """Return ``(filename, content_type)`` for an audio blob."""
    if data.startswith(b"RIFF"):
        return "audio.wav", "audio/wav"
    if data.startswith((b"\xff\xfb", b"\xff\xf3", b"ID3")):
        return "audio.mp3", "audio/mpeg"
    if data.startswith(b"OggS"):
        return "audio.ogg", "audio/ogg"
    if data[4:8] == b"ftyp":
        return "audio.m4a", "audio/mp4"
    return "audio.wav", "audio/wav"


def sniff_image(data: bytes) -> tuple[str, str]:
    """Return ``(filename, content_type)`` for an image blob."""
    if data.startswith(b"\xff\xd8\xff"):
        return "image.jpg", "image/jpeg"
    if data.startswith(b"\x89PNG"):
        return "image.png", "image/png"
    if data.startswith((b"GIF87a", b"GIF89a")):
        return "image.gif", "image/gif"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "image.webp", "image/webp"
    return "image.jpg", "image/jpeg"
