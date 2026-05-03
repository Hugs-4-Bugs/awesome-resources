#!/bin/bash

# AutoPilot Job Application System - Run Script with Port Management

echo "🚀 Starting AutoPilot Job Application System..."
echo ""

# Kill any process using port 5000
PORT=5000
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
    echo "⚠️  Port $PORT is in use. Killing process $PID..."
    kill -9 $PID 2>/dev/null
    sleep 1
    echo "✅ Port $PORT is now free!"
    echo ""
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if dependencies are installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip3 install -r requirements.txt
    echo ""
fi

# Start the Flask dashboard
echo "✅ Starting dashboard on http://localhost:5000"
echo "   Press Ctrl+C to stop"
echo ""
python3 app.py


