@echo off
title DOSIS — Pull + Push final
cd /d "%~dp0"
git pull origin main --no-rebase
git push origin main
echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR
)
pause
