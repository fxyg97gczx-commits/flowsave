# FlowSave 빠른 재시작 (빌드 테스트 생략)
Set-Location $PSScriptRoot

Write-Host "FlowSave 재시작..." -ForegroundColor Cyan

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[오류] npm 없음" -ForegroundColor Red
    Read-Host "Enter"
    exit 1
}

try {
    Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
} catch { }

if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

if (-not (Test-Path "node_modules")) { npm install }

Write-Host ""
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host "종료: Ctrl+C" -ForegroundColor Gray
Write-Host ""

npm run dev
