const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Configuration
const PORT = process.env.PORT || 3001;
const JWT_SECRET =
  process.env.JWT_SECRET || 'axiom-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Base de données SQLite
const db = new sqlite3.Database('./axiom.db', err => {
  if (err) {
    console.error('Erreur ouverture base de données:', err.message);
  } else {
    console.log('✅ Connecté à la base de données SQLite');
    initDatabase();
  }
});

// Initialisation de la base de données
function initDatabase() {
  // Table utilisateurs
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    public_key TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )`);

  // Table conversations
  db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT DEFAULT 'direct',
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id)
  )`);

  // Table participants (pour gérer les conversations de groupe plus tard)
  db.run(`CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id TEXT,
    user_id TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Table messages
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    sender_id TEXT,
    encrypted_content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations (id),
    FOREIGN KEY (sender_id) REFERENCES users (id)
  )`);

  console.log('✅ Tables de base de données initialisées');
}

// Utilitaires
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token d'accès requis" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Token invalide ou expiré' });
  }

  req.userId = decoded.userId;
  next();
}

// Routes API

// Route d'inscription
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, publicKey } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Nom d'utilisateur, email et mot de passe requis",
      });
    }

    // Vérifier si l'utilisateur existe déjà
    db.get(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username],
      async (err, row) => {
        if (err) {
          console.error('Erreur vérification utilisateur:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (row) {
          return res.status(400).json({ error: 'Utilisateur déjà existant' });
        }

        // Hasher le mot de passe
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        // Créer l'utilisateur
        db.run(
          'INSERT INTO users (id, username, email, password_hash, public_key) VALUES (?, ?, ?, ?, ?)',
          [userId, username, email, passwordHash, publicKey || null],
          function (errCreateUser) {
            if (errCreateUser) {
              console.error('Erreur création utilisateur:', errCreateUser);
              return res
                .status(500)
                .json({ error: 'Erreur création utilisateur' });
            }

            const token = generateToken(userId);
            res.status(201).json({
              message: 'Utilisateur créé avec succès',
              token,
              user: {
                id: userId,
                username,
                email,
              },
            });
          },
        );
      },
    );
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de connexion
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          console.error('Erreur recherche utilisateur:', err);
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const isValidPassword = await bcrypt.compare(
          password,
          user.password_hash,
        );
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Identifiants invalides' });
        }

        // Mettre à jour la dernière connexion
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [
          user.id,
        ]);

        const token = generateToken(user.id);
        res.json({
          message: 'Connexion réussie',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        });
      },
    );
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de création de conversation
app.post('/conversations', authenticateToken, (req, res) => {
  const { recipientEmail } = req.body;

  if (!recipientEmail) {
    return res.status(400).json({ error: 'Email du destinataire requis' });
  }

  // Trouver le destinataire
  db.get(
    'SELECT id, username FROM users WHERE email = ?',
    [recipientEmail],
    (err, recipient) => {
      if (err) {
        console.error('Erreur recherche destinataire:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!recipient) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const conversationId = uuidv4();

      // Créer la conversation
      db.run(
        'INSERT INTO conversations (id, name, created_by) VALUES (?, ?, ?)',
        [conversationId, `Conversation avec ${recipient.username}`, req.userId],
        function (errCreateConv) {
          if (errCreateConv) {
            console.error('Erreur création conversation:', errCreateConv);
            return res
              .status(500)
              .json({ error: 'Erreur création conversation' });
          }

          // Ajouter les participants
          const stmt = db.prepare(
            'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)',
          );
          stmt.run(conversationId, req.userId);
          stmt.run(conversationId, recipient.id);
          stmt.finalize();

          res.status(201).json({
            message: 'Conversation créée',
            conversation: {
              id: conversationId,
              name: `Conversation avec ${recipient.username}`,
              other_username: recipient.username,
            },
          });
        },
      );
    },
  );
});

// Gestion des connexions Socket.IO
io.on('connection', socket => {
  console.log('Nouvelle connexion Socket.IO:', socket.id);

  // Événement pour rejoindre une conversation
  socket.on('join_conversation', conversationId => {
    socket.join(conversationId);
    console.log(
      `Socket ${socket.id} a rejoint la conversation ${conversationId}`,
    );
  });

  // Événement pour envoyer un message
  socket.on('send_message', data => {
    const { conversationId, encryptedContent, messageType = 'text' } = data;
    const messageId = uuidv4();

    // Sauvegarder le message en base de données
    db.run(
      'INSERT INTO messages (id, conversation_id, sender_id, encrypted_content, message_type) VALUES (?, ?, ?, ?, ?)',
      [messageId, conversationId, data.senderId, encryptedContent, messageType],
      err => {
        if (err) {
          console.error('Erreur sauvegarde message:', err);
          socket.emit('message_error', {
            error: "Erreur lors de l'envoi du message",
          });
        } else {
          // Diffuser le message à tous les participants de la conversation
          io.to(conversationId).emit('new_message', {
            id: messageId,
            conversationId,
            senderId: data.senderId,
            encryptedContent,
            messageType,
            timestamp: new Date().toISOString(),
          });
        }
      },
    );
  });

  // Événement pour quitter une conversation
  socket.on('leave_conversation', conversationId => {
    socket.leave(conversationId);
    console.log(
      `Socket ${socket.id} a quitté la conversation ${conversationId}`,
    );
  });

  socket.on('disconnect', () => {
    console.log('Déconnexion Socket.IO:', socket.id);
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Quelque chose s'est mal passé!" });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur Axiom démarré sur le port ${PORT}`);
  console.log(`📡 WebSocket disponible sur ws://localhost:${PORT}`);
});
