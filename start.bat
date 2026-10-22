@echo off
title TeleTerm - 24/7 Mobile Remote Terminal
cd /d "%~dp0"

echo ===================================================
echo     TeleTerm: Server Dieu Khien Terminal 24/7
echo ===================================================
echo.

if not exist node_modules (
    echo [TeleTerm] Dang cai dat thu vien lan dau...
    call npm install
)

:: Tu dong mo trang Quet Ma QR Cloudflare tren trinh duyet laptop sau 2 giay
start "" /B cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:4000/qr"

:loop
echo.
:: Kiem tra va giai phong port 4000 neu co tien trinh node cu bi treo
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R /C:":4000 .*LISTENING"') do (
    if "%%a" neq "0" (
        echo [TeleTerm] Phat hien tien trinh cu chiem port 4000 (PID: %%a). Dang giai phong...
        taskkill /PID %%a /F >nul 2>&1
        timeout /t 1 /nobreak >nul
    )
)

echo [TeleTerm] Dang khoi dong Server va He thong Giu Nguon...
node src/server/index.js

set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% equ 0 (
    echo.
    echo [TeleTerm] Server da dung hoat dong theo yeu cau.
    pause
    exit /b 0
)

echo.
echo [CANH BAO] Server bi thoat dot ngot (Exit Code: %EXIT_CODE%).
echo [TeleTerm] Tu dong khoi dong lai sau 3 giay de duy tri ket noi 24/7...
echo [TeleTerm] (Nhan Ctrl+C neu ban muon dung Server hoan toan)
timeout /t 3 /nobreak >nul
goto loop
