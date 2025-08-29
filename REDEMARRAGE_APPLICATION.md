# Guide pour redémarrer complètement l'application

Pour que les changements prennent effet et résoudre les problèmes de son, suivez ces étapes dans l'ordre :

## 1. Arrêter tous les processus

```powershell
# Arrêter les processus Metro et le serveur ADB
taskkill /F /IM "node.exe" /T 2>nul
adb kill-server
```

## 2. Nettoyer le cache de l'application sur l'appareil

```powershell
# Arrêter l'application
adb shell am force-stop com.axiomapp

# Effacer le cache et les données
adb shell pm clear com.axiomapp
```

## 3. Nettoyer le projet

```powershell
# Nettoyer le projet Android
cd android
./gradlew clean
cd ..

# Supprimer le dossier node_modules
rm -rf node_modules

# Réinstaller les dépendances
npm install --legacy-peer-deps
```

## 4. Vérifier les ressources audio

Assurez-vous que les fichiers suivants existent et ont la bonne taille (plus de 1KB) :
- `android/app/src/main/res/raw/orb.mp3` 
- `android/app/src/main/res/raw/message_notification.mp3`
- `ios/AxiomApp/Resources/orb.mp3`
- `ios/AxiomApp/Resources/message_notification.mp3`

## 5. Redémarrer l'application

```powershell
# Démarrer le serveur Metro
npx react-native start --reset-cache

# Dans un autre terminal, lancer l'application
npx react-native run-android
```

## En cas de problème persistant

Si le son ne fonctionne toujours pas :

1. Vérifiez que le son du téléphone est activé et à un niveau audible
2. Vérifiez les logs de l'application dans la console de débogage
3. Essayez de remplacer les fichiers MP3 par d'autres fichiers audio fonctionnels
4. Vérifiez que les permissions sont correctement configurées dans le fichier AndroidManifest.xml
