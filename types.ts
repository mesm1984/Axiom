// Types globaux pour l'application Axiom
export {};

// Types pour les messages
export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'contact';
  encrypted?: boolean;
  delivered?: boolean;
}

// Types pour les conversations
export interface Conversation {
  id: string;
  contactName: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isHQ: boolean;
  unread: boolean;
  archived?: boolean;
  hasFile?: boolean;
  hasOrb?: boolean;
}

// Types pour les fichiers
export interface FileTransfer {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
}