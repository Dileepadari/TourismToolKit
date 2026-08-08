#!/bin/bash
# Destroy and rebuild the database from migrations + seed data.
set -euo pipefail

cd "$(dirname "$0")/.."

cat <<'MSG'
==============================================
  Database reset
==============================================

This will DESTROY all data in the tourism_db volume, then:
  1. recreate the schema from Alembic migrations
  2. reseed the starter content

MSG

read -p "Reset the database? (y/N): " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || { echo "Cancelled."; exit 1; }

echo "==> Stopping containers and removing the database volume"
# `down -v` is what actually drops the data. The previous version ran a bare
# `down`, so the volume survived and the "reset" relied on an init script that
# silently failed.
docker compose down -v

echo "==> Starting with seeding enabled"
SEED_DB=true docker compose up -d --build --renew-anon-volumes

echo "==> Waiting for the backend to become healthy"
for _ in $(seq 1 60); do
    status=$(docker inspect --format '{{.State.Health.Status}}' tourism-backend 2>/dev/null || echo starting)
    [ "$status" = "healthy" ] && { echo "Backend is healthy."; break; }
    sleep 2
done

echo
echo "Done. Follow progress with: docker compose logs -f backend"
