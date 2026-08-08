from datetime import UTC, datetime

from sqlalchemy import CheckConstraint, DateTime, Index, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

# `Field(ge=1, le=5)` is a pydantic-only constraint: it validates objects built in
# Python and does nothing for seeds, bulk loads or raw SQL. Declaring it here too
# is what makes it real, and keeps model metadata in step with the migration.
_RATING_RANGE = "rating IS NULL OR (rating >= 1 AND rating <= 5)"

# Every timestamp is stored as TIMESTAMPTZ. Without `timezone=True` SQLAlchemy
# silently strips the offset on write, and the aware value read back is naive -
# which makes any comparison against `utcnow()` raise.
UTC_TIMESTAMP = DateTime(timezone=True)
# NOTE: the `# type: ignore[call-overload]` on each timestamp below is a SQLModel
# typing gap - `sa_type` is supported at runtime but absent from Field's overloads.


def utcnow() -> datetime:
    """Timezone-aware UTC now.

    Replaces ``datetime.utcnow``, which is deprecated in 3.12+ and returns a
    naive datetime that silently compares wrong against aware ones.
    """
    return datetime.now(UTC)


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    password_hash: str
    full_name: str | None = None
    profile_picture: str | None = None
    preferred_language: str = Field(default="en")
    preferred_theme: str = Field(default="light")
    home_country: str | None = None
    is_verified: bool = Field(default=False)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utcnow, sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]
    updated_at: datetime | None = Field(default=None, sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]

    # Relationships
    dictionary_entries: list["DictionaryEntry"] = Relationship(back_populates="user")
    travel_history: list["TravelHistory"] = Relationship(back_populates="user")


class DictionaryEntry(SQLModel, table=True):
    __tablename__ = "dictionary_entries"
    # `ilike('%term%')` cannot use a btree index; pg_trgm GIN makes those
    # leading-wildcard searches indexable.
    __table_args__ = (
        Index(
            "ix_dictionary_entries_word_trgm",
            "word",
            postgresql_using="gin",
            postgresql_ops={"word": "gin_trgm_ops"},
        ),
        Index(
            "ix_dictionary_entries_translation_trgm",
            "translation",
            postgresql_using="gin",
            postgresql_ops={"translation": "gin_trgm_ops"},
        ),
    )

    id: int | None = Field(default=None, primary_key=True)
    # Indexed: every dictionary read filters on it.
    user_id: int = Field(foreign_key="users.id", index=True)
    word: str
    translation: str
    language_from: str
    language_to: str
    pronunciation: str | None = None
    usage_example: str | None = None
    tags: str | None = None  # JSON string of tags
    is_favorite: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utcnow, sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]
    updated_at: datetime | None = Field(default=None, sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]

    # Relationships
    user: User | None = Relationship(back_populates="dictionary_entries")


class TravelHistory(SQLModel, table=True):
    __tablename__ = "travel_history"
    __table_args__ = (CheckConstraint(_RATING_RANGE, name="ck_travel_history_rating_range"),)

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    destination: str
    country: str
    visit_date: datetime = Field(sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]
    notes: str | None = None
    photos: str | None = None  # JSON string of photo URLs
    favorite_phrases: str | None = None  # JSON string of phrases
    rating: float | None = Field(default=None, ge=1, le=5)
    created_at: datetime = Field(default_factory=utcnow, sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]

    # Relationships
    user: User | None = Relationship(back_populates="travel_history")


class Place(SQLModel, table=True):
    __tablename__ = "places"
    __table_args__ = (
        CheckConstraint(_RATING_RANGE, name="ck_places_rating_range"),
        Index(
            "ix_places_name_trgm",
            "name",
            postgresql_using="gin",
            postgresql_ops={"name": "gin_trgm_ops"},
        ),
        Index(
            "ix_places_city_trgm",
            "city",
            postgresql_using="gin",
            postgresql_ops={"city": "gin_trgm_ops"},
        ),
        Index("ix_places_country_category", "country", "category"),
    )

    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str | None = None
    country: str
    state: str | None = None
    city: str
    latitude: float | None = None
    longitude: float | None = None
    category: str | None = None
    images: str | None = None  # JSON string of image URLs
    languages_spoken: str | None = None  # JSON string of language codes
    best_time_to_visit: str | None = None
    entry_fee: float | None = None
    rating: float | None = Field(default=None, ge=1, le=5)
    cultural_info: str | None = None
    emergency_contacts: str | None = None  # JSON string
    local_customs: str | None = None
    created_at: datetime = Field(default_factory=utcnow, sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]


class EmergencyContact(SQLModel, table=True):
    __tablename__ = "emergency_contacts"
    __table_args__ = (Index("ix_emergency_contacts_country", "country", "is_active"),)

    id: int | None = Field(default=None, primary_key=True)
    country: str
    service_type: str  # police, medical, fire, tourist_helpline
    number: str
    description: str | None = None
    is_active: bool = Field(default=True)


class CultureTip(SQLModel, table=True):
    __tablename__ = "culture_tips"
    __table_args__ = (Index("ix_culture_tips_country_language", "country", "language"),)

    id: int | None = Field(default=None, primary_key=True)
    country: str
    tip_category: str  # etiquette, customs, food, clothing, etc.
    tip_text: str
    language: str = Field(default="en")
    importance: str = Field(default="medium")  # low, medium, high
    created_at: datetime = Field(default_factory=utcnow, sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]


class RefreshToken(SQLModel, table=True):
    """A server-side session record.

    Storing sessions here is what makes sign-out real: a stateless JWT cannot be
    revoked, so the previous single 7-day access token stayed valid until it
    expired no matter what the user did.

    Only the SHA-256 of the token is stored - a database leak must not hand the
    attacker usable sessions.
    """

    __tablename__ = "refresh_tokens"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    token_hash: str = Field(unique=True, index=True)
    # What this token may be exchanged for. Overloading another column for this
    # let a password-reset token be redeemed as a session.
    purpose: str = Field(default="session", index=True)
    expires_at: datetime = Field(sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]
    revoked_at: datetime | None = Field(default=None, sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]
    # Set when this token is rotated, so a replayed token can be traced to the
    # session that replaced it and the whole family revoked.
    replaced_by: str | None = None
    user_agent: str | None = None
    created_at: datetime = Field(default_factory=utcnow, sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]

    @property
    def is_active(self) -> bool:
        return self.revoked_at is None and self.expires_at > utcnow()


class PlaceFavorite(SQLModel, table=True):
    """A user's saved place.

    A join table rather than a column on `places`, because a place is shared
    between users and the favourite belongs to one of them.
    """

    __tablename__ = "place_favorites"
    __table_args__ = (
        # One row per user/place: favouriting twice is idempotent, not duplicated.
        UniqueConstraint("user_id", "place_id", name="uq_place_favorites_user_place"),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    place_id: int = Field(foreign_key="places.id", index=True)
    created_at: datetime = Field(default_factory=utcnow, sa_type=UTC_TIMESTAMP)  # type: ignore[call-overload]
