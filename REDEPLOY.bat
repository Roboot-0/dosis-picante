@echo off
title DOSIS — Forzar deploy en Vercel
cd /d "%~dp0"

if exist ".git\index.lock" del /f ".git\index.lock"

echo Creando commit vacio para activar Vercel...
git commit --allow-empty -m "chore: trigger vercel deploy"
git push origin main

echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — Vercel va a construir en ~2 min
    echo Abre vercel.com/roboot-0s-projects/dosis-picante para ver el progreso
) else (
    echo ERROR — Captura esta pantalla
)
pause
