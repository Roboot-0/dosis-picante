@echo off
title DOSIS — Orphan final
cd /d "%~dp0"
git checkout --orphan cleanmain
git add -A
git commit -m "DOSIS Picante — sitio completo"
git branch -D main
git branch -m cleanmain main
git push --force origin main
echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR — Captura esta pantalla
)
pause
