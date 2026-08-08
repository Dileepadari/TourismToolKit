"""Populate the database with the curated starter content.

Schema creation is *not* done here any more - Alembic owns it. The previous
version called ``create_tables()`` and wrapped every import in a bare
``except ImportError`` that printed a warning and carried on, so a genuine error
inside a seed module looked identical to that module being absent.
"""

from __future__ import annotations

import logging

from app.database.seed_dictionary import seed_dictionary_data
from app.database.seed_guide import seed_guide_data
from app.database.seed_places import seed_places_data
from app.database.seed_users import seed_users

logger = logging.getLogger(__name__)

# Users first: dictionary entries are foreign-keyed to the system user.
SEEDERS = (
    ("users", seed_users),
    ("dictionary", seed_dictionary_data),
    ("places", seed_places_data),
    ("guide", seed_guide_data),
)


def seed_all() -> None:
    logger.info("seeding database")
    for name, seeder in SEEDERS:
        seeder()
        logger.info("seeded %s", name)
    logger.info("seeding complete")


def main() -> None:
    from app.core.config import get_settings
    from app.core.logging import configure_logging

    configure_logging(get_settings())
    seed_all()


if __name__ == "__main__":
    main()
