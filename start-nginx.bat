@echo off
echo ===================================================
echo   Khoi Dong NGINX Reverse Proxy cho Smart Store
echo   Port: http://localhost:80
echo ===================================================

cd /d "%~dp0nginx"
taskkill /F /IM nginx.exe >nul 2>&1
start nginx.exe
echo [OK] NGINX da duoc khoi dong thanh cong!
echo Ban co the truy cap: http://localhost/
pause
