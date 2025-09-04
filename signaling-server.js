
// Serveur de signalisation WebRTC avec rooms et sécurité par token
// Utilise socket.io pour relayer les messages entre clients d'une même room

const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer();
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

// Token partagé (à remplacer par une vraie auth plus tard)
const SHARED_TOKEN = 'axiom-secret';

io.on('connection', (socket) => {
  console.log('Client connecté :', socket.id);

  // Authentification simple par token et room
  socket.on('join', ({ room, token }) => {
    if (token !== SHARED_TOKEN) {
      socket.emit('auth-error', 'Token invalide');
      socket.disconnect();
      return;
    }
    socket.join(room);
    socket.room = room;
    socket.emit('joined', room);
    console.log(`Client ${socket.id} a rejoint la room ${room}`);
  });

  // Relais des offres
  socket.on('offer', (offer) => {
    if (!socket.room) return;
    socket.to(socket.room).emit('offer', offer);
  });

  // Relais des réponses
  socket.on('answer', (answer) => {
    if (!socket.room) return;
    socket.to(socket.room).emit('answer', answer);
  });

  // Relais des ICE
  socket.on('ice-candidate', (candidate) => {
    if (!socket.room) return;
    socket.to(socket.room).emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté :', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log('Serveur de signalisation WebRTC (rooms + sécurité) démarré sur port', PORT);
});
