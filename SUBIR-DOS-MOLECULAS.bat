@echo off
title DOSIS — Dos moleculas + logo grande
cd /d "%~dp0"

if exist ".git\index.lock" del /f ".git\index.lock"

git add src\components\MoleculeBackground.tsx src\components\Hero.tsx
git commit -m "feat: dos moleculas a los lados, logo mas grande, mas espacio botones"
git push origin main

echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR — Captura esta pantalla
)
pause
