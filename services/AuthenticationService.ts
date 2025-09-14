/**
 * Service d'authentification et d'échange de clés pour Axiom
 *
 * Fonctionnalités :
 * - Connexion au backend pour authentification
 * - Échange sécurisé de clés publiques
 * - Gestion des tokens JWT
 * - Endpoints /register, /login, /key
 * - Stockage sécurisé des informations d'authentification
 *
 * @version 1.0.0
 * @author Axiom Team
 */

import SafeAsyncStorage from '../utils/SafeAsyncStorage';
import { Platform } from 'react-native';

// Configuration des endpoints backend
const BACKEND_CONFIG = {
  baseUrl: __DEV__ ? 'http://localhost:3000' : 'https://api.axiom.app',
  endpoints: {
    register: '/auth/register',
    login: '/auth/login',
    refreshToken: '/auth/refresh',
    keyExchange: '/keys/exchange',
    getPublicKey: '/keys/public',
    revokeKey: '/keys/revoke',
  },
  timeout: 10000,
};

// Types et interfaces
export interface AuthCredentials {
  username: string;
  password: string;
  email?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  publicKeyFingerprint: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface KeyExchangeRequest {
  targetUserId: string;
  publicKey: string;
  keyFingerprint: string;
  encryptionType: 'ed25519' | 'rsa4096';
}

export interface KeyExchangeResponse {
  publicKey: string;
  keyFingerprint: string;
  userId: string;
  verified: boolean;
  exchangedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  tokens: AuthTokens | null;
  lastSyncAt: string | null;
}

// Erreurs d'authentification
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Service d'authentification avec backend sécurisé
 */
class AuthenticationService {
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    tokens: null,
    lastSyncAt: null,
  };

  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    this.initializeAuth();
  }

  // Initialisation et récupération de l'état d'authentification
  private async initializeAuth(): Promise<void> {
    try {
      const storedTokens = await this.getStoredTokens();
      const storedUser = await this.getStoredUser();

      if (storedTokens && storedUser) {
        // Vérifier si le token est encore valide
        if (storedTokens.expiresAt > Date.now()) {
          this.authState = {
            isAuthenticated: true,
            user: storedUser,
            tokens: storedTokens,
            lastSyncAt: new Date().toISOString(),
          };
        } else {
          // Tenter un refresh du token
          await this.refreshAuthToken(storedTokens.refreshToken);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation auth:", error);
      await this.clearAuthData();
    }

    this.notifyListeners();
  }

  // Inscription d'un nouvel utilisateur
  async register(credentials: AuthCredentials): Promise<UserProfile> {
    this.validateCredentials(credentials);

    try {
      const response = await this.makeRequest(
        'POST',
        BACKEND_CONFIG.endpoints.register,
        {
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
          platform: Platform.OS,
          deviceInfo: await this.getDeviceInfo(),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new AuthenticationError(
          error.message || "Erreur lors de l'inscription",
          error.code || 'REGISTRATION_FAILED',
          response.status,
        );
      }

      const data = await response.json();

      // Stocker les tokens et informations utilisateur
      await this.storeAuthData(data.tokens, data.user);

      this.authState = {
        isAuthenticated: true,
        user: data.user,
        tokens: data.tokens,
        lastSyncAt: new Date().toISOString(),
      };

      this.notifyListeners();
      return data.user;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new NetworkError(
        'Impossible de contacter le serveur',
        error as Error,
      );
    }
  }

  // Connexion utilisateur
  async login(credentials: AuthCredentials): Promise<UserProfile> {
    this.validateCredentials(credentials, false);

    try {
      const response = await this.makeRequest(
        'POST',
        BACKEND_CONFIG.endpoints.login,
        {
          username: credentials.username,
          password: credentials.password,
          platform: Platform.OS,
          deviceInfo: await this.getDeviceInfo(),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new AuthenticationError(
          error.message || 'Identifiants incorrects',
          error.code || 'LOGIN_FAILED',
          response.status,
        );
      }

      const data = await response.json();

      // Stocker les tokens et informations utilisateur
      await this.storeAuthData(data.tokens, data.user);

      this.authState = {
        isAuthenticated: true,
        user: data.user,
        tokens: data.tokens,
        lastSyncAt: new Date().toISOString(),
      };

      this.notifyListeners();
      return data.user;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new NetworkError(
        'Impossible de contacter le serveur',
        error as Error,
      );
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      if (this.authState.tokens) {
        // Notifier le serveur de la déconnexion
        await this.makeAuthenticatedRequest('POST', '/auth/logout', {
          refreshToken: this.authState.tokens.refreshToken,
        });
      }
    } catch (error) {
      console.warn('Erreur lors de la déconnexion serveur:', error);
    } finally {
      await this.clearAuthData();
      this.authState = {
        isAuthenticated: false,
        user: null,
        tokens: null,
        lastSyncAt: null,
      };
      this.notifyListeners();
    }
  }

  // Refresh du token d'authentification
  private async refreshAuthToken(refreshToken: string): Promise<void> {
    try {
      const response = await this.makeRequest(
        'POST',
        BACKEND_CONFIG.endpoints.refreshToken,
        {
          refreshToken,
        },
      );

      if (!response.ok) {
        throw new AuthenticationError(
          'Token invalide',
          'INVALID_REFRESH_TOKEN',
        );
      }

      const data = await response.json();
      await this.storeTokens(data.tokens);

      this.authState.tokens = data.tokens;
      this.authState.lastSyncAt = new Date().toISOString();
    } catch (error) {
      await this.clearAuthData();
      throw error;
    }
  }

  // Échange de clés publiques avec un autre utilisateur
  async exchangePublicKey(
    request: KeyExchangeRequest,
  ): Promise<KeyExchangeResponse> {
    if (!this.authState.isAuthenticated) {
      throw new AuthenticationError('Non authentifié', 'NOT_AUTHENTICATED');
    }

    try {
      const response = await this.makeAuthenticatedRequest(
        'POST',
        BACKEND_CONFIG.endpoints.keyExchange,
        {
          targetUserId: request.targetUserId,
          publicKey: request.publicKey,
          keyFingerprint: request.keyFingerprint,
          encryptionType: request.encryptionType,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new AuthenticationError(
          error.message || "Erreur lors de l'échange de clés",
          error.code || 'KEY_EXCHANGE_FAILED',
          response.status,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new NetworkError(
        "Erreur réseau lors de l'échange de clés",
        error as Error,
      );
    }
  }

  // Récupération de la clé publique d'un utilisateur
  async getPublicKey(userId: string): Promise<KeyExchangeResponse> {
    if (!this.authState.isAuthenticated) {
      throw new AuthenticationError('Non authentifié', 'NOT_AUTHENTICATED');
    }

    try {
      const response = await this.makeAuthenticatedRequest(
        'GET',
        `${BACKEND_CONFIG.endpoints.getPublicKey}/${userId}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new AuthenticationError(
          error.message || 'Utilisateur non trouvé',
          error.code || 'USER_NOT_FOUND',
          response.status,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new NetworkError(
        'Erreur réseau lors de la récupération de clé',
        error as Error,
      );
    }
  }

  // Révocation d'une clé
  async revokeKey(keyFingerprint: string): Promise<void> {
    if (!this.authState.isAuthenticated) {
      throw new AuthenticationError('Non authentifié', 'NOT_AUTHENTICATED');
    }

    try {
      const response = await this.makeAuthenticatedRequest(
        'POST',
        BACKEND_CONFIG.endpoints.revokeKey,
        {
          keyFingerprint,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new AuthenticationError(
          error.message || 'Erreur lors de la révocation',
          error.code || 'REVOCATION_FAILED',
          response.status,
        );
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new NetworkError(
        'Erreur réseau lors de la révocation',
        error as Error,
      );
    }
  }

  // Getters pour l'état d'authentification
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  getCurrentUser(): UserProfile | null {
    return this.authState.user;
  }

  getAccessToken(): string | null {
    return this.authState.tokens?.accessToken || null;
  }

  // Système d'écoute des changements d'état
  onAuthStateChanged(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    // Retourner une fonction de désabonnement
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAuthState());
      } catch (error) {
        console.error('Erreur dans listener auth:', error);
      }
    });
  }

  // Méthodes utilitaires privées
  private async makeRequest(
    method: string,
    endpoint: string,
    body?: any,
  ): Promise<Response> {
    const url = `${BACKEND_CONFIG.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      BACKEND_CONFIG.timeout,
    );

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `Axiom-${Platform.OS}/${Platform.Version}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new NetworkError('Timeout de connexion');
      }
      throw error;
    }
  }

  private async makeAuthenticatedRequest(
    method: string,
    endpoint: string,
    body?: any,
  ): Promise<Response> {
    if (!this.authState.tokens?.accessToken) {
      throw new AuthenticationError(
        "Token d'accès manquant",
        'NO_ACCESS_TOKEN',
      );
    }

    const url = `${BACKEND_CONFIG.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      BACKEND_CONFIG.timeout,
    );

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.authState.tokens.accessToken}`,
          'User-Agent': `Axiom-${Platform.OS}/${Platform.Version}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Gérer l'expiration du token
      if (response.status === 401) {
        try {
          await this.refreshAuthToken(this.authState.tokens.refreshToken);
          // Réessayer la requête avec le nouveau token
          return this.makeAuthenticatedRequest(method, endpoint, body);
        } catch (_refreshError) {
          await this.clearAuthData();
          throw new AuthenticationError('Session expirée', 'SESSION_EXPIRED');
        }
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new NetworkError('Timeout de connexion');
      }
      throw error;
    }
  }

  private validateCredentials(
    credentials: AuthCredentials,
    requireEmail: boolean = true,
  ): void {
    if (!credentials.username || credentials.username.length < 3) {
      throw new AuthenticationError(
        "Nom d'utilisateur invalide",
        'INVALID_USERNAME',
      );
    }

    if (!credentials.password || credentials.password.length < 8) {
      throw new AuthenticationError(
        'Mot de passe trop court',
        'INVALID_PASSWORD',
      );
    }

    if (
      requireEmail &&
      (!credentials.email || !this.isValidEmail(credentials.email))
    ) {
      throw new AuthenticationError('Email invalide', 'INVALID_EMAIL');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async getDeviceInfo(): Promise<any> {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      timestamp: new Date().toISOString(),
    };
  }

  // Gestion du stockage sécurisé
  private async storeAuthData(
    tokens: AuthTokens,
    user: UserProfile,
  ): Promise<void> {
    await Promise.all([this.storeTokens(tokens), this.storeUser(user)]);
  }

  private async storeTokens(tokens: AuthTokens): Promise<void> {
    await AsyncStorage.setItem('axiom_auth_tokens', JSON.stringify(tokens));
  }

  private async storeUser(user: UserProfile): Promise<void> {
    await AsyncStorage.setItem('axiom_user_profile', JSON.stringify(user));
  }

  private async getStoredTokens(): Promise<AuthTokens | null> {
    const stored = await AsyncStorage.getItem('axiom_auth_tokens');
    return stored ? JSON.parse(stored) : null;
  }

  private async getStoredUser(): Promise<UserProfile | null> {
    const stored = await AsyncStorage.getItem('axiom_user_profile');
    return stored ? JSON.parse(stored) : null;
  }

  private async clearAuthData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem('axiom_auth_tokens'),
      AsyncStorage.removeItem('axiom_user_profile'),
    ]);
  }
}

// Instance singleton
const authService = new AuthenticationService();
export default authService;
