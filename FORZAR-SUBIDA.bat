@echo off
title DOSIS — Reconstruir indice y subir moleculas
cd /d "%~dp0"

echo Limpiando locks...
if exist ".git\index.lock" del /f ".git\index.lock"

echo Reconstruyendo indice git...
git rm -r --cached . >nul 2>&1

echo Agregando todos los archivos...
git add -A

echo Creando commit...
git commit -m "feat: dos moleculas a los lados, sin zoom scroll, logo grande, movil una molecula"

echo Subiendo a GitHub...
git push origin main

echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR — Captura esta pantalla
)
pause
