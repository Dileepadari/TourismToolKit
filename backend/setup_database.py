#!/usr/bin/env python3
"""
First-time setup script for Tourism ToolKit
This script initializes the database and seeds all necessary data
"""
import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlmodel import SQLModel
from app.database.db import engine
from app.database.models import User, DictionaryEntry, Place, EmergencyContact, CultureTip

# Import all seed functions
from app.database.seed_users import seed_users
from app.database.seed_dictionary import seed_dictionary
from app.database.seed_places import seed_places
from app.database.seed_guide import seed_guide


def print_header(title: str):
    """Print a formatted header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def create_tables():
    """Create all database tables"""
    print_header("CREATING DATABASE TABLES")
    try:
        SQLModel.metadata.create_all(engine)
        print("✓ All database tables created successfully")
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        sys.exit(1)


def seed_all_data():
    """Run all seed scripts"""
    print_header("SEEDING DATABASE")
    
    seed_functions = [
        ("Users", seed_users),
        ("Dictionary Entries", seed_dictionary),
        ("Tourist Places", seed_places),
        ("Guide Data (Emergency Contacts & Culture Tips)", seed_guide),
    ]
    
    for name, seed_func in seed_functions:
        try:
            print(f"\n📦 Seeding {name}...")
            seed_func()
        except Exception as e:
            print(f"✗ Error seeding {name}: {e}")
            import traceback
            traceback.print_exc()
            # Continue with other seeds even if one fails


def main():
    """Main setup function"""
    print_header("TOURISM TOOLKIT - FIRST TIME SETUP")
    print("\nThis script will:")
    print("  1. Create all database tables")
    print("  2. Seed initial data (users, dictionary, places, guide)")
    print("\n⚠️  WARNING: This should only be run once during initial setup!")
    
    # Ask for confirmation
    response = input("\nDo you want to continue? (yes/no): ").lower().strip()
    if response not in ['yes', 'y']:
        print("Setup cancelled.")
        sys.exit(0)
    
    # Step 1: Create tables
    create_tables()
    
    # Step 2: Seed data
    seed_all_data()
    
    # Final message
    print_header("SETUP COMPLETE!")
    print("\n✓ Database setup completed successfully!")
    print("\nYou can now start the application with:")
    print("  cd backend")
    print("  python3 -m uvicorn app.main:app --reload --port 8000")
    print("\nOr use PM2:")
    print("  pm2 start ecosystem.config.js")
    print("\n" + "=" * 70 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSetup interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Setup failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
