@echo off
chcp 65001 >nul
title TeleTerm 24/7 Controller & Tunnel
cd /d "%~dp0"

echo ================================================================
echo       🚀  TELE-TERM : 24/7 REMOTE TERMINAL CONTROLLER  🚀
echo ================================================================
echo [1/3] Đang kiểm tra cổng 4000...
netstat -ano | findstr :4000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [OK] Máy chủ TeleTerm đang chạy sẵn trên cổng 4000!
) else (
    echo [2/3] Đang khởi động máy chủ TeleTerm kèm Cloudflare Tunnel và Away Mode...
    start /min "TeleTerm Server Daemon" cmd /k "node src/server/index.js"
    timeout /t 3 /nobreak >nul
)

echo [3/3] Đang mở giao diện trên trình duyệt...
start "" "http://localhost:4000"

echo ================================================================
echo  ✅ HỆ THỐNG ĐÃ SẴN SÀNG!
echo  👉 Xem mã QR hoặc link 4G/5G tại tab vừa mở trên trình duyệt.
echo  👉 Chế độ Away Mode đã bật (màn hình có thể tắt ngủ nhưng server vẫn 24/24).
echo ================================================================
timeout /t 5
