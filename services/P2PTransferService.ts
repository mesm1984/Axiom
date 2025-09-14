/**
 * Service de transfert de fichiers P2P avec support STUN/TURN
 * Gestion robuste des connexions WebRTC pour contourner NAT/firewall
 */

// Mock temporaire pour WebRTC (react-native-webrtc sera ajouté plus tard)
interface RTCPeerConnection {
  connectionState?: string;
  iceGatheringState?: string;
  addEventListener(event: string, callback: any): void;
  createDataChannel(label: string, options?: any): any;
  createOffer(options?: any): Promise<any>;
  createAnswer(options?: any): Promise<any>;
  setLocalDescription(desc: any): Promise<void>;
  setRemoteDescription(desc: any): Promise<void>;
  addIceCandidate(candidate: any): Promise<void>;
  close(): void;
}

interface RTCIceCandidate {
  candidate?: string;
}

interface RTCSessionDescription {
  type: string;
  sdp: string;
}

// Mock constructeur
const RTCPeerConnection = class {
  connectionState = 'new';
  iceGatheringState = 'new';
  
  constructor(config: any) {
    console.log('[P2P Mock] RTCPeerConnection créé avec config:', config);
  }
  
  addEventListener(event: string, callback: any) {
    console.log('[P2P Mock] Event listener ajouté:', event);
  }
  
  createDataChannel(label: string, options?: any) {
    console.log('[P2P Mock] Data channel créé:', label);
    return {
      label,
      addEventListener: (event: string, callback: any) => {
        console.log('[P2P Mock] Data channel event listener:', event);
      }
    };
  }
  
  async createOffer(options?: any) {
    console.log('[P2P Mock] Création de l\'offre');
    return { type: 'offer', sdp: 'mock-offer-sdp' };
  }
  
  async createAnswer(options?: any) {
    console.log('[P2P Mock] Création de la réponse');
    return { type: 'answer', sdp: 'mock-answer-sdp' };
  }
  
  async setLocalDescription(desc: any) {
    console.log('[P2P Mock] Description locale définie:', desc.type);
  }
  
  async setRemoteDescription(desc: any) {
    console.log('[P2P Mock] Description distante définie:', desc.type);
  }
  
  async addIceCandidate(candidate: any) {
    console.log('[P2P Mock] Candidat ICE ajouté');
  }
  
  close() {
    console.log('[P2P Mock] Connexion fermée');
  }
} as any;
import SafeAsyncStorage from '../utils/SafeAsyncStorage';
import RNFS from 'react-native-fs';

// Types pour la configuration et les événements
export interface STUNTURNConfig {
  stunServers: string[];
  turnServers: {
    urls: string;
    username?: string;
    credential?: string;
  }[];
}

export interface P2PTransferConfig {
  chunkSize?: number;
  maxRetries?: number;
  timeout?: number;
  enableSTUN?: boolean;
  enableTURN?: boolean;
}

export interface TransferProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  chunkIndex: number;
  totalChunks: number;
}

export interface TransferEvent {
  type: 'progress' | 'completed' | 'failed' | 'started' | 'paused' | 'resumed';
  data?: any;
}

export type TransferEventListener = (event: TransferEvent) => void;

class P2PTransferService {
  private static instance: P2PTransferService;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: any = null;
  private listeners: TransferEventListener[] = [];
  private config: P2PTransferConfig;
  private stunTurnConfig: STUNTURNConfig;
  
  // Données de transfert en cours
  private currentTransfer: {
    fileData?: ArrayBuffer;
    fileName?: string;
    totalChunks?: number;
    sentChunks?: Map<number, Uint8Array>;
    receivedChunks?: Map<number, Uint8Array>;
    progress?: TransferProgress;
  } = {};

  private constructor() {
    this.config = {
      chunkSize: 16 * 1024, // 16KB chunks par défaut
      maxRetries: 3,
      timeout: 30000, // 30 secondes
      enableSTUN: true,
      enableTURN: true,
    };

    // Configuration par défaut avec serveurs publics et fallbacks
    this.stunTurnConfig = {
      stunServers: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun.stunprotocol.org:3478',
        'stun:stun.voiparound.com',
        'stun:stun.voipbuster.com',
      ],
      turnServers: [
        // Note: Les serveurs TURN nécessitent authentification
        // En production, utiliser vos propres serveurs TURN
        {
          urls: 'turn:numb.viagenie.ca',
          username: 'webrtc@live.com',
          credential: 'muazkh',
        },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
      ],
    };

    this.loadConfiguration();
  }

  public static getInstance(): P2PTransferService {
    if (!P2PTransferService.instance) {
      P2PTransferService.instance = new P2PTransferService();
    }
    return P2PTransferService.instance;
  }

  /**
   * Charge la configuration depuis le stockage local
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const savedConfig = await SafeAsyncStorage.getItem('p2p_config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }

      const savedSTUNTURN = await SafeAsyncStorage.getItem('stun_turn_config');
      if (savedSTUNTURN) {
        this.stunTurnConfig = { ...this.stunTurnConfig, ...JSON.parse(savedSTUNTURN) };
      }
    } catch (error) {
      console.warn('[P2P] Erreur lors du chargement de la configuration:', error);
    }
  }

  /**
   * Sauvegarde la configuration dans le stockage local
   */
  private async saveConfiguration(): Promise<void> {
    try {
      await SafeAsyncStorage.setItem('p2p_config', JSON.stringify(this.config));
      await SafeAsyncStorage.setItem('stun_turn_config', JSON.stringify(this.stunTurnConfig));
    } catch (error) {
      console.warn('[P2P] Erreur lors de la sauvegarde de la configuration:', error);
    }
  }

  /**
   * Configure les serveurs STUN/TURN
   */
  public async configureSTUNTURN(config: Partial<STUNTURNConfig>): Promise<void> {
    this.stunTurnConfig = { ...this.stunTurnConfig, ...config };
    await this.saveConfiguration();
    console.log('[P2P] Configuration STUN/TURN mise à jour');
  }

  /**
   * Configure les paramètres de transfert
   */
  public async configureTransfer(config: Partial<P2PTransferConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await this.saveConfiguration();
    console.log('[P2P] Configuration de transfert mise à jour');
  }

  /**
   * Génère la configuration ICE avec serveurs STUN/TURN
   */
  private getICEConfiguration(): any {
    const iceServers: any[] = [];

    // Ajouter serveurs STUN si activés
    if (this.config.enableSTUN) {
      this.stunTurnConfig.stunServers.forEach(stunUrl => {
        iceServers.push({ urls: stunUrl });
      });
    }

    // Ajouter serveurs TURN si activés
    if (this.config.enableTURN) {
      this.stunTurnConfig.turnServers.forEach(turnServer => {
        iceServers.push(turnServer);
      });
    }

    return {
      iceServers,
      iceCandidatePoolSize: 10, // Génère plus de candidats
      iceTransportPolicy: 'all', // Utilise tous les transports disponibles
    };
  }

  /**
   * Initialise une nouvelle connexion P2P
   */
  public async initializeConnection(): Promise<void> {
    try {
      if (this.peerConnection) {
        this.closeConnection();
      }

      const iceConfig = this.getICEConfiguration();
      console.log('[P2P] Configuration ICE:', iceConfig);

      this.peerConnection = new RTCPeerConnection(iceConfig);

      // Gestion des candidats ICE
      this.peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          const candidateType = event.candidate.candidate?.includes('typ srflx') ? 'srflx' : 
                               event.candidate.candidate?.includes('typ relay') ? 'relay' : 'host';
          console.log('[P2P] Nouveau candidat ICE:', candidateType);
          // Ici, envoyer le candidat via signaling server
          this.emitEvent({ type: 'ice-candidate', candidate: event.candidate });
        }
      });

      // Gestion des changements d'état de connexion
      this.peerConnection.addEventListener('connectionstatechange', () => {
        const state = this.peerConnection?.connectionState;
        console.log('[P2P] État de connexion:', state);
        
        switch (state) {
          case 'connected':
            this.emitEvent({ type: 'connection-established' });
            break;
          case 'disconnected':
          case 'failed':
            this.emitEvent({ type: 'connection-failed' });
            break;
        }
      });

      // Gestion du canal de données
      this.peerConnection.addEventListener('datachannel', (event) => {
        this.setupDataChannel(event.channel);
      });

      console.log('[P2P] Connexion initialisée avec succès');
    } catch (error) {
      console.error('[P2P] Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }

  /**
   * Configure le canal de données pour les transferts
   */
  private setupDataChannel(channel: any): void {
    this.dataChannel = channel;

    this.dataChannel.onopen = () => {
      console.log('[P2P] Canal de données ouvert');
      this.emitEvent({ type: 'data-channel-open' });
    };

    this.dataChannel.onclose = () => {
      console.log('[P2P] Canal de données fermé');
      this.emitEvent({ type: 'data-channel-closed' });
    };

    this.dataChannel.onmessage = (event: any) => {
      this.handleDataChannelMessage(event);
    };

    this.dataChannel.onerror = (error: any) => {
      console.error('[P2P] Erreur canal de données:', error);
      this.emitEvent({ type: 'failed', data: error });
    };
  }

  /**
   * Crée un canal de données pour initier un transfert
   */
  public createDataChannel(): void {
    if (!this.peerConnection) {
      throw new Error('Connexion P2P non initialisée');
    }

    this.dataChannel = this.peerConnection.createDataChannel('fileTransfer', {
      ordered: true, // Garantit l'ordre des chunks
      maxRetransmits: 3, // Retransmission automatique
    });

    this.setupDataChannel(this.dataChannel);
  }

  /**
   * Gère les messages reçus sur le canal de données
   */
  private handleDataChannelMessage(event: any): void {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'file-info':
          this.handleFileInfo(message);
          break;
        case 'chunk':
          this.handleChunk(message);
          break;
        case 'chunk-ack':
          this.handleChunkAck(message);
          break;
        case 'transfer-complete':
          this.handleTransferComplete();
          break;
        case 'resume-request':
          this.handleResumeRequest(message);
          break;
        default:
          console.warn('[P2P] Message inconnu:', message.type);
      }
    } catch (error) {
      console.error('[P2P] Erreur lors du traitement du message:', error);
    }
  }

  /**
   * Traite les informations de fichier
   */
  private handleFileInfo(message: any): void {
    console.log('[P2P] Informations fichier reçues:', message.fileName);
    this.currentTransfer = {
      fileName: message.fileName,
      totalChunks: message.totalChunks,
      receivedChunks: new Map(),
      progress: {
        bytesTransferred: 0,
        totalBytes: message.fileSize,
        percentage: 0,
        chunkIndex: 0,
        totalChunks: message.totalChunks,
      },
    };

    this.emitEvent({ 
      type: 'started', 
      data: { 
        fileName: message.fileName, 
        fileSize: message.fileSize 
      } 
    });
  }

  /**
   * Traite la réception d'un chunk
   */
  private handleChunk(message: any): void {
    if (!this.currentTransfer.receivedChunks) {
      this.currentTransfer.receivedChunks = new Map();
    }

    const chunkData = new Uint8Array(message.data);
    this.currentTransfer.receivedChunks.set(message.index, chunkData);

    // Mettre à jour le progrès
    if (this.currentTransfer.progress) {
      this.currentTransfer.progress.chunkIndex = message.index;
      this.currentTransfer.progress.bytesTransferred += chunkData.length;
      this.currentTransfer.progress.percentage = 
        (this.currentTransfer.receivedChunks.size / (this.currentTransfer.totalChunks || 1)) * 100;

      this.emitEvent({ 
        type: 'progress', 
        data: this.currentTransfer.progress 
      });
    }

    // Envoyer accusé de réception
    this.sendMessage({
      type: 'chunk-ack',
      index: message.index,
    });

    // Vérifier si le transfert est complet
    if (this.currentTransfer.receivedChunks.size === this.currentTransfer.totalChunks) {
      this.assembleReceivedFile();
    }
  }

  /**
   * Assemble le fichier reçu à partir des chunks
   */
  private async assembleReceivedFile(): Promise<void> {
    try {
      if (!this.currentTransfer.receivedChunks || !this.currentTransfer.fileName) {
        throw new Error('Données de transfert incomplètes');
      }

      const chunks: Uint8Array[] = [];
      for (let i = 0; i < (this.currentTransfer.totalChunks || 0); i++) {
        const chunk = this.currentTransfer.receivedChunks.get(i);
        if (!chunk) {
          throw new Error(`Chunk manquant: ${i}`);
        }
        chunks.push(chunk);
      }

      // Assembler les chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const fileData = new Uint8Array(totalLength);
      let offset = 0;

      chunks.forEach(chunk => {
        fileData.set(chunk, offset);
        offset += chunk.length;
      });

      // Sauvegarder le fichier
      const filePath = `${RNFS.DownloadDirectoryPath}/${this.currentTransfer.fileName}`;
      const base64Data = this.arrayBufferToBase64(fileData.buffer);
      await RNFS.writeFile(filePath, base64Data, 'base64');

      console.log('[P2P] Fichier assemblé et sauvegardé:', filePath);
      this.emitEvent({ 
        type: 'completed', 
        data: { 
          filePath,
          fileName: this.currentTransfer.fileName,
        } 
      });

      // Réinitialiser le transfert
      this.currentTransfer = {};

    } catch (error) {
      console.error('[P2P] Erreur lors de l\'assemblage du fichier:', error);
      this.emitEvent({ type: 'failed', data: error });
    }
  }

  /**
   * Convertit ArrayBuffer en Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Traite l'accusé de réception d'un chunk
   */
  private handleChunkAck(message: any): void {
    console.log(`[P2P] Chunk ${message.index} confirmé`);
  }

  /**
   * Traite la demande de reprise de transfert
   */
  private handleResumeRequest(message: any): void {
    console.log('[P2P] Demande de reprise pour chunks:', message.missingChunks);
    // Renvoyer les chunks manquants
    if (this.currentTransfer.sentChunks) {
      message.missingChunks.forEach((chunkIndex: number) => {
        const chunkData = this.currentTransfer.sentChunks?.get(chunkIndex);
        if (chunkData) {
          this.sendChunk(chunkIndex, chunkData);
        }
      });
    }
  }

  /**
   * Traite la fin de transfert
   */
  private handleTransferComplete(): void {
    console.log('[P2P] Transfert terminé');
    this.emitEvent({ type: 'completed' });
    this.currentTransfer = {};
  }

  /**
   * Envoie un fichier via P2P
   */
  public async sendFile(fileUri: string, fileName: string): Promise<void> {
    try {
      if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
        throw new Error('Canal de données non disponible');
      }

      // Lire le fichier
      const fileData = await RNFS.readFile(fileUri, 'base64');
      const arrayBuffer = this.base64ToArrayBuffer(fileData);
      
      const chunkSize = this.config.chunkSize || 16384;
      const totalChunks = Math.ceil(arrayBuffer.byteLength / chunkSize);

      // Initialiser le transfert
      this.currentTransfer = {
        fileData: arrayBuffer,
        fileName,
        totalChunks,
        sentChunks: new Map(),
        progress: {
          bytesTransferred: 0,
          totalBytes: arrayBuffer.byteLength,
          percentage: 0,
          chunkIndex: 0,
          totalChunks,
        },
      };

      // Envoyer les informations du fichier
      this.sendMessage({
        type: 'file-info',
        fileName,
        fileSize: arrayBuffer.byteLength,
        totalChunks,
      });

      // Envoyer les chunks
      await this.sendFileChunks(arrayBuffer, chunkSize);

    } catch (error) {
      console.error('[P2P] Erreur lors de l\'envoi du fichier:', error);
      this.emitEvent({ type: 'failed', data: error });
    }
  }

  /**
   * Envoie les chunks du fichier
   */
  private async sendFileChunks(arrayBuffer: ArrayBuffer, chunkSize: number): Promise<void> {
    const totalChunks = Math.ceil(arrayBuffer.byteLength / chunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, arrayBuffer.byteLength);
      const chunk = arrayBuffer.slice(start, end);
      const chunkArray = new Uint8Array(chunk);

      // Stocker le chunk pour reprise éventuelle
      if (!this.currentTransfer.sentChunks) {
        this.currentTransfer.sentChunks = new Map();
      }
      this.currentTransfer.sentChunks.set(i, chunkArray);

      // Envoyer le chunk
      await this.sendChunk(i, chunkArray);

      // Mettre à jour le progrès
      if (this.currentTransfer.progress) {
        this.currentTransfer.progress.chunkIndex = i;
        this.currentTransfer.progress.bytesTransferred = end;
        this.currentTransfer.progress.percentage = (end / arrayBuffer.byteLength) * 100;

        this.emitEvent({ 
          type: 'progress', 
          data: this.currentTransfer.progress 
        });
      }

      // Petite pause pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 1));
    }

    // Signaler la fin du transfert
    this.sendMessage({ type: 'transfer-complete' });
  }

  /**
   * Envoie un chunk spécifique
   */
  private async sendChunk(index: number, chunkData: Uint8Array): Promise<void> {
    const message = {
      type: 'chunk',
      index,
      data: Array.from(chunkData),
    };

    this.sendMessage(message);
  }

  /**
   * Convertit Base64 en ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Envoie un message sur le canal de données
   */
  private sendMessage(message: any): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    } else {
      console.warn('[P2P] Canal de données non disponible pour envoi');
    }
  }

  /**
   * Émet un événement vers les listeners
   */
  private emitEvent(event: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[P2P] Erreur dans listener d\'événement:', error);
      }
    });
  }

  /**
   * Ajoute un listener d'événements
   */
  public addEventListener(listener: TransferEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Teste la connectivité STUN/TURN
   */
  public async testConnectivity(): Promise<{
    stun: boolean;
    turn: boolean;
    candidates: any[];
  }> {
    return new Promise((resolve, reject) => {
      const testConnection = new RTCPeerConnection(this.getICEConfiguration());
      const candidates: any[] = [];
      let stunWorking = false;
      let turnWorking = false;

      const timeout = setTimeout(() => {
        testConnection.close();
        resolve({
          stun: stunWorking,
          turn: turnWorking,
          candidates,
        });
      }, 10000); // 10 secondes de test

      testConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          candidates.push(event.candidate);
          
          const candidateString = event.candidate.candidate || '';
          if (candidateString.includes('typ srflx')) {
            stunWorking = true;
          } else if (candidateString.includes('typ relay')) {
            turnWorking = true;
          }
        } else {
          // Tous les candidats ont été générés
          clearTimeout(timeout);
          testConnection.close();
          resolve({
            stun: stunWorking,
            turn: turnWorking,
            candidates,
          });
        }
      });

      testConnection.addEventListener('icegatheringstatechange', () => {
        if (testConnection.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          testConnection.close();
          resolve({
            stun: stunWorking,
            turn: turnWorking,
            candidates,
          });
        }
      });

      // Créer une offre pour déclencher la collecte de candidats ICE
      testConnection.createOffer()
        .then(offer => testConnection.setLocalDescription(offer))
        .catch(reject);
    });
  }

  /**
   * Ferme la connexion P2P
   */
  public closeConnection(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.currentTransfer = {};
    console.log('[P2P] Connexion fermée');
  }

  /**
   * Obtient les statistiques de la connexion
   */
  public async getConnectionStats(): Promise<any> {
    if (!this.peerConnection) {
      return null;
    }

    try {
      // Cast pour l'API React Native WebRTC
      const stats = await (this.peerConnection as any).getStats();
      return stats;
    } catch (error) {
      console.error('[P2P] Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }

  /**
   * Obtient la configuration actuelle
   */
  public getConfiguration(): { transfer: P2PTransferConfig; stunTurn: STUNTURNConfig } {
    return {
      transfer: { ...this.config },
      stunTurn: { ...this.stunTurnConfig },
    };
  }
}

export default P2PTransferService;

