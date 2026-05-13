@echo off
cd /d "%~dp0"
git push origin main
echo.
if %errorlevel% == 0 (
    echo LISTO — Vercel desplegando en ~2 min
) else (
    echo ERROR — Revisa tus credenciales de GitHub
)
pause
