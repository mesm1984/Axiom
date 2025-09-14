import io, { Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = 'http://localhost:3001';

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connecté au serveur Axiom');
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur de connexion socket:', error);
        resolve(false);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket déconnecté:', reason);
      });

      // Écouteurs pour les messages
      this.socket.on('message:received', (data) => {
        console.log('📨 Message reçu:', data);
      });

      this.socket.on('user:joined', (data) => {
        console.log('👤 Utilisateur connecté:', data);
      });

      this.socket.on('user:left', (data) => {
        console.log('👋 Utilisateur déconnecté:', data);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Socket déconnecté manuellement');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Rejoindre une conversation
  joinConversation(conversationId: string, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('conversation:join', { conversationId, userId });
      console.log(`🏠 Rejoint la conversation: ${conversationId}`);
    }
  }

  // Quitter une conversation
  leaveConversation(conversationId: string, userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('conversation:leave', { conversationId, userId });
      console.log(`🚪 Quitté la conversation: ${conversationId}`);
    }
  }

  // Envoyer un message
  sendMessage(conversationId: string, message: string, userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('❌ Socket non connecté');
        resolve(false);
        return;
      }

      const messageData = {
        conversationId,
        message,
        userId,
        timestamp: Date.now(),
        type: 'text'
      };

      this.socket.emit('message:send', messageData, (acknowledgment: any) => {
        if (acknowledgment?.success) {
          console.log('✅ Message envoyé avec succès');
          resolve(true);
        } else {
          console.error('❌ Échec de l\'envoi du message:', acknowledgment?.error);
          resolve(false);
        }
      });
    });
  }

  // Envoyer un Axiom Vibe
  sendAxiomVibe(conversationId: string, userId: string, targetUserId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        console.error('❌ Socket non connecté pour Axiom Vibe');
        resolve(false);
        return;
      }

      const vibeData = {
        conversationId,
        userId,
        targetUserId,
        timestamp: Date.now(),
        type: 'axiom_vibe'
      };

      this.socket.emit('axiom:vibe', vibeData, (acknowledgment: any) => {
        if (acknowledgment?.success) {
          console.log('✅ Axiom Vibe envoyé avec succès');
          resolve(true);
        } else {
          console.error('❌ Échec de l\'envoi d\'Axiom Vibe:', acknowledgment?.error);
          resolve(false);
        }
      });
    });
  }

  // Écouteurs d'événements
  onMessageReceived(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('message:received', callback);
    }
  }

  onAxiomVibeReceived(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('axiom:vibe:received', callback);
    }
  }

  onUserStatusChange(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:status:change', callback);
    }
  }

  // Supprimer les écouteurs
  offMessageReceived() {
    if (this.socket) {
      this.socket.off('message:received');
    }
  }

  offAxiomVibeReceived() {
    if (this.socket) {
      this.socket.off('axiom:vibe:received');
    }
  }

  offUserStatusChange() {
    if (this.socket) {
      this.socket.off('user:status:change');
    }
  }

  // Obtenir l'état de la connexion
  getConnectionStatus() {
    return {
      connected: this.isConnected(),
      id: this.socket?.id || null,
      transport: this.socket?.io.engine?.transport?.name || null
    };
  }
}

// Instance singleton
const socketService = new SocketService();
export default socketService;