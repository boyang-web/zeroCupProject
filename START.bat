@echo off
cd /d "%~dp0"
call npm run build
if errorlevel 1 (
  echo Build failed. Preview was not started. Run npm ci if dependencies are missing.
  pause
  exit /b 1
)
python scripts\preview.py
if errorlevel 1 pause
