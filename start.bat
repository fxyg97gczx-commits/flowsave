@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   FlowSave 시작
echo ========================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
    echo [오류] Node.js가 없습니다. https://nodejs.org 에서 설치하세요.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo 패키지 설치 중...
    call npm install
    if errorlevel 1 ( pause & exit /b 1 )
)

echo 포트 3000 정리 중...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

if exist ".next" (
    echo 캐시 정리 중...
    rmdir /s /q .next
)

echo.
echo 서버 시작 중... (1~2분 걸릴 수 있음)
echo.
echo   http://localhost:3000
echo.
call npm run dev

pause
