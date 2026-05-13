@echo off
title DOSIS — Fix lock + pull + push
cd /d "%~dp0"

echo Eliminando lock file...
if exist ".git\index.lock" del /f ".git\index.lock"

echo Bajando cambios del remoto...
git pull origin main --rebase

echo Subiendo cambios...
git add src/components/MoleculeBackground.tsx src/components/Hero.tsx
git commit -m "feat: hero redesign — molecula ultra-chrome, logo HTML fijo, lifestyle food cards"
git push origin main

echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR — Revisa la conexion o el token de GitHub
)
pause
