/**
 * Module AsyncStorage sécurisé pour éviter les crashes
 * Version temporaire sans dépendance à AsyncStorage 
 */

// Stockage temporaire en mémoire pour éviter les crashes
const tempStorage = new Map();

const SafeAsyncStorage = {
  async getItem(key) {
    try {
      console.warn('[SafeAsyncStorage] Mode fallback, récupération:', key);
      return tempStorage.get(key) || null;
    } catch (error) {
      console.warn('[SafeAsyncStorage] Erreur getItem pour', key, ':', error);
      return null;
    }
  },
  
  async setItem(key, value) {
    try {
      console.warn('[SafeAsyncStorage] Mode fallback, stockage:', key);
      tempStorage.set(key, value);
    } catch (error) {
      console.warn('[SafeAsyncStorage] Erreur setItem pour', key, ':', error);
    }
  },
  
  async removeItem(key) {
    try {
      console.warn('[SafeAsyncStorage] Mode fallback, suppression:', key);
      tempStorage.delete(key);
    } catch (error) {
      console.warn('[SafeAsyncStorage] Erreur removeItem pour', key, ':', error);
    }
  },
  
  async multiGet(keys) {
    try {
      console.warn('[SafeAsyncStorage] Mode fallback, multiGet');
      return keys.map(key => [key, tempStorage.get(key) || null]);
    } catch (error) {
      console.warn('[SafeAsyncStorage] Erreur multiGet:', error);
      return keys.map(key => [key, null]);
    }
  },
  
  async multiSet(keyValuePairs) {
    try {
      console.warn('[SafeAsyncStorage] Mode fallback, multiSet');
      keyValuePairs.forEach(([key, value]) => tempStorage.set(key, value));
    } catch (error) {
      console.warn('[SafeAsyncStorage] Erreur multiSet:', error);
    }
  },
  
  async clear() {
    try {
      console.warn('[SafeAsyncStorage] Mode fallback, clear');
      tempStorage.clear();
    } catch (error) {
      console.warn('[SafeAsyncStorage] Erreur clear:', error);
    }
  }
};

export default SafeAsyncStorage;