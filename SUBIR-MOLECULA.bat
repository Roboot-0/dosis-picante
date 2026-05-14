@echo off
title DOSIS — Molecula plateada + posicion
cd /d "%~dp0"

if exist ".git\index.lock" del /f ".git\index.lock"

git add src\components\MoleculeBackground.tsx
git commit -m "fix: atomos plateados sin metalness, molecula mas arriba"
git push origin main

echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR — Captura esta pantalla
)
pause
