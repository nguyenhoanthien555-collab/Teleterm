@echo off
chcp 65001 >nul
title Gỡ Bỏ Tự Khởi Động TeleTerm
schtasks /delete /tn "TeleTerm_24_7_Daemon" /f
echo Đã gỡ bỏ tác vụ tự khởi động TeleTerm thành công!
pause
