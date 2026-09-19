@echo off
echo Dang dung NGINX...
cd /d "%~dp0nginx"
nginx.exe -s stop >nul 2>&1
taskkill /F /IM nginx.exe >nul 2>&1
echo [OK] NGINX da duoc dung hoan toan.
pause
