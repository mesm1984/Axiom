#!/bin/bash

echo "🚀 Test du Backend Axiom"
echo "========================"

# Vérification Node.js
echo "📋 Vérification Node.js..."
node --version || echo "❌ Node.js non installé"
npm --version || echo "❌ npm non installé"

echo ""
echo "📦 Installation des dépendances..."
cd backend
npm install

echo ""
echo "🔧 Démarrage du serveur..."
echo "Le serveur va démarrer sur http://localhost:3000"
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

npm run dev