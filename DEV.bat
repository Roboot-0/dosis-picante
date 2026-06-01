@echo off
title DOSIS — Dev Server local
cd /d "%~dp0"
echo Iniciando servidor de desarrollo...
echo Abre tu navegador en: http://localhost:3000
echo.
npm run dev
pause
