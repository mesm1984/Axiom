import {AppRegistry} from 'react-native';
// import React from 'react'; // Retiré car non utilisé

// Utilisons un composant simple pour tester l'affichage
import SimpleWebComponent from './SimpleWebComponent';

// Assurons-nous que tout est correctement initialisé
document.addEventListener('DOMContentLoaded', function() {
  AppRegistry.registerComponent('AxiomApp', () => SimpleWebComponent);
  AppRegistry.runApplication('AxiomApp', {
    rootTag: document.getElementById('root'),
  });
});
