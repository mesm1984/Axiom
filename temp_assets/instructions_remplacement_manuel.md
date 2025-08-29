# Création et remplacement manuel des icônes

1. Créez un nouveau dossier dans votre projet pour stocker les fichiers source : `c:\Users\marco\AxiomApp\assets\icon_source`

2. Sauvegardez l'image du logo "A" dans ce dossier

3. Utilisez un éditeur d'image (comme GIMP, Photoshop, ou même Paint.NET) pour créer les icônes aux dimensions suivantes :
   - mdpi: 48x48 pixels
   - hdpi: 72x72 pixels
   - xhdpi: 96x96 pixels
   - xxhdpi: 144x144 pixels
   - xxxhdpi: 192x192 pixels

4. Assurez-vous que chaque image a :
   - Un fond noir
   - Le logo "A" blanc centré
   - Le format PNG avec transparence

5. Remplacez les fichiers existants dans les dossiers :
   - c:\Users\marco\AxiomApp\android\app\src\main\res\mipmap-mdpi\ic_launcher.png
   - c:\Users\marco\AxiomApp\android\app\src\main\res\mipmap-hdpi\ic_launcher.png
   - c:\Users\marco\AxiomApp\android\app\src\main\res\mipmap-xhdpi\ic_launcher.png
   - c:\Users\marco\AxiomApp\android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png
   - c:\Users\marco\AxiomApp\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png

6. Faites de même pour les versions rondes (ic_launcher_round.png)

7. Reconstruisez l'application pour appliquer les modifications :
   ```
   cd android && ./gradlew clean && cd .. && npx react-native run-android
   ```
