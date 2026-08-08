"""Domain GraphQL types.

Each type that mirrors a database row carries a ``from_model`` classmethod. The
conversion blocks used to be copy-pasted six times for ``DictionaryEntry`` alone
(including the identical ``tags.split(",")``) and three times for ``Place``.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import TYPE_CHECKING

import strawberry

if TYPE_CHECKING:
    from app.database import models

logger = logging.getLogger(__name__)


def _json_list(raw: str | None, *, field: str, row_id: int | None) -> list[str]:
    """Decode a JSON-encoded list column, tolerating malformed rows.

    The previous code called ``json.loads`` unguarded in three places, so a
    single bad row took out the whole resolver rather than that one field.
    """
    if not raw:
        return []
    try:
        value = json.loads(raw)
    except (TypeError, ValueError):
        logger.warning("row id=%s has malformed JSON in %s; treating as empty", row_id, field)
        return []
    return [str(item) for item in value] if isinstance(value, list) else []


@strawberry.type
class User:
    id: int
    email: str
    username: str
    full_name: str | None
    profile_picture: str | None
    preferred_language: str
    preferred_theme: str
    home_country: str | None
    is_verified: bool
    created_at: datetime

    @classmethod
    def from_model(cls, user: models.User) -> User:
        assert user.id is not None
        return cls(
            id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            profile_picture=user.profile_picture,
            preferred_language=user.preferred_language,
            preferred_theme=user.preferred_theme,
            home_country=user.home_country,
            is_verified=user.is_verified,
            created_at=user.created_at,
        )


@strawberry.type
class AuthResponse:
    success: bool
    message: str
    token: str | None
    user: User | None


@strawberry.type
class DeleteResponse:
    success: bool
    message: str


@strawberry.type
class FavoriteResponse:
    success: bool
    message: str
    is_favorite: bool


@strawberry.type
class ProfileResponse:
    success: bool
    message: str
    user: User | None


@strawberry.type
class SessionInfo:
    id: int
    user_agent: str | None
    created_at: datetime
    expires_at: datetime
    is_current: bool


@strawberry.type
class PasswordResetResponse:
    success: bool
    message: str


@strawberry.type
class LogoutResponse:
    success: bool
    message: str
    sessions_ended: int


@strawberry.input
class RegisterInput:
    email: str
    username: str
    password: str
    full_name: str | None = None
    preferred_language: str = "en"
    preferred_theme: str = "light"
    home_country: str | None = None


@strawberry.input
class LoginInput:
    email: str
    password: str


@strawberry.type
class Place:
    id: int
    name: str
    description: str | None
    country: str
    state: str | None
    city: str
    latitude: float | None
    longitude: float | None
    category: str | None
    images: list[str] | None
    languages_spoken: list[str] | None
    best_time_to_visit: str | None
    entry_fee: float | None
    rating: float | None

    @classmethod
    def from_model(cls, place: models.Place) -> Place:
        assert place.id is not None
        return cls(
            id=place.id,
            name=place.name,
            description=place.description,
            country=place.country,
            state=place.state,
            city=place.city,
            latitude=place.latitude,
            longitude=place.longitude,
            category=place.category,
            images=_json_list(place.images, field="images", row_id=place.id),
            languages_spoken=_json_list(
                place.languages_spoken, field="languages_spoken", row_id=place.id
            ),
            best_time_to_visit=place.best_time_to_visit,
            entry_fee=place.entry_fee,
            rating=place.rating,
        )


@strawberry.type
class DictionaryEntry:
    id: int
    word: str
    translation: str
    language_from: str
    language_to: str
    pronunciation: str | None
    usage_example: str | None
    tags: list[str] | None
    is_favorite: bool
    created_at: datetime

    @classmethod
    def from_model(cls, entry: models.DictionaryEntry) -> DictionaryEntry:
        assert entry.id is not None
        return cls(
            id=entry.id,
            word=entry.word,
            translation=entry.translation,
            language_from=entry.language_from,
            language_to=entry.language_to,
            pronunciation=entry.pronunciation,
            usage_example=entry.usage_example,
            tags=[tag for tag in entry.tags.split(",") if tag] if entry.tags else None,
            is_favorite=entry.is_favorite,
            created_at=entry.created_at,
        )


@strawberry.input
class DictionaryInput:
    word: str
    translation: str
    language_from: str
    language_to: str
    pronunciation: str | None = None
    usage_example: str | None = None
    tags: list[str] | None = None
    is_favorite: bool = False


@strawberry.type
class DictionaryResponse:
    success: bool
    message: str
    entry: DictionaryEntry | None

    @classmethod
    def failure(cls, message: str) -> DictionaryResponse:
        return cls(success=False, message=message, entry=None)


@strawberry.type
class TravelHistory:
    id: int
    destination: str
    country: str
    visit_date: datetime | None
    notes: str | None
    photos: list[str] | None
    favorite_phrases: list[str] | None
    created_at: datetime

    @classmethod
    def from_model(cls, trip: models.TravelHistory) -> TravelHistory:
        assert trip.id is not None
        return cls(
            id=trip.id,
            destination=trip.destination,
            country=trip.country,
            visit_date=trip.visit_date,
            notes=trip.notes,
            photos=_json_list(trip.photos, field="photos", row_id=trip.id),
            favorite_phrases=_json_list(
                trip.favorite_phrases, field="favorite_phrases", row_id=trip.id
            ),
            created_at=trip.created_at,
        )


@strawberry.input
class TravelHistoryInput:
    destination: str
    country: str
    visit_date: datetime | None = None
    notes: str | None = None
    photos: list[str] | None = None
    favorite_phrases: list[str] | None = None


@strawberry.type
class EmergencyContact:
    id: int
    country: str
    service_type: str
    number: str
    description: str | None

    @classmethod
    def from_model(cls, contact: models.EmergencyContact) -> EmergencyContact:
        assert contact.id is not None
        return cls(
            id=contact.id,
            country=contact.country,
            service_type=contact.service_type,
            number=contact.number,
            description=contact.description,
        )


@strawberry.type
class CultureTip:
    id: int
    country: str
    tip_category: str
    tip_text: str
    language: str

    @classmethod
    def from_model(cls, tip: models.CultureTip) -> CultureTip:
        assert tip.id is not None
        return cls(
            id=tip.id,
            country=tip.country,
            tip_category=tip.tip_category,
            tip_text=tip.tip_text,
            language=tip.language,
        )


@strawberry.type
class Phrase:
    phrase: str
    category: str


@strawberry.type
class PhrasesResponse:
    phrases: list[Phrase]
