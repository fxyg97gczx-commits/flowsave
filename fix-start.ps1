# FlowSave 완전 재시작 (404/500 복구)
Set-Location $PSScriptRoot
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FlowSave 완전 재시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[오류] Node.js/npm이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "https://nodejs.org 에서 LTS 버전을 설치하세요."
    Read-Host "Enter 키를 눌러 종료"
    exit 1
}

Write-Host "[1/5] 포트 3000 사용 중인 프로세스 종료..." -ForegroundColor Yellow
try {
    Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object {
            $pid = $_.OwningProcess
            if ($pid -gt 0) {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "  - PID $pid 종료"
            }
        }
} catch {
    # Get-NetTCPConnection 미지원 시 netstat 사용
    netstat -ano | Select-String ":3000" | Select-String "LISTENING" | ForEach-Object {
        $parts = ($_ -split "\s+") | Where-Object { $_ -ne "" }
        $pid = $parts[-1]
        if ($pid -match "^\d+$") {
            taskkill /F /PID $pid 2>$null
            Write-Host "  - PID $pid 종료"
        }
    }
}

Write-Host "[2/5] 빌드 캐시(.next) 삭제..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "  - .next 삭제 완료"
}

Write-Host "[3/5] 패키지 확인..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  - npm install 실행 중 (1~3분)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[오류] npm install 실패" -ForegroundColor Red
        Read-Host "Enter 키를 눌러 종료"
        exit 1
    }
} else {
    Write-Host "  - node_modules 확인됨"
}

Write-Host "[4/5] 빌드 테스트 (오류 확인)..." -ForegroundColor Yellow
npm run build 2>&1 | Tee-Object -FilePath "build-log.txt"
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[오류] 빌드 실패! build-log.txt 파일을 확인하세요." -ForegroundColor Red
    Read-Host "Enter 키를 눌러 종료"
    exit 1
}
Write-Host "  - 빌드 성공" -ForegroundColor Green

Write-Host ""
Write-Host "[5/5] 개발 서버 시작..." -ForegroundColor Green
Write-Host ""
Write-Host "  처음엔 1~2분 걸릴 수 있습니다." -ForegroundColor Gray
Write-Host "  아래에 Local: http://localhost:3000 이 보이면 브라우저에서 접속하세요." -ForegroundColor White
Write-Host "  (Ready 문구가 안 나와도 Local 주소가 보이면 접속 가능)" -ForegroundColor Gray
Write-Host "  종료: Ctrl+C" -ForegroundColor Gray
Write-Host ""

npm run dev

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[오류] 개발 서버가 종료되었습니다." -ForegroundColor Red
    Read-Host "Enter 키를 눌러 종료"
}
