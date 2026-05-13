@echo off
echo =========================================
echo  DOSIS v4 — Subir molecula hero
echo =========================================
cd /d "%~dp0"

git add src/components/MoleculeBackground.tsx
git add src/components/Hero.tsx
git add package.json
git add package-lock.json
git add next.config.ts
git commit -m "feat: molecula 3D capsaicina como fondo hero interactivo"
git push origin main

echo.
echo Listo — Vercel desplegando en ~2 min
pause
