@echo off
title DOSIS — Reparar git y subir
cd /d "%~dp0"

echo Reparando indice corrupto...
del /f ".git\index" 2>nul
git reset

echo Sincronizando con GitHub...
git fetch origin
git merge origin/main --no-edit

echo Subiendo cambios...
git push origin main

echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo Algo salio mal. Captura esta pantalla.
)
pause
