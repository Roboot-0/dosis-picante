@echo off
title DOSIS — Instalar dependencias
cd /d "%~dp0"
echo Instalando dependencias (primera vez o tras actualizaciones)...
npm install
echo.
echo Listo. Ya puedes usar ARRANCAR.bat
pause
