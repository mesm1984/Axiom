# Méthode alternative : Utiliser un générateur d'icônes en ligne

Si vous n'avez pas accès à Android Studio, vous pouvez utiliser un générateur d'icônes en ligne :

1. **Visitez l'un de ces sites web :**
   - Android Asset Studio : https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
   - Appicon.co : https://appicon.co/
   - Easyappicon.com : https://easyappicon.com/

2. **Téléchargez votre image :**
   - Téléchargez le fichier image contenant votre logo "A" blanc sur fond noir
   - Si votre image a un fond transparent, assurez-vous de régler le fond sur noir (#000000)

3. **Configurez les paramètres :**
   - Forme : "Square" ou "Full Bleed" pour un icône carré
   - Effet : Aucun (pour conserver l'aspect exact de votre logo)
   - Couleur : Noir (#000000) pour l'arrière-plan si nécessaire
   - Taille du logo : Ajustez pour que le logo soit bien visible (généralement 60-70%)

4. **Téléchargez le pack d'icônes généré :**
   - Le site va générer un fichier ZIP contenant toutes les tailles nécessaires
   - Téléchargez ce fichier et extrayez-le sur votre ordinateur

5. **Remplacez les icônes existantes :**
   - Naviguez vers les dossiers suivants dans votre projet :
     ```
     C:\Users\marco\AxiomApp\android\app\src\main\res\mipmap-mdpi
     C:\Users\marco\AxiomApp\android\app\src\main\res\mipmap-hdpi
     C:\Users\marco\AxiomApp\android\app\src\main\res\mipmap-xhdpi
     C:\Users\marco\AxiomApp\android\app\src\main\res\mipmap-xxhdpi
     C:\Users\marco\AxiomApp\android\app\src\main\res\mipmap-xxxhdpi
     ```
   - Remplacez les fichiers `ic_launcher.png` et `ic_launcher_round.png` dans chaque dossier par les versions correspondantes que vous avez générées

6. **Reconstruisez l'application :**
   - Exécutez les commandes suivantes dans un terminal :
     ```
     cd android
     .\gradlew clean
     cd ..
     npx react-native run-android
     ```

Votre application devrait maintenant apparaître avec la nouvelle icône sur l'écran d'accueil de l'émulateur.
