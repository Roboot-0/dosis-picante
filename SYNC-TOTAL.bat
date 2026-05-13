@echo off
title DOSIS — Sync total
cd /d "%~dp0"

echo Paso 1: Guardar todos los archivos locales en git...
git add -A
git commit -m "sync: guardar archivos locales antes de merge"

echo Paso 2: Bajar cambios del remoto y unir...
git pull origin main --no-rebase --allow-unrelated-histories

echo Paso 3: Subir todo...
git push origin main

echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo Sigue fallando — necesitamos verlo juntos
)
pause
