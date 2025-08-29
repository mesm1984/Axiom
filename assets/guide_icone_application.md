# Guide étape par étape pour changer l'icône de l'application avec Android Studio

1. **Ouvrir le projet dans Android Studio**
   - Lancez Android Studio
   - Choisissez "Open an existing Android Studio project"
   - Naviguez vers `C:\Users\marco\AxiomApp\android` et sélectionnez-le

2. **Accéder à l'outil de création d'icônes**
   - Dans le panneau de projet (à gauche), faites un clic droit sur le dossier `app`
   - Sélectionnez `New > Image Asset`

3. **Configurer l'icône de l'application**
   - Dans la fenêtre "Asset Studio", assurez-vous que "Icon Type" est réglé sur "Launcher Icons (Adaptive and Legacy)"
   - Section "Foreground Layer":
     - Sélectionnez "Image" comme Asset Type
     - Cliquez sur "..." pour parcourir et sélectionner votre image de logo "A"
     - Dans la fenêtre de sélection de fichier, naviguez jusqu'à l'image que vous avez téléchargée sur votre ordinateur
     - Ajustez la taille avec le curseur "Resize" pour que le logo soit bien visible et proportionné
     - Si nécessaire, ajustez la position avec l'option "Trim" pour centrer correctement le logo

4. **Configurer l'arrière-plan**
   - Dans la section "Background Layer":
     - Définissez "Color" sur noir (#000000)
     - Vous pouvez également choisir "Asset Type" > "Image" si vous préférez une image d'arrière-plan

5. **Vérifier l'aperçu**
   - Sur le côté droit, vérifiez l'aperçu de votre icône sur différentes formes et tailles
   - Assurez-vous que le logo "A" est bien visible et centré

6. **Générer les ressources**
   - Cliquez sur "Next"
   - Vérifiez les chemins de sortie (ils devraient être corrects par défaut)
   - Cliquez sur "Finish"

Android Studio générera automatiquement toutes les tailles et formes d'icônes nécessaires, y compris :
- mipmap-mdpi
- mipmap-hdpi
- mipmap-xhdpi
- mipmap-xxhdpi
- mipmap-xxxhdpi
- Et les versions adaptatives requises pour Android moderne

7. **Reconstruire l'application**
   - Fermez Android Studio si vous le souhaitez
   - Retournez dans VS Code et exécutez les commandes suivantes dans un terminal:
     ```
     cd android
     .\gradlew clean
     cd ..
     npx react-native run-android
     ```

Votre application devrait maintenant apparaître avec la nouvelle icône sur l'écran d'accueil de l'émulateur.
