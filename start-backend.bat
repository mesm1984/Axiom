@echo off
echo 🚀 Test du Backend Axiom
echo ========================

echo 📋 Vérification Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js non installé - Téléchargez depuis https://nodejs.org
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm non installé
    pause
    exit /b 1
)

echo ✅ Node.js et npm détectés

echo.
echo 📦 Installation des dépendances...
cd backend
npm install

if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation
    pause
    exit /b 1
)

echo.
echo 🔧 Démarrage du serveur...
echo Le serveur va démarrer sur http://localhost:3000
echo Appuyez sur Ctrl+C pour arrêter
echo.

npm run dev