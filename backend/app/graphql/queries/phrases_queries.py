from __future__ import annotations

import strawberry

from app.graphql.types.tourism_types import Phrase, PhrasesResponse
from app.services import phrases


@strawberry.type
class PhrasesQuery:
    @strawberry.field
    def get_common_phrases(self, language: str = "en") -> PhrasesResponse:
        return PhrasesResponse(
            phrases=[Phrase(phrase=text, category=cat) for text, cat in phrases.common(language)]
        )

    @strawberry.field
    def get_emergency_phrases(self, language: str = "en") -> PhrasesResponse:
        return PhrasesResponse(
            phrases=[Phrase(phrase=text, category=cat) for text, cat in phrases.emergency(language)]
        )
