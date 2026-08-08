"""Which languages each service supports.

Consolidates four near-identical query modules that each declared their own
``Language`` type.
"""

from __future__ import annotations

import strawberry

from app.graphql.types.common import Language, LanguagesResponse
from app.services import languages


@strawberry.type
class LanguageQuery:
    @strawberry.field
    def get_supported_languages(self) -> LanguagesResponse:
        """Every language the platform can do something with.

        The frontend has queried this field from the settings and dictionary
        pages since those pages were written, but it never existed on the schema
        - both requests failed silently under Apollo's `errorPolicy: 'all'`.
        """
        return LanguagesResponse.from_dicts(languages.all_supported())

    @strawberry.field
    def supported_languages(self) -> list[Language]:
        """Text-to-speech coverage."""
        return [Language.from_dict(item) for item in languages.as_dicts(languages.TTS_LANGUAGES)]

    @strawberry.field
    def supported_mt_languages(self) -> list[Language]:
        return [Language.from_dict(item) for item in languages.as_dicts(languages.MT_LANGUAGES)]

    @strawberry.field
    def supported_asr_languages(self) -> list[Language]:
        return [Language.from_dict(item) for item in languages.as_dicts(languages.ASR_LANGUAGES)]

    @strawberry.field
    def supported_ocr_languages(self) -> LanguagesResponse:
        # Wrapper shape, unlike its siblings, because the frontend document
        # selects `supportedOcrLanguages { languages { code name } }`.
        return LanguagesResponse.from_dicts(languages.as_dicts(languages.OCR_LANGUAGES))
