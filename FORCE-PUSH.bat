@echo off
title DOSIS — Force push final
cd /d "%~dp0"
git push --force origin main
echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR — Captura esta pantalla
)
pause
