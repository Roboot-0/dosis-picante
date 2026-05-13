@echo off
title DOSIS — Fix molecula movil
cd /d "%~dp0"
git add src/components/MoleculeBackground.tsx
git commit -m "fix: habilitar molecula 3D en movil con configuracion reducida"
git push origin main
echo.
if %ERRORLEVEL% == 0 (
    echo LISTO — Molecula 3D activa en movil. Vercel desplegando en ~2 min
) else (
    echo ERROR — Revisa la conexion o el token de GitHub
)
pause
