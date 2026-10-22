@echo off
chcp 65001 >nul
title Cài Đặt Tự Khởi Động TeleTerm 24/24 Cùng Windows
cd /d "%~dp0"

echo ================================================================
echo    🔧 CÀI ĐẶT TỰ ĐỘNG CHẠY TELETERM KHI BẬT MÁY (AUTOSTART) 🔧
echo ================================================================
echo.

set "TARGET_CMD=%~dp0Start_TeleTerm_24-7.bat"

:: Tạo tác vụ Windows Task Scheduler tự khởi động khi người dùng đăng nhập
schtasks /create /tn "TeleTerm_24_7_Daemon" /tr "\"%TARGET_CMD%\"" /sc onlogon /rl highest /f

if %errorlevel% equ 0 (
    echo.
    echo ================================================================
    echo  🎉 CÀI ĐẶT THÀNH CÔNG!
    echo  Từ nay, mỗi khi máy tính bật lên:
    echo  • TeleTerm sẽ tự động chạy ngầm.
    echo  • Cloudflare Tunnel tự động kết nối cấp link internet.
    echo  • Away Mode tự động kích hoạt chống tắt mạng khi tắt màn hình.
    echo ================================================================
) else (
    echo.
    echo [!] Vui lòng bấm chuột phải vào file này và chọn "Run as administrator" để cấp quyền.
)

pause
