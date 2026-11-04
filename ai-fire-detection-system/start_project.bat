@echo off
TITLE AI-Based Smart Fire Detection and Prevention System - Launcher
COLOR 0B

echo ===============================================================================
echo   AI-BASED SMART FIRE DETECTION AND PREVENTION SYSTEM (IoT ^& Machine Learning)
echo ===============================================================================
echo.

:: 1. Check Python
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in system PATH!
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b
)
echo [OK] Python is available.

:: 2. Check Node.js
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in system PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b
)
echo [OK] Node.js is available.
echo.

:: 3. Setup Python Backend Environment
echo -------------------------------------------------------------------------------
echo [1/4] Setting up Python Virtual Environment and Installing Dependencies...
echo -------------------------------------------------------------------------------
cd backend
IF NOT EXIST "venv" (
    echo Creating virtual environment in backend\venv...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo Installing requirements.txt...
pip install -r requirements.txt --quiet
cd ..

:: 4. Train AI Model
echo -------------------------------------------------------------------------------
echo [2/4] Training Machine Learning Fire Risk Model on Dataset...
echo -------------------------------------------------------------------------------
cd ml
python train_model.py
cd ..

:: 5. Setup Frontend
echo -------------------------------------------------------------------------------
echo [3/4] Installing Frontend NPM Dependencies...
echo -------------------------------------------------------------------------------
cd frontend
call npm install --silent
cd ..

:: 6. Launch Backend & Frontend in separate windows
echo -------------------------------------------------------------------------------
echo [4/4] Launching FastAPI Backend (Port 8000) and React Frontend (Port 3000)...
echo -------------------------------------------------------------------------------
start "FastAPI Backend (Port 8000)" cmd /k "cd backend && call venv\Scripts\activate.bat && python main.py"
start "React Vite Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ===============================================================================
echo [SUCCESS] System Started Successfully!
echo   * Web Dashboard:  http://localhost:3000
echo   * Backend API:    http://localhost:8000
echo   * API Docs:       http://localhost:8000/docs
echo   * Default Login:  admin / admin123  (or operator / operator123)
echo ===============================================================================
echo.
pause
