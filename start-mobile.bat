@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   FlowSave 모바일 테스트용 서버
echo ========================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
    echo [오류] Node.js/npm이 설치되어 있지 않습니다.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo 패키지 설치 중...
    call npm install
)

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo   PC와 폰이 같은 Wi-Fi에 연결되어 있어야 합니다.
echo.
echo   폰 브라우저에서 접속:
echo   http://%IP%:3000
echo.
echo   PWA/알림까지 테스트하려면 ngrok 또는 Vercel 배포를 사용하세요.
echo   종료: Ctrl+C
echo.
call npm run dev:mobile
