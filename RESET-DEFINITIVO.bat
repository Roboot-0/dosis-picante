@echo off
title DOSIS — Reset definitivo
cd /d "%~dp0"

echo =====================================================
echo  PASO 1: Limpiando estado corrupto de git...
echo =====================================================
del /f ".git\index" 2>nul
del /f ".git\MERGE_HEAD" 2>nul
del /f ".git\MERGE_MODE" 2>nul
del /f ".git\MERGE_MSG" 2>nul
del /f ".git\index.lock" 2>nul

echo =====================================================
echo  PASO 2: Reconstruyendo desde la version completa
echo          del remoto (la que tiene el admin, etc)...
echo =====================================================
git read-tree 380ce53ee09a7a80ef67b468d499c70dd750df5f
if %ERRORLEVEL% neq 0 (
    echo ERROR en read-tree. Deteniendose.
    pause
    exit /b 1
)

git checkout-index -a -f
if %ERRORLEVEL% neq 0 (
    echo ERROR en checkout-index. Deteniendose.
    pause
    exit /b 1
)

echo =====================================================
echo  PASO 3: Aplicando nuestro hero redesign encima...
echo =====================================================
copy /y "src\components\Hero.tsx.new" "src\components\Hero.tsx"
copy /y "src\components\MoleculeBackground.tsx.new" "src\components\MoleculeBackground.tsx"

echo =====================================================
echo  PASO 4: Guardando y subiendo a GitHub...
echo =====================================================
git add src\components\Hero.tsx src\components\MoleculeBackground.tsx
git commit -m "feat: hero redesign — molecula chrome, logo HTML fijo, lifestyle cards"
git push origin main

echo.
if %ERRORLEVEL% == 0 (
    echo =====================================================
    echo  LISTO — En ~2 min esta en dosispicante.com
    echo =====================================================
) else (
    echo ERROR en el push. Captura esta pantalla.
)
pause
