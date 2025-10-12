#!/bin/bash

# TourismToolKit Startup Script
echo "🌍 Starting TourismToolKit - Your AI-Powered Travel Companion"
echo "============================================================="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo "🚀 Starting Backend Server..."
    cd backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "📦 Creating Python virtual environment..."
        python3 -m venv venv
        echo "✅ Virtual environment created"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies if needed
    if [ ! -f "venv/pyvenv.cfg" ] || [ "requirements.txt" -nt "venv/pyvenv.cfg" ]; then
        echo "📦 Installing Python dependencies..."
        pip install -r requirements.txt
        echo "✅ Dependencies installed"
    fi
    
    # Start the server
    echo "🔥 Starting FastAPI server on http://localhost:8000"
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    
    # Wait a moment for server to start
    sleep 3
    
    if check_port 8000; then
        echo "✅ Backend server started successfully!"
        echo "📊 GraphQL Playground: http://localhost:8000/graphql"
    else
        echo "❌ Backend server failed to start"
        exit 1
    fi
    
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend Server..."
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing Node.js dependencies..."
        npm install
        echo "✅ Dependencies installed"
    fi
    
    # Start the development server
    echo "🔥 Starting Next.js server on http://localhost:3000"
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait a moment for server to start
    sleep 5
    
    if check_port 3000; then
        echo "✅ Frontend server started successfully!"
        echo "🌐 Application: http://localhost:3000"
    else
        echo "❌ Frontend server failed to start"
        exit 1
    fi
    
    cd ..
}

# Function to display running services
show_services() {
    echo ""
    echo "🎉 TourismToolKit is now running!"
    echo "================================="
    echo "🎨 Frontend:       http://localhost:3000"
    echo "🚀 Backend API:    http://localhost:8000"
    echo "📊 GraphQL:        http://localhost:8000/graphql"
    echo ""
    echo "🌟 Features Available:"
    echo "   • User Authentication (Login/Register)"
    echo "   • Multi-Language Translation (10+ Indian languages)"
    echo "   • OCR Scanner for images"
    echo "   • Voice Assistant (Speech-to-Text/Text-to-Speech)"
    echo "   • Personal Dictionary"
    echo "   • Places Explorer for Indian destinations"
    echo "   • Cultural Tips and Travel Insights"
    echo ""
    echo "Press Ctrl+C to stop all servers"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping TourismToolKit servers..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend server stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend server stopped"
    fi
    
    echo "👋 TourismToolKit stopped. Safe travels!"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Check if required tools are installed
echo "🔍 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed"
    exit 1
fi

echo "✅ All prerequisites are installed"
echo ""

# Check if ports are already in use
if check_port 8000; then
    echo "⚠️  Port 8000 is already in use. Please stop the existing service."
    exit 1
fi

if check_port 3000; then
    echo "⚠️  Port 3000 is already in use. Please stop the existing service."
    exit 1
fi

# Start services
start_backend
start_frontend
show_services

# Keep script running
while true; do
    sleep 1
done