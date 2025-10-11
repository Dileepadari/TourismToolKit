"""
Unified seed script for initializing the Tourism Toolkit database
This script imports and runs all available seed modules
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Import individual seed functions
try:
    from .seed_users import seed_users
    print("✓ Imported seed_users")
except ImportError:
    print("⚠ Could not import seed_users")
    seed_users = None

try:
    from .seed_dictionary import seed_dictionary_data as seed_dict_module
    print("✓ Imported seed_dictionary module")
except ImportError:
    print("⚠ Could not import seed_dictionary module")
    seed_dict_module = None

try:
    from .seed_places import seed_places_data as seed_places_module
    print("✓ Imported seed_places module")
except ImportError:
    print("⚠ Could not import seed_places module")
    seed_places_module = None

try:
    from .seed_guide import seed_guide_data as seed_guide_module
    print("✓ Imported seed_guide module")
except ImportError:
    print("⚠ Could not import seed_guide module")
    seed_guide_module = None

def seed_all():
    """Run all seed functions to populate the database"""
    print("Starting database seeding...")

    # Create tables
    from app.database.db import create_tables
    create_tables()
    print("✓ Database tables created")

    # Seed users
    if seed_users:
        seed_users()
        print("✓ Users seeded")
    else:
        print("⚠ Skipping user seeding")

    # Seed dictionary entries
    if seed_dict_module:
        seed_dict_module()
        print("✓ Dictionary entries seeded")
    else:
        print("⚠ Skipping dictionary seeding")

    # Seed places
    if seed_places_module:
        seed_places_module()
        print("✓ Places seeded")
    else:
        print("⚠ Skipping places seeding")

    # Seed guide data (emergency contacts, culture tips)
    if seed_guide_module:
        seed_guide_module()
        print("✓ Guide data seeded")
    else:
        print("⚠ Skipping guide data seeding")

    print("Database seeding completed.")

if __name__ == "__main__":
    seed_all()
