#!/bin/bash
# backend/start-backend.sh

# Activate the virtual environment
source venv/bin/activate

# Run uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 9000 --reload
