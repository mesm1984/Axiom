const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Permuter l’ordre pour résoudre le champ 'main' en priorité
    mainFields: ['main', 'react-native', 'browser'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
