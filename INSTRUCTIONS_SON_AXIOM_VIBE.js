// Guide d'intégration du son pour Axiom Vibe
// Voici les étapes pour ajouter le son du lien YouTube à votre application

/*
1. TÉLÉCHARGER LE SON DEPUIS YOUTUBE

Lien YouTube fourni: https://youtu.be/fmn30d0vsuw

Pour extraire l'audio de cette vidéo, utilisez l'une des méthodes suivantes:

OPTION 1 - Utiliser un service en ligne:
- Rendez-vous sur un site comme https://ytmp3.cc/ ou https://y2mate.com/
- Collez l'URL de la vidéo YouTube
- Choisissez le format MP3
- Téléchargez le fichier audio
- Renommez-le en "axiom_vibe.mp3"

OPTION 2 - Utiliser youtube-dl (si vous êtes à l'aise avec la ligne de commande):
- Installez youtube-dl: https://youtube-dl.org/
- Exécutez la commande: youtube-dl -x --audio-format mp3 --audio-quality 0 https://youtu.be/fmn30d0vsuw -o axiom_vibe.mp3

2. PLACER LE FICHIER AUDIO DANS VOTRE PROJET

Android:
- Copiez le fichier "axiom_vibe.mp3" dans le dossier: android/app/src/main/res/raw/
- Le fichier doit être nommé sans extension dans le code: "axiom_vibe"

iOS:
- Ouvrez le projet iOS dans Xcode: ios/AxiomApp.xcodeproj
- Faites glisser le fichier "axiom_vibe.mp3" dans le projet
- Assurez-vous que "Copy items if needed" est coché
- Sélectionnez "Create folder references" et assurez-vous que la "Target" AxiomApp est cochée

3. VÉRIFIEZ LE CODE

Le code de l'application est déjà configuré pour utiliser ce fichier audio.
Après avoir placé le fichier aux bons endroits, reconstruisez l'application pour que les changements prennent effet:

npx react-native run-android
# ou
npx react-native run-ios
*/
