#!/bin/bash

# AutoPilot Job Application System - Quick Start Script

echo "🚀 Starting AutoPilot Job Application System..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Warning: Ollama is not running or not accessible."
    echo "   Please start Ollama: ollama serve"
    echo ""
fi

# Check if dependencies are installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip3 install -r requirements.txt
    echo ""
fi

# Check if Playwright browsers are installed
if ! python3 -c "from playwright.sync_api import sync_playwright" 2>/dev/null; then
    echo "📦 Installing Playwright browsers..."
    playwright install chromium
    echo ""
fi

# Start the Flask dashboard
echo "✅ Starting dashboard..."
echo "   Open your browser to: http://localhost:5000"
echo ""
python3 app.py

