@echo off
title GitHub Token Setup + Push
cd /d "%~dp0"

echo.
echo ============================================
echo  Paso 1: Genera un nuevo token en GitHub
echo ============================================
echo.
echo  Abriendo GitHub en el navegador...
start https://github.com/settings/tokens/new?scopes=repo^&description=dosis-picante
echo.
echo  En la pagina que se abrio:
echo   1. Description: dosis-picante  (ya esta puesto)
echo   2. Expiration: 90 days (o No expiration)
echo   3. Scope: marca "repo" (ya esta marcado)
echo   4. Clic en "Generate token"
echo   5. COPIA el token (empieza con ghp_...)
echo.
echo ============================================
set /p TOKEN="  Pega aqui tu nuevo token y presiona Enter: "

if "%TOKEN%"=="" (
    echo ERROR: No ingresaste ningun token
    pause
    exit /b 1
)

echo.
echo [1/3] Actualizando remote con nuevo token...
git remote set-url origin https://Roboot-0:%TOKEN%@github.com/Roboot-0/dosis-picante.git
echo  OK

echo.
echo [2/3] Guardando token en Windows Credential Manager...
cmdkey /add:git:https://github.com /user:Roboot-0 /pass:%TOKEN%
echo  OK

echo.
echo [3/3] Subiendo cambios a GitHub...
git push origin main

echo.
if %ERRORLEVEL% == 0 (
    echo ============================================
    echo  LISTO - Vercel desplegando en ~2 minutos
    echo  https://www.dosispicante.com
    echo ============================================
) else (
    echo ERROR en git push - Revisa que el token tenga permiso "repo"
)
pause
