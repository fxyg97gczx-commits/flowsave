@echo off
chcp 65001 >nul
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0fix-start.ps1"

if errorlevel 1 (
    echo.
    echo [오류] fix-start.ps1 실행 실패
    pause
)
