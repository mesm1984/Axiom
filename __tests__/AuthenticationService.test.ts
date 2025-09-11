/**
 * Tests unitaires pour AuthenticationService
 *
 * @version 1.0.0
 * @author Axiom Team
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, {
  AuthenticationError,
  NetworkError,
  type AuthCredentials,
  type AuthTokens,
  type UserProfile,
} from '../services/AuthenticationService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock React Native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '15.0',
  },
}));

describe('AuthenticationService', () => {
  const mockCredentials: AuthCredentials = {
    username: 'testuser',
    password: 'testpassword123',
    email: 'test@example.com',
  };

  const mockTokens: AuthTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: Date.now() + 3600000,
  };

  const mockUser: UserProfile = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    publicKeyFingerprint: 'abc123',
    createdAt: '2025-09-11T12:00:00Z',
    lastLoginAt: '2025-09-11T12:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('Authentication Flow', () => {
    describe('register', () => {
      it('should register a new user successfully', async () => {
        const mockResponse = {
          ok: true,
          json: () =>
            Promise.resolve({
              tokens: mockTokens,
              user: mockUser,
            }),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        const result = await authService.register(mockCredentials);

        expect(result).toEqual(mockUser);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'axiom_auth_tokens',
          JSON.stringify(mockTokens),
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'axiom_user_profile',
          JSON.stringify(mockUser),
        );
      });

      it('should throw AuthenticationError on registration failure', async () => {
        const mockResponse = {
          ok: false,
          status: 400,
          json: () =>
            Promise.resolve({
              message: 'Username already exists',
              code: 'USERNAME_EXISTS',
            }),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        await expect(authService.register(mockCredentials)).rejects.toThrow(
          AuthenticationError,
        );
      });

      it('should validate credentials before registration', async () => {
        const invalidCredentials: AuthCredentials = {
          username: 'ab', // Too short
          password: '123', // Too short
          email: 'invalid-email',
        };

        await expect(authService.register(invalidCredentials)).rejects.toThrow(
          AuthenticationError,
        );
      });
    });

    describe('login', () => {
      it('should login user successfully', async () => {
        const mockResponse = {
          ok: true,
          json: () =>
            Promise.resolve({
              tokens: mockTokens,
              user: mockUser,
            }),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        const result = await authService.login({
          username: mockCredentials.username,
          password: mockCredentials.password,
        });

        expect(result).toEqual(mockUser);
        expect(authService.isAuthenticated()).toBe(true);
      });

      it('should throw AuthenticationError on invalid credentials', async () => {
        const mockResponse = {
          ok: false,
          status: 401,
          json: () =>
            Promise.resolve({
              message: 'Invalid credentials',
              code: 'INVALID_CREDENTIALS',
            }),
        };

        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        await expect(
          authService.login({
            username: mockCredentials.username,
            password: 'wrongpassword',
          }),
        ).rejects.toThrow(AuthenticationError);
      });
    });

    describe('logout', () => {
      it('should logout user and clear data', async () => {
        // Mock successful logout response
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({}),
        });

        await authService.logout();

        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
          'axiom_auth_tokens',
        );
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
          'axiom_user_profile',
        );
        expect(authService.isAuthenticated()).toBe(false);
      });
    });

    describe('token refresh', () => {
      it('should refresh expired tokens automatically', async () => {
        const expiredTokens: AuthTokens = {
          accessToken: 'expired-token',
          refreshToken: 'valid-refresh-token',
          expiresAt: Date.now() - 1000, // Expired
        };

        const newTokens: AuthTokens = {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresAt: Date.now() + 3600000,
        };

        // Mock stored expired tokens
        (AsyncStorage.getItem as jest.Mock)
          .mockResolvedValueOnce(JSON.stringify(expiredTokens))
          .mockResolvedValueOnce(JSON.stringify(mockUser));

        // Mock refresh token response
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ tokens: newTokens }),
        });

        // Initialize auth service (this should trigger token refresh)
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/refresh'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ refreshToken: expiredTokens.refreshToken }),
          }),
        );
      });
    });
  });

  describe('Key Exchange', () => {
    it('should exchange public keys successfully', async () => {
      const mockKeyExchangeResponse = {
        publicKey: 'mock-public-key',
        keyFingerprint: 'abc123',
        userId: 'user-456',
        verified: true,
        exchangedAt: '2025-09-11T12:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockKeyExchangeResponse),
      });

      // Mock authenticated state
      const authState = authService.getAuthState();
      authState.isAuthenticated = true;
      authState.tokens = mockTokens;

      const result = await authService.exchangePublicKey({
        targetUserId: 'user-456',
        publicKey: 'my-public-key',
        keyFingerprint: 'def456',
        encryptionType: 'ed25519',
      });

      expect(result).toEqual(mockKeyExchangeResponse);
    });

    it('should throw error when not authenticated', async () => {
      await expect(
        authService.exchangePublicKey({
          targetUserId: 'user-456',
          publicKey: 'my-public-key',
          keyFingerprint: 'def456',
          encryptionType: 'ed25519',
        }),
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('Authentication State Management', () => {
    it('should notify listeners on state changes', done => {
      let callCount = 0;
      const unsubscribe = authService.onAuthStateChanged(state => {
        callCount++;
        if (callCount === 2) {
          // Second call should be after login
          expect(state.isAuthenticated).toBe(true);
          unsubscribe();
          done();
        }
      });

      // Simulate login
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            tokens: mockTokens,
            user: mockUser,
          }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      authService.login({
        username: 'testuser',
        password: 'testpassword123',
      });
    });

    it('should return current auth state', () => {
      const state = authService.getAuthState();
      expect(state).toHaveProperty('isAuthenticated');
      expect(state).toHaveProperty('user');
      expect(state).toHaveProperty('tokens');
      expect(state).toHaveProperty('lastSyncAt');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        authService.login({
          username: 'testuser',
          password: 'testpassword123',
        }),
      ).rejects.toThrow(NetworkError);
    });

    it('should handle timeout errors', async () => {
      // Mock a request that times out
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((_, reject) => {
            const error = new Error('Timeout');
            error.name = 'AbortError';
            setTimeout(() => reject(error), 100);
          }),
      );

      await expect(
        authService.login({
          username: 'testuser',
          password: 'testpassword123',
        }),
      ).rejects.toThrow(NetworkError);
    });
  });

  describe('Data Validation', () => {
    it('should validate email format', async () => {
      const invalidEmailCredentials: AuthCredentials = {
        username: 'testuser',
        password: 'testpassword123',
        email: 'not-an-email',
      };

      await expect(
        authService.register(invalidEmailCredentials),
      ).rejects.toThrow(AuthenticationError);
    });

    it('should validate username length', async () => {
      const shortUsernameCredentials: AuthCredentials = {
        username: 'ab',
        password: 'testpassword123',
        email: 'test@example.com',
      };

      await expect(
        authService.register(shortUsernameCredentials),
      ).rejects.toThrow(AuthenticationError);
    });

    it('should validate password strength', async () => {
      const weakPasswordCredentials: AuthCredentials = {
        username: 'testuser',
        password: '123',
        email: 'test@example.com',
      };

      await expect(
        authService.register(weakPasswordCredentials),
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
