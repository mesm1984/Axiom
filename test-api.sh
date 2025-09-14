#!/bin/bash

echo "🧪 Tests API Axiom Backend"
echo "=========================="

BASE_URL="http://localhost:3000"

echo "1️⃣ Test de connexion au serveur..."
curl -s $BASE_URL || echo "❌ Serveur non accessible"

echo ""
echo "2️⃣ Test inscription utilisateur..."
curl -X POST $BASE_URL/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@axiom.app",
    "password": "password123"
  }' | jq '.' || echo "❌ Erreur inscription"

echo ""
echo "3️⃣ Test connexion utilisateur..."
TOKEN=$(curl -s -X POST $BASE_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@axiom.app",
    "password": "password123"
  }' | jq -r '.token')

echo "Token reçu: $TOKEN"

echo ""
echo "4️⃣ Test récupération conversations..."
curl -s -H "Authorization: Bearer $TOKEN" \
  $BASE_URL/api/conversations | jq '.' || echo "❌ Erreur conversations"

echo ""
echo "✅ Tests terminés !"