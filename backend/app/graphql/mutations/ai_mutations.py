"""Translation, speech and OCR mutations.

Failures are reported through each type's ``success``/``message`` envelope, but
the messages are now the service layer's user-safe strings. The previous versions
interpolated raw exception text, leaking upstream URLs and internal errors to any
caller.
"""

from __future__ import annotations

import base64
import logging

import strawberry

from app.graphql.context import Info
from app.graphql.types.ai_types import (
    ASRInput,
    ASRResponse,
    MTInput,
    MTResponse,
    OCRInput,
    OCRResponse,
    TTSInput,
    TTSResponse,
)
from app.services import bhashini
from app.services.http import BhashiniNotConfigured
from app.services.media import InvalidPayload, PayloadTooLarge

logger = logging.getLogger(__name__)

# Conditions whose message is safe to show the user as-is.
SAFE_ERRORS = (
    bhashini.UpstreamError,
    BhashiniNotConfigured,
    InvalidPayload,
    PayloadTooLarge,
)


@strawberry.type
class MTMutation:
    @strawberry.mutation
    async def translate_text(self, info: Info, input: MTInput) -> MTResponse:
        try:
            translated = await bhashini.translate(
                info.context.http,
                info.context.settings,
                text=input.text,
                source_lang=input.source_lang,
                target_lang=input.target_lang,
            )
        except SAFE_ERRORS as exc:
            return MTResponse(
                success=False,
                translated_text=None,
                message=str(exc),
                source_lang=input.source_lang,
                target_lang=input.target_lang,
            )
        except Exception:
            logger.exception("translation failed")
            return MTResponse(
                success=False,
                translated_text=None,
                message="Translation failed. Please try again.",
                source_lang=input.source_lang,
                target_lang=input.target_lang,
            )

        return MTResponse(
            success=True,
            translated_text=translated,
            message="Text translated successfully",
            source_lang=input.source_lang,
            target_lang=input.target_lang,
        )


@strawberry.type
class TTSMutation:
    @strawberry.mutation
    async def generate_speech(self, info: Info, input: TTSInput) -> TTSResponse:
        try:
            audio = await bhashini.synthesize_speech(
                info.context.http,
                info.context.settings,
                text=input.text,
                gender=input.gender,
            )
        except SAFE_ERRORS as exc:
            return TTSResponse(success=False, message=str(exc))
        except Exception:
            logger.exception("speech generation failed")
            return TTSResponse(success=False, message="Speech generation failed.")

        encoded = base64.b64encode(audio).decode("utf-8")
        return TTSResponse(
            success=True,
            message="Speech generated successfully",
            audio_content=f"data:audio/mp3;base64,{encoded}",
        )


@strawberry.type
class OCRMutation:
    @strawberry.mutation
    async def extract_text_from_image(self, info: Info, input: OCRInput) -> OCRResponse:
        try:
            text = await bhashini.extract_text(
                info.context.http,
                info.context.settings,
                image_data=input.image_data,
                language=input.language,
            )
        except SAFE_ERRORS as exc:
            return OCRResponse(success=False, message="Failed to extract text", error=str(exc))
        except Exception:
            logger.exception("OCR failed")
            return OCRResponse(
                success=False, message="Failed to extract text", error="Please try again."
            )

        return OCRResponse(
            success=True,
            message="Text extracted successfully",
            extracted_text=text,
            language=input.language,
        )


@strawberry.type
class ASRMutation:
    @strawberry.mutation
    async def transcribe_audio(self, info: Info, input: ASRInput) -> ASRResponse:
        try:
            text = await bhashini.recognize_speech(
                info.context.http,
                info.context.settings,
                audio_data=input.audio_data,
                language=input.language,
            )
        except SAFE_ERRORS as exc:
            return ASRResponse(success=False, message="Failed to transcribe audio", error=str(exc))
        except Exception:
            logger.exception("speech recognition failed")
            return ASRResponse(
                success=False,
                message="Failed to transcribe audio",
                error="Please try again.",
            )

        return ASRResponse(
            success=True,
            message="Audio transcribed successfully",
            transcribed_text=text,
            language=input.language,
        )
