"""Types shared across every domain.

``Language`` previously existed three times (``tts_types.Language_tts``,
``asr_queries.Language``, ``tourism_types.Language``) and ``LanguagesResponse``
twice. None collided only because no single resolver reached two of them at once
- adding one field would have made the schema fail to build.
"""

from __future__ import annotations

import strawberry


@strawberry.type
class Language:
    code: str
    name: str

    @classmethod
    def from_dict(cls, data: dict[str, str]) -> Language:
        return cls(code=data["code"], name=data["name"])


@strawberry.type
class LanguagesResponse:
    languages: list[Language]

    @classmethod
    def from_dicts(cls, data: list[dict[str, str]]) -> LanguagesResponse:
        return cls(languages=[Language.from_dict(item) for item in data])
