@echo off
title DOSIS — Subir cambios a produccion
cd /d "%~dp0"
set /p MSG="Descripcion del cambio (ej: actualizar precios): "
git add -A
git commit -m "%MSG%"
git push origin main
echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — En ~2 min esta en dosispicante.com
) else (
    echo ERROR — Revisa la conexion o el token de GitHub
)
pause
