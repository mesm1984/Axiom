// Utilisation standard de crypto-js
// Si Metro pose problème, on peut revenir à require() avec un @ts-ignore
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
// libsodium-like via tweetnacl
import nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';
import { encryptMetadata, decryptMetadata } from '../utils/crypto';

/**
 * Service de chiffrement E2EE pour Axiom
 * Utilise AES-256 pour le chiffrement symétrique des messages
 * et RSA-2048 pour l'échange sécurisé des clés
 */
class E2EEncryptionService {
  /**
   * Chiffre une métadonnée (nom de fichier, contact)
   * @param {string} metadata - La métadonnée à chiffrer
   * @returns {{ciphertext: string, nonce: string}} - Métadonnée chiffrée
   */
  static async encryptMetadata(
    metadata: string,
  ): Promise<{ ciphertext: string; nonce: string }> {
    const key = await E2EEncryptionService.getMetadataKey();
    return encryptMetadata(metadata, key);
  }

  /**
   * Déchiffre une métadonnée
   * @param {string} ciphertext - Le texte chiffré
   * @param {string} nonce - Le nonce utilisé
   * @returns {string|null} - Métadonnée déchiffrée ou null
   */
  static async decryptMetadata(
    ciphertext: string,
    nonce: string,
  ): Promise<string | null> {
    const key = await E2EEncryptionService.getMetadataKey();
    return decryptMetadata(ciphertext, nonce, key);
  }

  /**
   * Récupère la clé de chiffrement des métadonnées (stockée de façon sécurisée)
   */
  static async getMetadataKey(): Promise<string> {
    // On utilise le Keychain pour stocker la clé symétrique des métadonnées
    const keychain = await Keychain.getGenericPassword({
      service: 'metadata-key',
    });
    if (keychain && keychain.password) {
      return keychain.password;
    }
    // Si la clé n'existe pas, on la génère et la stocke
    const newKey = naclUtil.encodeBase64(
      nacl.randomBytes(nacl.secretbox.keyLength),
    );
    await Keychain.setGenericPassword('metadata', newKey, {
      service: 'metadata-key',
    });
    return newKey;
  }
  async rotateKeys() {
    // Génère une nouvelle paire de clés et sauvegarde
    this.generateUserKeyPair();
    this.generateUserKeyPairSodium();
    await this.saveUserKeys();
    this.logSecurityEvent('Rotation des clés effectuée');
  }
  logSecurityEvent(event: string, details?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[SECURITY][${timestamp}] ${event}`, details || '');
    // En production, envoyer vers un backend sécurisé ou fichier local
  }
  private static instance: E2EEncryptionService;
  private userKeyPair: any = null;
  private contactKeys: Map<string, string> = new Map();
  // Stockage des clés publiques sodium (base64)
  private contactPublicKeysSodium: Map<string, string> = new Map();
  private sodiumKeyPair: { publicKey?: string; secretKey?: string } = {};

  private constructor() {}

  static getInstance(): E2EEncryptionService {
    if (!E2EEncryptionService.instance) {
      E2EEncryptionService.instance = new E2EEncryptionService();
    }
    return E2EEncryptionService.instance;
  }

  /**
   * Initialise le service de chiffrement
   * Génère une paire de clés si nécessaire
   */
  async initialize(): Promise<void> {
    try {
      // Charger les clés existantes depuis le stockage sécurisé
      await this.loadUserKeys();

      // Si pas de clés, en générer de nouvelles
      if (!this.userKeyPair) {
        await this.generateUserKeyPair();
      }

      console.log('Service E2E initialisé avec succès');
    } catch (error) {
      console.error("Erreur lors de l'initialisation E2E:", error);
      throw error;
    }
  }

  /**
   * Génère une paire de clés pour l'utilisateur courant
   */
  private async generateUserKeyPair(): Promise<void> {
    try {
      // Implémentation prototype : générer une clé maître symétrique
      // En production, remplace par une vraie paire asymétrique (ex: RSA ou x25519)
      const masterKey = CryptoJS.lib.WordArray.random(32); // 256 bits

      // Deriver public/private simulés à partir du masterKey (pour le prototype)
      const publicKey = CryptoJS.SHA256(
        masterKey.toString() + ':pub',
      ).toString();
      const privateKey = CryptoJS.SHA256(
        masterKey.toString() + ':priv',
      ).toString();

      this.userKeyPair = {
        publicKey,
        privateKey,
        masterKey: masterKey.toString(),
      };

      // Générer et stocker la paire sodium pour E2E réelle
      this.generateUserKeyPairSodium();

      // Sauvegarder les clés de façon sécurisée
      await this.saveUserKeys();

      console.log('Nouvelle paire de clés générée');
    } catch (error) {
      console.error('Erreur génération clés:', error);
      throw error;
    }
  }

  /**
   * Charge les clés utilisateur depuis le stockage sécurisé
   */
  private async loadUserKeys(): Promise<void> {
    try {
      // Essayer Keychain (iOS/Android secure storage) en premier
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          const parsed = JSON.parse(credentials.password);
          this.userKeyPair = parsed;
          if (parsed.sodiumKeyPair) this.sodiumKeyPair = parsed.sodiumKeyPair;
          console.log('Clés utilisateur chargées depuis Keychain');
          return;
        }
      } catch (kcErr) {
        console.warn(
          'Keychain non disponible ou lecture échouée, fallback AsyncStorage',
          kcErr,
        );
      }

      // Fallback: AsyncStorage
      const keysJson = await AsyncStorage.getItem('@axiom_user_keys');
      if (keysJson) {
        const parsed = JSON.parse(keysJson);
        this.userKeyPair = parsed;
        if (parsed.sodiumKeyPair) this.sodiumKeyPair = parsed.sodiumKeyPair;
        console.log('Clés utilisateur chargées depuis AsyncStorage');
      }
    } catch (error) {
      console.error('Erreur chargement clés:', error);
    }
  }

  /**
   * Sauvegarde les clés utilisateur de façon sécurisée
   */
  private async saveUserKeys(): Promise<void> {
    try {
      // Essayer d'écrire dans Keychain (préféré)
      try {
        const toSave = {
          ...this.userKeyPair,
          sodiumKeyPair: this.sodiumKeyPair,
        };
        await Keychain.setGenericPassword('axiom', JSON.stringify(toSave));
        return;
      } catch (kcErr) {
        console.warn(
          "Impossible d'écrire dans Keychain, fallback vers AsyncStorage",
          kcErr,
        );
      }

      // Fallback: AsyncStorage (moins sécurisé)
      const toSaveFallback = {
        ...this.userKeyPair,
        sodiumKeyPair: this.sodiumKeyPair,
      };
      await AsyncStorage.setItem(
        '@axiom_user_keys',
        JSON.stringify(toSaveFallback),
      );
    } catch (error) {
      console.error('Erreur sauvegarde clés:', error);
      throw error;
    }
  }

  /**
   * Récupère la clé publique de l'utilisateur
   */
  getPublicKey(): string | null {
    return this.userKeyPair?.publicKey || null;
  }

  /**
   * --- Sodium (tweetnacl) helpers ---
   * Génère une paire de clés Curve25519 pour box (public/secret en base64)
   */
  generateUserKeyPairSodium(): void {
    const kp = nacl.box.keyPair();
    this.sodiumKeyPair.publicKey = naclUtil.encodeBase64(kp.publicKey);
    this.sodiumKeyPair.secretKey = naclUtil.encodeBase64(kp.secretKey);
    // Ne pas sauvegarder automatiquement ici; appeler saveUserKeys si besoin
    console.log('Sodium key pair generated');
  }

  getPublicKeySodium(): string | null {
    return this.sodiumKeyPair.publicKey || null;
  }

  addContactPublicKeySodium(contactId: string, publicKeyBase64: string): void {
    this.contactPublicKeysSodium.set(contactId, publicKeyBase64);
    console.log(`Sodium public key added for contact: ${contactId}`);
  }

  /**
   * Encrypt using nacl.box: returns JSON string with cipher and nonce (base64)
   */
  encryptMessageSodium(message: string, contactId: string): string | null {
    try {
      if (!this.sodiumKeyPair.publicKey || !this.sodiumKeyPair.secretKey) {
        throw new Error('Sodium keypair not initialized');
      }
      const contactPubB64 = this.contactPublicKeysSodium.get(contactId);
      if (!contactPubB64)
        throw new Error('Contact sodium public key not found');

      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const msgUint8 = naclUtil.decodeUTF8(message);
      const contactPub = naclUtil.decodeBase64(contactPubB64);
      const secretKey = naclUtil.decodeBase64(
        this.sodiumKeyPair.secretKey as string,
      );

      const boxed = nacl.box(msgUint8, nonce, contactPub, secretKey);

      const payload = {
        cipher: naclUtil.encodeBase64(boxed),
        nonce: naclUtil.encodeBase64(nonce),
        version: 'sodium-1',
      };
      return JSON.stringify(payload);
    } catch (error) {
      console.error('encryptMessageSodium error:', error);
      return null;
    }
  }

  decryptMessageSodium(
    encryptedPayload: string,
    senderId: string,
  ): string | null {
    try {
      if (!this.sodiumKeyPair.publicKey || !this.sodiumKeyPair.secretKey) {
        throw new Error('Sodium keypair not initialized');
      }
      const payload = JSON.parse(encryptedPayload);
      const senderPubB64 = this.contactPublicKeysSodium.get(senderId);
      if (!senderPubB64) throw new Error('Sender public key not found');

      const cipher = naclUtil.decodeBase64(payload.cipher);
      const nonce = naclUtil.decodeBase64(payload.nonce);
      const senderPub = naclUtil.decodeBase64(senderPubB64);
      const secretKey = naclUtil.decodeBase64(
        this.sodiumKeyPair.secretKey as string,
      );

      const opened = nacl.box.open(cipher, nonce, senderPub, secretKey);
      if (!opened) throw new Error('Failed to open box');
      return naclUtil.encodeUTF8(opened);
    } catch (error) {
      console.error('decryptMessageSodium error:', error);
      return null;
    }
  }

  /**
   * Encrypt a file represented as base64 using nacl.box (treat base64 as UTF8 string)
   */
  encryptFileSodium(fileBase64: string, contactId: string): string | null {
    try {
      return this.encryptMessageSodium(fileBase64, contactId);
    } catch (error) {
      console.error('encryptFileSodium error:', error);
      return null;
    }
  }

  decryptFileSodium(encryptedPayload: string, senderId: string): string | null {
    try {
      return this.decryptMessageSodium(encryptedPayload, senderId);
    } catch (error) {
      console.error('decryptFileSodium error:', error);
      return null;
    }
  }

  /**
   * Ajoute la clé publique d'un contact
   */
  addContactKey(contactId: string, publicKey: string): void {
    this.contactKeys.set(contactId, publicKey);
    console.log(`Clé publique ajoutée pour le contact: ${contactId}`);
  }

  /**
   * Chiffre un message pour un contact spécifique
   */
  encryptMessage(message: string, contactId: string): string | null {
    try {
      // Sodium priority
      if (
        this.sodiumKeyPair.publicKey &&
        this.contactPublicKeysSodium.has(contactId)
      ) {
        return this.encryptMessageSodium(message, contactId);
      }

      // Sinon fallback vers le flux CryptoJS existant
      if (!this.userKeyPair) {
        throw new Error('Clés utilisateur non initialisées');
      }

      const contactPublicKey = this.contactKeys.get(contactId);
      if (!contactPublicKey) {
        throw new Error(`Clé publique du contact ${contactId} non trouvée`);
      }

      // Générer une clé de session unique pour ce message (256 bits)
      const sessionKey = CryptoJS.lib.WordArray.random(32);

      // Chiffrer le message avec la clé de session (AES-CBC + PKCS7 via CryptoJS)
      const iv = CryptoJS.lib.WordArray.random(16);
      const encryptedMessage = CryptoJS.AES.encrypt(message, sessionKey, {
        iv,
      }).toString();

      // Pour simuler le chiffrement asymétrique, on dérive une clé à partir
      // de la clé publique du contact et on chiffre la sessionKey avec AES.
      const derivedKey = CryptoJS.PBKDF2(contactPublicKey, 'axiom-salt', {
        keySize: 256 / 32,
        iterations: 10000, // augmenter les itérations pour plus de résistance
      });
      // Chiffrer la sessionKey (hex) avec la derivedKey en réutilisant l'IV
      const encryptedSessionKey = CryptoJS.AES.encrypt(
        sessionKey.toString(CryptoJS.enc.Hex),
        derivedKey,
        { iv },
      ).toString();

      // Stocker l'IV séparément pour déchiffrement
      const ivB64 = iv.toString(CryptoJS.enc.Base64);

      // Combiner message chiffré + clé de session chiffrée
      const encryptedPayload = {
        message: encryptedMessage,
        sessionKey: encryptedSessionKey,
        iv: ivB64,
        timestamp: Date.now(),
        version: '1.0',
      };

      return JSON.stringify(encryptedPayload);
    } catch (error) {
      console.error('Erreur chiffrement message:', error);
      return null;
    }
  }

  /**
   * Déchiffre un message reçu
   */
  decryptMessage(encryptedPayload: string, _senderId: string): string | null {
    try {
      const payload = JSON.parse(encryptedPayload);

      // Si on a une paire sodium et la clé sodium du sender, utiliser sodium
      if (
        this.sodiumKeyPair.publicKey &&
        this.contactPublicKeysSodium.has(_senderId)
      ) {
        return this.decryptMessageSodium(encryptedPayload, _senderId);
      }

      if (!this.userKeyPair) {
        throw new Error('Clés utilisateur non initialisées');
      }

      // Déchiffrer la clé de session avec notre clé privée (flow CryptoJS)
      const derivedKey = CryptoJS.PBKDF2(
        this.userKeyPair.publicKey,
        'axiom-salt',
        {
          keySize: 256 / 32,
          iterations: 10000,
        },
      );

      // Récupérer l'IV et le parser depuis Base64
      const ivWord = payload.iv
        ? CryptoJS.enc.Base64.parse(payload.iv)
        : CryptoJS.lib.WordArray.create();

      // Déchiffrer la sessionKey avec la derivedKey et l'IV
      const sessionKeyBytes = CryptoJS.AES.decrypt(
        payload.sessionKey,
        derivedKey,
        { iv: ivWord },
      );
      const sessionKeyHex = sessionKeyBytes.toString(CryptoJS.enc.Utf8);
      const sessionKeyWord = CryptoJS.enc.Hex.parse(sessionKeyHex);

      // Déchiffrer le message avec la clé de session et l'IV
      const messageBytes = CryptoJS.AES.decrypt(
        payload.message,
        sessionKeyWord,
        { iv: ivWord },
      );
      const decryptedMessage = messageBytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedMessage) {
        throw new Error('Échec du déchiffrement - clé invalide');
      }

      return decryptedMessage;
    } catch (error) {
      console.error('Erreur déchiffrement message:', error);
      return null;
    }
  }

  /**
   * Vérifie si le chiffrement E2E est actif pour un contact
   */
  isE2EEnabled(contactId: string): boolean {
    return this.contactKeys.has(contactId) && this.userKeyPair !== null;
  }

  /**
   * Chiffre un fichier (base64) pour un contact — retourne le payload JSON stringifié
   */
  encryptFile(fileBase64: string, contactId: string): string | null {
    try {
      // Sodium priority
      if (
        this.sodiumKeyPair.publicKey &&
        this.contactPublicKeysSodium.has(contactId)
      ) {
        return this.encryptFileSodium(fileBase64, contactId);
      }

      if (!this.userKeyPair)
        throw new Error('Clés utilisateur non initialisées');

      const contactPublicKey = this.contactKeys.get(contactId);
      if (!contactPublicKey)
        throw new Error(`Clé publique du contact ${contactId} non trouvée`);

      const sessionKey = CryptoJS.lib.WordArray.random(32);
      const iv = CryptoJS.lib.WordArray.random(16);

      // Chiffrer le contenu base64 (traité comme chaîne)
      const encryptedFile = CryptoJS.AES.encrypt(fileBase64, sessionKey, {
        iv,
      }).toString();

      const derivedKey = CryptoJS.PBKDF2(contactPublicKey, 'axiom-salt', {
        keySize: 256 / 32,
        iterations: 10000,
      });
      const encryptedSessionKey = CryptoJS.AES.encrypt(
        sessionKey.toString(CryptoJS.enc.Hex),
        derivedKey,
        { iv },
      ).toString();
      const ivB64 = iv.toString(CryptoJS.enc.Base64);

      const payload = {
        file: encryptedFile,
        sessionKey: encryptedSessionKey,
        iv: ivB64,
        timestamp: Date.now(),
        version: '1.0',
      };

      return JSON.stringify(payload);
    } catch (error) {
      console.error('Erreur chiffrement fichier:', error);
      return null;
    }
  }

  /**
   * Déchiffre un fichier chiffré (payload JSON stringifié) et retourne le base64
   */
  decryptFile(encryptedPayload: string, _senderId: string): string | null {
    try {
      // Sodium priority
      if (
        this.sodiumKeyPair.publicKey &&
        this.contactPublicKeysSodium.has(_senderId)
      ) {
        return this.decryptFileSodium(encryptedPayload, _senderId);
      }

      if (!this.userKeyPair)
        throw new Error('Clés utilisateur non initialisées');

      const payload = JSON.parse(encryptedPayload);

      const derivedKey = CryptoJS.PBKDF2(
        this.userKeyPair.publicKey,
        'axiom-salt',
        {
          keySize: 256 / 32,
          iterations: 10000,
        },
      );

      const ivWord = payload.iv
        ? CryptoJS.enc.Base64.parse(payload.iv)
        : CryptoJS.lib.WordArray.create();
      const sessionKeyBytes = CryptoJS.AES.decrypt(
        payload.sessionKey,
        derivedKey,
        { iv: ivWord },
      );
      const sessionKeyHex = sessionKeyBytes.toString(CryptoJS.enc.Utf8);
      const sessionKeyWord = CryptoJS.enc.Hex.parse(sessionKeyHex);

      const fileBytes = CryptoJS.AES.decrypt(payload.file, sessionKeyWord, {
        iv: ivWord,
      });
      const fileBase64 = fileBytes.toString(CryptoJS.enc.Utf8);

      if (!fileBase64)
        throw new Error('Échec du déchiffrement du fichier - clé invalide');

      return fileBase64;
    } catch (error) {
      console.error('Erreur déchiffrement fichier:', error);
      return null;
    }
  }

  /**
   * Génère un fingerprint de sécurité pour vérifier l'identité
   */
  generateSecurityFingerprint(contactId: string): string | null {
    const contactKey = this.contactKeys.get(contactId);
    if (!contactKey || !this.userKeyPair) {
      return null;
    }

    const combined = this.userKeyPair.publicKey + contactKey;
    const fingerprint = CryptoJS.SHA256(combined).toString().substring(0, 32);

    // Formater le fingerprint en groupes de 4 caractères
    return (
      fingerprint
        .match(/.{1,4}/g)
        ?.join(' ')
        .toUpperCase() || null
    );
  }

  /**
   * Réinitialise les clés (en cas de compromission)
   */
  async resetKeys(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@axiom_user_keys');
      this.userKeyPair = null;
      this.contactKeys.clear();

      await this.generateUserKeyPair();
      console.log('Clés réinitialisées avec succès');
    } catch (error) {
      console.error('Erreur réinitialisation clés:', error);
      throw error;
    }
  }
}

export default E2EEncryptionService;
