import SafeAsyncStorage from '../utils/SafeAsyncStorage';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private static BASE_URL = 'http://localhost:3001'; // Axiom backend sur port 3001
  // En production : private static BASE_URL = 'https://votre-serveur.com';
  
  private static async getToken(): Promise<string | null> {
    try {
      return await SafeAsyncStorage.getItem('@axiom_token');
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  }

  private static async setToken(token: string): Promise<void> {
    try {
      await SafeAsyncStorage.setItem('@axiom_token', token);
    } catch (error) {
      console.error('Erreur sauvegarde token:', error);
    }
  }

  private static async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.BASE_URL}${endpoint}`;
      const token = await this.getToken();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Erreur HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Erreur requête API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur réseau',
      };
    }
  }

  // Inscription
  static async register(
    username: string, 
    email: string, 
    password: string, 
    publicKey?: string
  ): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        publicKey,
      }),
    });
  }

  // Connexion
  static async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.makeRequest<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    // Sauvegarder le token si connexion réussie
    if (response.success && response.data?.token) {
      await this.setToken(response.data.token);
    }

    return response;
  }

  // Déconnexion
  static async logout(): Promise<void> {
    try {
      await SafeAsyncStorage.removeItem('@axiom_token');
      await SafeAsyncStorage.removeItem('@axiom_user');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  }

  // Vérifier si l'utilisateur est connecté
  static async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  // Récupérer les conversations
  static async getConversations(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/api/conversations');
  }

  // Créer une nouvelle conversation
  static async createConversation(recipientEmail: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({
        recipientEmail,
      }),
    });
  }

  // Test de connexion au serveur
  static async testConnection(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/');
  }

  // Obtenir l'utilisateur courant depuis le stockage local
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await SafeAsyncStorage.getItem('@axiom_user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
  }

  // Sauvegarder l'utilisateur courant
  static async setCurrentUser(user: User): Promise<void> {
    try {
      await SafeAsyncStorage.setItem('@axiom_user', JSON.stringify(user));
    } catch (error) {
      console.error('Erreur sauvegarde utilisateur:', error);
    }
  }

  // Envoyer un message dans une conversation
  static async sendMessage(conversationId: string, content: string): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${this.BASE_URL}/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          type: 'text'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi du message');
      }

      console.log('Message envoyé avec succès');
    } catch (error) {
      console.error('Erreur ApiService.sendMessage:', error);
      throw error;
    }
  }

  // Récupérer les messages d'une conversation
  static async getMessages(conversationId: string): Promise<any[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${this.BASE_URL}/api/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des messages');
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Erreur ApiService.getMessages:', error);
      throw error;
    }
  }
}

export default ApiService;