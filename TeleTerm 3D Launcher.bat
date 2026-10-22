@echo off
title TeleTerm 3D — Game Launcher
cd /d "%~dp0"

echo ========================================================
echo            TELETERM 3D — OFFICIAL DESKTOP CLIENT
echo ========================================================
echo.

:: 1. Kiem tra xem Server Node.js (cong 4000) da chay chua
netstat -ano | findstr :4000 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo [*] Server TeleTerm (cong 4000) da san sang.
) else (
    echo [*] Server chua chay, dang tu dong khoi dong Server o background...
    start "TeleTerm Backend Server" /min cmd /c "node src/server/index.js"
    timeout /t 2 /nobreak >nul
)

:: 2. Uu tien khoi dong ban Release build neu co
if exist "dist\win-unpacked\TeleTerm.exe" (
    echo [*] Dang khoi dong TeleTerm tu dist\win-unpacked...
    start "" "dist\win-unpacked\TeleTerm.exe"
    exit /b 0
)

if exist "E:\Teleterm\TeleTerm.exe" (
    echo [*] Dang khoi dong TeleTerm tu E:\Teleterm...
    start "" "E:\Teleterm\TeleTerm.exe"
    exit /b 0
)

:: 3. Khoi dong qua Electron Dev Client
echo [*] Dang khoi dong TeleTerm Desktop Client...
call npm run desktop
