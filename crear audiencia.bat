@echo off
cmd /k "cd /d "%~dp0" && echo. && echo ======================================= && echo   DOSIS - Creando audiencia en Resend && echo ======================================= && echo. && node scripts/crear-audiencia.mjs && echo."
