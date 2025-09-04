// Chiffrement d'un fichier (Uint8Array)
export function encryptFileUint8(fileUint8, key) {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const keyUint8 = naclUtil.decodeBase64(key);
  const box = nacl.secretbox(fileUint8, nonce, keyUint8);
  return {
    ciphertext: naclUtil.encodeBase64(box),
    nonce: naclUtil.encodeBase64(nonce),
  };
}

// Déchiffrement d'un fichier (Uint8Array)
export function decryptFileUint8(ciphertext, nonce, key) {
  const boxUint8 = naclUtil.decodeBase64(ciphertext);
  const nonceUint8 = naclUtil.decodeBase64(nonce);
  const keyUint8 = naclUtil.decodeBase64(key);
  const fileUint8 = nacl.secretbox.open(boxUint8, nonceUint8, keyUint8);
  return fileUint8 || null;
}
// utils/crypto.js
// Module utilitaire pour le chiffrement et le déchiffrement des messages et fichiers
// Utilise tweetnacl (JS pur, compatible React Native)

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

// Génération d'une paire de clés (asymétrique)
export function generateKeyPair() {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    secretKey: naclUtil.encodeBase64(keyPair.secretKey),
  };
}

// Chiffrement d'un message (asymétrique)
export function encryptMessage(message, recipientPublicKey, senderSecretKey) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = naclUtil.decodeUTF8(message);
  const recipientKeyUint8 = naclUtil.decodeBase64(recipientPublicKey);
  const senderKeyUint8 = naclUtil.decodeBase64(senderSecretKey);
  const box = nacl.box(messageUint8, nonce, recipientKeyUint8, senderKeyUint8);
  return {
    ciphertext: naclUtil.encodeBase64(box),
    nonce: naclUtil.encodeBase64(nonce),
  };
}

// Déchiffrement d'un message (asymétrique)
export function decryptMessage(ciphertext, nonce, senderPublicKey, recipientSecretKey) {
  const boxUint8 = naclUtil.decodeBase64(ciphertext);
  const nonceUint8 = naclUtil.decodeBase64(nonce);
  const senderKeyUint8 = naclUtil.decodeBase64(senderPublicKey);
  const recipientKeyUint8 = naclUtil.decodeBase64(recipientSecretKey);
  const messageUint8 = nacl.box.open(boxUint8, nonceUint8, senderKeyUint8, recipientKeyUint8);
  if (!messageUint8) return null;
  return naclUtil.encodeUTF8(messageUint8);
}

// Chiffrement symétrique (pour fichiers)
export function encryptFile(fileUint8, key) {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const keyUint8 = naclUtil.decodeBase64(key);
  const box = nacl.secretbox(fileUint8, nonce, keyUint8);
  return {
    ciphertext: naclUtil.encodeBase64(box),
    nonce: naclUtil.encodeBase64(nonce),
  };
}

// Déchiffrement symétrique (pour fichiers)
export function decryptFile(ciphertext, nonce, key) {
  const boxUint8 = naclUtil.decodeBase64(ciphertext);
  const nonceUint8 = naclUtil.decodeBase64(nonce);
  const keyUint8 = naclUtil.decodeBase64(key);
  const fileUint8 = nacl.secretbox.open(boxUint8, nonceUint8, keyUint8);
  return fileUint8 || null;
}

// Génération d'une clé symétrique (pour fichiers)
export function generateSymmetricKey() {
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  return naclUtil.encodeBase64(key);
}

// Chiffrement d'une métadonnée (nom de fichier, contact)
export function encryptMetadata(metadata, key) {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const keyUint8 = naclUtil.decodeBase64(key);
  const dataUint8 = naclUtil.decodeUTF8(metadata);
  const box = nacl.secretbox(dataUint8, nonce, keyUint8);
  return {
    ciphertext: naclUtil.encodeBase64(box),
    nonce: naclUtil.encodeBase64(nonce),
  };
}

// Déchiffrement d'une métadonnée
export function decryptMetadata(ciphertext, nonce, key) {
  const boxUint8 = naclUtil.decodeBase64(ciphertext);
  const nonceUint8 = naclUtil.decodeBase64(nonce);
  const keyUint8 = naclUtil.decodeBase64(key);
  const dataUint8 = nacl.secretbox.open(boxUint8, nonceUint8, keyUint8);
  return dataUint8 ? naclUtil.encodeUTF8(dataUint8) : null;
}
