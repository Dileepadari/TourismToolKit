#!/bin/bash

echo "=============================================="
echo "  Database Reset Script"
echo "=============================================="
echo ""
echo "This script will:"
echo "1. Stop all containers"
echo "2. Start containers with RESET_DB=true"
echo "3. Clear all database tables"
echo "4. Reseed all data fresh"
echo ""
read -p "Are you sure you want to reset the database? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Reset cancelled."
    exit 1
fi

echo ""
echo "🛑 Stopping containers..."
docker compose down

echo ""
echo "🔄 Starting with database reset flag..."
RESET_DB=true docker compose up -d

echo ""
echo "📊 Checking logs..."
echo "Use 'docker compose logs backend' to monitor the reset process"
echo "Use 'docker compose logs -f backend' to follow the logs in real-time"
echo ""
echo "✅ Reset initiated! Backend will reset and reseed the database."