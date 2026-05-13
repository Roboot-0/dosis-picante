@echo off
title DOSIS — Historia limpia y push final
cd /d "%~dp0"

echo Creando rama limpia sin historial comprometido...
git checkout --orphan newmain
git add -A
git commit -m "DOSIS Picante — sitio completo v3"

echo Reemplazando rama main con la version limpia...
git branch -D main
git branch -m newmain main

echo Subiendo a GitHub...
git push --force origin main

echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR — Captura esta pantalla
)
pause
