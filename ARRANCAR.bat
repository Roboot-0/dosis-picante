@echo off
cmd /k "cd /d "%~dp0" && echo. && echo ======================================= && echo   DOSIS — Instalando y arrancando... && echo ======================================= && echo. && npm install && echo. && echo Abre tu navegador en: http://localhost:3000 && echo. && npm run dev"
