@echo off
title DOSIS — Push limpio final
cd /d "%~dp0"

echo Rehaciendo commit sin token expuesto...
git add GUARDAR-TOKEN.bat
git commit -m "fix: remover token de archivo bat"

echo Subiendo a GitHub...
git push --force origin main

echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR — Captura esta pantalla
)
pause
