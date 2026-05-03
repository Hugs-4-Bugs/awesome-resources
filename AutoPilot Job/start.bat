@echo off
REM AutoPilot Job Application System - Quick Start Script (Windows)

echo.
echo 🚀 Starting AutoPilot Job Application System...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if dependencies are installed
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing dependencies...
    pip install -r requirements.txt
    echo.
)

REM Check if Playwright browsers are installed
python -c "from playwright.sync_api import sync_playwright" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Playwright browsers...
    playwright install chromium
    echo.
)

REM Start the Flask dashboard
echo ✅ Starting dashboard...
echo    Open your browser to: http://localhost:5000
echo.
python app.py

pause

