// Mock temporaire d'AsyncStorage pour résoudre les erreurs de démarrage
const AsyncStorage = {
  getItem: async (key) => {
    console.warn(`[MockAsyncStorage] getItem(${key}) - returning null`);
    return null;
  },
  setItem: async (key, value) => {
    console.warn(`[MockAsyncStorage] setItem(${key}, ${value})`);
  },
  removeItem: async (key) => {
    console.warn(`[MockAsyncStorage] removeItem(${key})`);
  },
  getAllKeys: async () => {
    console.warn(`[MockAsyncStorage] getAllKeys() - returning empty array`);
    return [];
  },
  multiGet: async (keys) => {
    console.warn(`[MockAsyncStorage] multiGet(${keys}) - returning empty pairs`);
    return keys.map(key => [key, null]);
  },
  multiSet: async (keyValuePairs) => {
    console.warn(`[MockAsyncStorage] multiSet(${keyValuePairs.length} pairs)`);
  },
  multiRemove: async (keys) => {
    console.warn(`[MockAsyncStorage] multiRemove(${keys})`);
  },
  clear: async () => {
    console.warn(`[MockAsyncStorage] clear()`);
  }
};

module.exports = AsyncStorage;
