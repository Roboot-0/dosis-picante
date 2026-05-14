@echo off
title DOSIS — Hero fix (molecula + logo)
cd /d "%~dp0"

echo Limpiando lock de git...
if exist ".git\index.lock" del /f ".git\index.lock"

echo Subiendo cambios del hero...
git add src\components\MoleculeBackground.tsx src\components\Hero.tsx
git commit -m "fix: molecula plateada, logo real, sin texto hint, posicion arriba"
git push origin main

echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR — Captura esta pantalla
)
pause
