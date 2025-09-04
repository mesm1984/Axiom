// API mock pour l'échange de clés publiques
// En production, remplacer par un vrai backend

const keyStore = {};

export function publishPublicKey(userId, publicKey) {
  keyStore[userId] = publicKey;
}

export function getPublicKey(userId) {
  return keyStore[userId] || null;
}

// Exemple d'utilisation :
// publishPublicKey('userA', 'clé_pub_A');
// const pubKeyB = getPublicKey('userB');
