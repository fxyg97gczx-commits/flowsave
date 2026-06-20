# FlowSave 개발 서버 시작 스크립트
Set-Location $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FlowSave 개발 서버 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[오류] Node.js/npm이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행하세요."
    Read-Host "Enter 키를 눌러 종료"
    exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Host "[1/2] 패키지 설치 중... (최초 1회, 1~3분 소요)" -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[오류] npm install 실패" -ForegroundColor Red
        Read-Host "Enter 키를 눌러 종료"
        exit 1
    }
    Write-Host ""
}

Write-Host "[2/2] 개발 서버 시작 중..." -ForegroundColor Green
Write-Host ""
Write-Host "  브라우저에서 열기: http://localhost:3000" -ForegroundColor White
Write-Host "  종료: Ctrl+C" -ForegroundColor Gray
Write-Host ""
npm run dev
