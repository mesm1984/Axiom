/**
 * @format
 */

// Polyfill AsyncStorage avec SafeAsyncStorage pour éviter les crashes
import SafeAsyncStorage from './utils/SafeAsyncStorage';

// Remplacer globalement AsyncStorage par SafeAsyncStorage
global.AsyncStorage = SafeAsyncStorage;

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
