import React from 'react';
import { createRoot } from 'react-dom/client';
import AxiomAppWeb from './AxiomAppWeb';

// Point d'entrée principal utilisant notre application complète
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<AxiomAppWeb />);
} else {
  console.error("Élément racine introuvable. Assurez-vous que l'élément avec l'ID 'root' existe dans le HTML.");
}
