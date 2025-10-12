#!/bin/bash
# backend/start-backend.sh

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Activate the virtual environment
source venv/bin/activate

# Use PORT environment variable if set, otherwise default to 8000
PORT=${PORT:-8000}

# Run uvicorn
uvicorn app.main:app --host 0.0.0.0 --port $PORT --reload
