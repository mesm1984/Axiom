// Backend d'authentification et d'échange de clés pour Axiom
// Node.js + Express + JWT (stockage en mémoire pour la démo)

const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const SECRET = 'axiom-auth-secret';
const users = {}; // { username: { password, publicKey } }

// Inscription
app.post('/register', (req, res) => {
  const { username, password, publicKey } = req.body;
  if (users[username]) return res.status(400).json({ error: 'Utilisateur déjà existant' });
  users[username] = { password, publicKey };
  res.json({ success: true });
});

// Connexion
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) return res.status(401).json({ error: 'Identifiants invalides' });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// Récupérer la clé publique d'un utilisateur
app.get('/key/:username', (req, res) => {
  const user = users[req.params.username];
  if (!user) return res.status(404).json({ error: 'Utilisateur inconnu' });
  res.json({ publicKey: user.publicKey });
});

// Mettre à jour sa clé publique
app.post('/key', (req, res) => {
  const { token, publicKey } = req.body;
  try {
    const payload = jwt.verify(token, SECRET);
    users[payload.username].publicKey = publicKey;
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log('Backend d\'authentification et d\'échange de clés démarré sur port', PORT);
});
