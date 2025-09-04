# Dépendances nécessaires pour le transfert de fichiers P2P réel

Voici la liste des packages à installer pour que le composant FileTransferP2P.js fonctionne avec signalisation WebSocket et sauvegarde locale :

---

## 1. WebRTC
```
npm install react-native-webrtc
```

## 2. Sélecteur de fichiers
```
npm install react-native-document-picker
```

## 3. Signalisation WebSocket (Socket.io)
```
npm install socket.io-client
```

## 4. Sauvegarde de fichiers sur l'appareil
```
npm install react-native-fs
```

---

### Lien avec le backend
- Le serveur de signalisation doit être lancé (exemple Node.js avec socket.io sur ws://10.0.2.2:3000 pour l'émulateur Android, ou ws://localhost:3000 pour un vrai appareil).
- Adapter l'URL dans FileTransferP2P.js si besoin.

### Permissions Android
- Ajouter les permissions WRITE_EXTERNAL_STORAGE et READ_EXTERNAL_STORAGE dans AndroidManifest.xml pour la sauvegarde de fichiers.

---

**Après installation, relancer Metro et reconstruire l'app.**
