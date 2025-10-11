#!/bin/bash

# Define directories
BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"
VENV_DIR="$BACKEND_DIR/venv"

echo "Starting deployment script..."

# Step 1: Go to backend and create venv if not present
echo "Setting up backend..."
cd $BACKEND_DIR || { echo "Error: Backend directory not found!"; exit 1; }

if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv || { echo "Error: Failed to create virtual environment!"; exit 1; }
else
    echo "Virtual environment already exists."
fi

# Step 2: Activate the virtual environment
echo "Activating virtual environment..."
source venv/bin/activate || { echo "Error: Failed to activate virtual environment!"; exit 1; }

# Install backend requirements if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "Installing backend dependencies..."
    pip install -r requirements.txt
fi

# Start backend with PM2
echo "Starting backend service with PM2..."
pm2 start app.py --name backend --interpreter python || { echo "Error: Failed to start backend!"; exit 1; }

# Step 3: Go to frontend
echo "Setting up frontend..."
cd ../frontend || { echo "Error: Frontend directory not found!"; exit 1; }

# Step 4: Run npm install
echo "Installing frontend dependencies..."
npm install || { echo "Error: Failed to install frontend dependencies!"; exit 1; }

# Step 5: Start frontend with PM2
echo "Starting frontend service with PM2..."
pm2 start npm --name frontend -- start || { echo "Error: Failed to start frontend!"; exit 1; }

echo "Deployment complete! Both frontend and backend are running."
echo "Use 'pm2 status' to check running services."