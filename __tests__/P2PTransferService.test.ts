/**
 * Tests pour P2PTransferService avec support STUN/TURN
 */

import P2PTransferService from '../services/P2PTransferService';

// Mock des dépendances React Native
jest.mock('react-native-webrtc', () => ({
  RTCPeerConnection: jest.fn().mockImplementation(() => ({
    createDataChannel: jest.fn(),
    createOffer: jest.fn().mockResolvedValue({}),
    setLocalDescription: jest.fn().mockResolvedValue(undefined),
    setRemoteDescription: jest.fn().mockResolvedValue(undefined),
    addIceCandidate: jest.fn().mockResolvedValue(undefined),
    close: jest.fn(),
    connectionState: 'new',
    iceGatheringState: 'new',
    onicecandidate: null,
    ondatachannel: null,
    onconnectionstatechange: null,
    onicegatheringstatechange: null,
  })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-fs', () => ({
  DownloadDirectoryPath: '/mock/download/path',
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('base64data'),
}));

describe('P2PTransferService', () => {
  let service: P2PTransferService;

  beforeEach(() => {
    service = P2PTransferService.getInstance();
    jest.clearAllMocks();
  });

  describe('Configuration STUN/TURN', () => {
    test('devrait avoir une configuration par défaut', () => {
      const config = service.getConfiguration();

      expect(config.stunTurn.stunServers).toHaveLength(6);
      expect(config.stunTurn.turnServers).toHaveLength(2);
      expect(config.transfer.enableSTUN).toBe(true);
      expect(config.transfer.enableTURN).toBe(true);
    });

    test('devrait permettre de configurer STUN/TURN', async () => {
      const customConfig = {
        stunServers: ['stun:custom-server.com:3478'],
        turnServers: [
          {
            urls: 'turn:custom-turn.com:3478',
            username: 'testuser',
            credential: 'testpass',
          },
        ],
      };

      await service.configureSTUNTURN(customConfig);
      const config = service.getConfiguration();

      expect(config.stunTurn.stunServers).toContain(
        'stun:custom-server.com:3478',
      );
      expect(config.stunTurn.turnServers).toContainEqual(
        customConfig.turnServers[0],
      );
    });

    test('devrait permettre de désactiver STUN/TURN', async () => {
      await service.configureTransfer({
        enableSTUN: false,
        enableTURN: false,
      });

      const config = service.getConfiguration();
      expect(config.transfer.enableSTUN).toBe(false);
      expect(config.transfer.enableTURN).toBe(false);
    });
  });

  describe('Initialisation de connexion', () => {
    test('devrait initialiser une connexion P2P avec configuration ICE', async () => {
      await service.initializeConnection();

      // Vérifier que RTCPeerConnection a été créé avec la bonne configuration
      const RTCPeerConnection =
        require('react-native-webrtc').RTCPeerConnection;
      expect(RTCPeerConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          iceServers: expect.arrayContaining([
            expect.objectContaining({ urls: expect.stringContaining('stun:') }),
          ]),
          iceCandidatePoolSize: 10,
          iceTransportPolicy: 'all',
        }),
      );
    });

    test("devrait fermer la connexion existante avant d'en créer une nouvelle", async () => {
      await service.initializeConnection();
      const firstConnection = service['peerConnection'];

      await service.initializeConnection();

      expect(firstConnection?.close).toHaveBeenCalled();
    });
  });

  describe('Test de connectivité', () => {
    test('devrait tester la connectivité STUN/TURN', async () => {
      const mockConnection = {
        createOffer: jest.fn().mockResolvedValue({}),
        setLocalDescription: jest.fn().mockResolvedValue(undefined),
        close: jest.fn(),
        onicecandidate: null,
        onicegatheringstatechange: null,
        iceGatheringState: 'new',
      };

      const RTCPeerConnection =
        require('react-native-webrtc').RTCPeerConnection;
      RTCPeerConnection.mockImplementation(() => mockConnection);

      const resultPromise = service.testConnectivity();

      // Simuler la réception de candidats ICE
      setTimeout(() => {
        const candidates = [
          { type: 'host', address: '192.168.1.100' },
          { type: 'srflx', address: '203.0.113.1' }, // STUN
          { type: 'relay', address: '203.0.113.2' }, // TURN
        ];

        candidates.forEach(candidate => {
          if (mockConnection.onicecandidate) {
            mockConnection.onicecandidate({ candidate });
          }
        });

        // Simuler la fin de la collecte
        if (mockConnection.onicecandidate) {
          mockConnection.onicecandidate({ candidate: null });
        }
      }, 100);

      const result = await resultPromise;

      expect(result.stun).toBe(true);
      expect(result.turn).toBe(true);
      expect(result.candidates).toHaveLength(3);
    });
  });

  describe('Transfert de fichiers', () => {
    test('devrait configurer correctement le canal de données', async () => {
      await service.initializeConnection();
      service.createDataChannel();

      const mockConnection = service['peerConnection'];
      expect(mockConnection?.createDataChannel).toHaveBeenCalledWith(
        'fileTransfer',
        expect.objectContaining({
          ordered: true,
          maxRetransmits: 3,
        }),
      );
    });

    test('devrait gérer les événements de transfert', () => {
      const mockListener = jest.fn();
      const removeListener = service.addEventListener(mockListener);

      // Simuler un événement
      service['emitEvent']({ type: 'started', data: { fileName: 'test.txt' } });

      expect(mockListener).toHaveBeenCalledWith({
        type: 'started',
        data: { fileName: 'test.txt' },
      });

      // Nettoyer
      removeListener();
    });
  });

  describe('Configuration et persistance', () => {
    test('devrait sauvegarder la configuration', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');

      await service.configureTransfer({ chunkSize: 32768 });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'p2p_config',
        expect.stringContaining('32768'),
      );
    });

    test('devrait charger la configuration sauvegardée', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const savedConfig = {
        chunkSize: 8192,
        enableSTUN: false,
      };

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(savedConfig));

      // Créer une nouvelle instance pour tester le chargement
      const newService = P2PTransferService.getInstance();
      await new Promise(resolve => setTimeout(resolve, 100)); // Attendre le chargement

      const config = newService.getConfiguration();
      expect(config.transfer.chunkSize).toBe(8192);
    });
  });

  describe("Gestion d'erreurs", () => {
    test("devrait gérer les erreurs d'initialisation", async () => {
      const RTCPeerConnection =
        require('react-native-webrtc').RTCPeerConnection;
      RTCPeerConnection.mockImplementation(() => {
        throw new Error('WebRTC not supported');
      });

      await expect(service.initializeConnection()).rejects.toThrow(
        'WebRTC not supported',
      );
    });

    test('devrait valider les données de configuration', async () => {
      // Test avec configuration invalide
      const invalidConfig = {
        stunServers: 'invalid', // Devrait être un array
      };

      // La fonction devrait gérer gracieusement les configurations invalides
      await expect(
        service.configureSTUNTURN(invalidConfig as any),
      ).resolves.not.toThrow();
    });
  });

  describe('Statistiques et monitoring', () => {
    test('devrait retourner les statistiques de connexion', async () => {
      const mockStats = { audio: {}, video: {} };
      const mockConnection = {
        getStats: jest.fn().mockResolvedValue(mockStats),
      };

      service['peerConnection'] = mockConnection as any;

      const stats = await service.getConnectionStats();
      expect(stats).toBe(mockStats);
    });

    test('devrait retourner null si pas de connexion active', async () => {
      service['peerConnection'] = null;

      const stats = await service.getConnectionStats();
      expect(stats).toBeNull();
    });
  });
});
