# Script d'installation du son de notification
# Ce script télécharge automatiquement le son du lien YouTube fourni
# et le place dans les dossiers appropriés pour Android et iOS

echo "Téléchargement et intégration du son pour les notifications de messages..."

# Créer les dossiers nécessaires s'ils n'existent pas
mkdir -p android/app/src/main/res/raw
mkdir -p ios/AxiomApp/Resources

# Vérifier si youtube-dl est installé
if command -v youtube-dl &> /dev/null; then
  echo "Téléchargement du son depuis YouTube..."
  youtube-dl -x --audio-format mp3 --audio-quality 0 https://youtu.be/t1kSpNTFFck -o temp_message_notification.mp3
else
  echo "youtube-dl n'est pas installé. Veuillez télécharger le son manuellement et le placer dans le dossier du projet."
  echo "Lien YouTube: https://youtu.be/t1kSpNTFFck"
  exit 1
fi

# Copier le fichier audio dans les dossiers d'Android et iOS
echo "Copie du fichier audio dans les ressources Android..."
cp temp_message_notification.mp3 android/app/src/main/res/raw/message_notification.mp3

echo "Copie du fichier audio dans les ressources iOS..."
cp temp_message_notification.mp3 ios/AxiomApp/Resources/message_notification.mp3

# Nettoyer
rm temp_message_notification.mp3

echo "Installation terminée! Le son de notification de message est maintenant intégré dans l'application."
