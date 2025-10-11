#!/bin/bash
set -e

echo "=============================================="
echo "  Database Initialization Script"
echo "=============================================="

# Check if RESET_DB flag is set
if [ "${RESET_DB:-false}" = "true" ]; then
  echo "🔄 RESET_DB flag is set. Will reset database..."
  FORCE_RESET=true
else
  FORCE_RESET=false
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Check if database is accessible
until python -c "from app.database.db import engine; engine.connect()" 2>/dev/null; do
  echo "Database is unavailable - waiting..."
  sleep 2
done

echo "✓ Database is ready!"

# Handle database reset if flag is set
if [ "$FORCE_RESET" = "true" ]; then
  echo ""
  echo "🗑️  Dropping all tables for database reset..."
  
  python -c "
from app.database.db import engine
from app.database.models import SQLModel
from sqlalchemy import text

# Drop all tables
SQLModel.metadata.drop_all(engine)
print('✓ All tables dropped successfully!')
"
  
  echo "📋 Creating fresh tables..."
  python -c "
from app.database.db import engine
from app.database.models import SQLModel
SQLModel.metadata.create_all(engine)
print('✓ Fresh tables created successfully!')
"
  
  # Force seeding after reset
  FORCE_SEED=true
  
else
  # Check if tables exist
  echo ""
  echo "Checking if tables exist..."
  TABLE_CHECK=$(python -c "
from app.database.db import engine
from sqlalchemy import inspect

inspector = inspect(engine)
tables = inspector.get_table_names()
print(len(tables))
" 2>/dev/null || echo "0")

  if [ "$TABLE_CHECK" = "0" ]; then
    echo "⚠️  No tables found. Creating tables..."
    
    # Create tables using SQLModel instead of Alembic for simplicity
    python -c "
from app.database.db import engine
from app.database.models import SQLModel
SQLModel.metadata.create_all(engine)
print('✓ Tables created successfully!')
"
    
    # Force seeding for new tables
    FORCE_SEED=true
    
  else
    echo "✓ Tables already exist (found $TABLE_CHECK tables)"
    FORCE_SEED=false
  fi
fi

# Check if data exists
echo ""
echo "Checking if seed data exists..."
DATA_CHECK=$(python -c "
from app.database.db import SessionLocal
from app.database.models import DictionaryEntry, Place, EmergencyContact, CultureTip

db = SessionLocal()
try:
    dict_count = db.query(DictionaryEntry).count()
    places_count = db.query(Place).count()
    emergency_count = db.query(EmergencyContact).count()
    culture_count = db.query(CultureTip).count()
    
    total = dict_count + places_count + emergency_count + culture_count
    print(f'{total},{dict_count},{places_count},{emergency_count},{culture_count}')
finally:
    db.close()
" 2>/dev/null || echo "0,0,0,0,0")

IFS=',' read -r TOTAL DICT PLACES EMERGENCY CULTURE <<< "$DATA_CHECK"

echo "  - Dictionary entries: $DICT"
echo "  - Tourist places: $PLACES"
echo "  - Emergency contacts: $EMERGENCY"
echo "  - Culture tips: $CULTURE"
echo "  - Total records: $TOTAL"

if [ "$FORCE_SEED" = "true" ] || [ "$TOTAL" -eq "0" ]; then
  echo ""
  if [ "$FORCE_SEED" = "true" ]; then
    echo "🌱 Force seeding database (reset mode or fresh tables)..."
  else
    echo "⚠️  No data found. Seeding database..."
  fi
  echo ""
  
  python -c "from app.database.seed_data import seed_all; seed_all()"
  
  echo ""
  echo "✓ Database seeded successfully!"
else
  echo ""
  echo "✓ Database already contains data. Skipping seeding."
fi

echo ""
echo "=============================================="
echo "  Database initialization complete!"
echo "=============================================="
echo ""
