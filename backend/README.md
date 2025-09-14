# Axiom Backend

Backend Node.js pour l'application de messagerie sécurisée Axiom.

## 🚀 Démarrage Rapide

### Installation
```bash
cd backend
npm install
```

### Démarrage
```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3001`

## 📚 API Endpoints

### Authentification

#### POST /api/register
Inscription d'un nouvel utilisateur
```json
{
  "username": "marco",
  "email": "marco@example.com",
  "password": "motdepasse123",
  "publicKey": "clé_publique_optionnelle"
}
```

#### POST /api/login
Connexion utilisateur
```json
{
  "email": "marco@example.com",
  "password": "motdepasse123"
}
```

### Conversations

#### GET /api/conversations
Récupérer les conversations de l'utilisateur connecté
```
Authorization: Bearer <token>
```

#### POST /api/conversations
Créer une nouvelle conversation
```json
{
  "recipientEmail": "contact@example.com"
}
```

## 🔌 WebSocket Events

### Client → Serveur

- `join-conversations` : Rejoindre les conversations de l'utilisateur
- `send-message` : Envoyer un message
- `typing` : Indicateur de frappe

### Serveur → Client

- `new-message` : Nouveau message reçu
- `message-sent` : Confirmation d'envoi
- `user-typing` : Utilisateur en train de taper
- `message-error` : Erreur d'envoi

## 🗄️ Base de Données

SQLite avec les tables :
- `users` : Utilisateurs
- `conversations` : Conversations
- `conversation_participants` : Participants aux conversations
- `messages` : Messages chiffrés

## 🔒 Sécurité

- JWT pour l'authentification
- Mots de passe hashés avec bcrypt
- Messages stockés chiffrés côté client
- CORS configuré pour les domaines autorisés

## 📝 Variables d'Environnement

Copier `.env.example` vers `.env` et configurer :

```
JWT_SECRET=your-super-secret-key
PORT=3000
NODE_ENV=development
```

## 🧪 Test de l'API

### Test de connexion
```bash
curl http://localhost:3001/
```

### Test inscription
```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test connexion
```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```