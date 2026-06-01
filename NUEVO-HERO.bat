@echo off
title DOSIS — Nuevo hero: botellas 3D + molecula en ciencia
cd /d "%~dp0"

echo Limpiando locks...
if exist ".git\index.lock" del /f ".git\index.lock"

echo Reconstruyendo indice git...
git rm -r --cached . >nul 2>&1

echo Agregando archivos...
git add -A

echo Creando commit...
git commit -m "feat: hero con botellas 3D, foto fondo, molecula 3D en ciencia"

echo Subiendo a GitHub...
git push origin main

echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR — Captura esta pantalla
)
pause
