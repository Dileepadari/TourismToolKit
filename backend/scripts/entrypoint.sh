#!/bin/sh
# Container entrypoint: wait for the database, bring the schema to head,
# optionally seed, then hand off to the server.
set -eu

python -m app.database.bootstrap

if [ "${SEED_DB:-false}" = "true" ]; then
    echo "SEED_DB=true - seeding database"
    python -m app.database.seed_data
fi

# `exec` matters: without it the shell stays PID 1, SIGTERM never reaches
# uvicorn, and every `docker stop` waits out the full kill timeout.
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers "${UVICORN_WORKERS:-1}" \
    ${UVICORN_EXTRA:-}
