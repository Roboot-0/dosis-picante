@echo off
title DOSIS — Hero redesign: molecula chrome + logo HTML + food cards
cd /d "%~dp0"
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
