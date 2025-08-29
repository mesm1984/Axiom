# Script d'installation du son Axiom Vibe
# Ce script télécharge automatiquement le son du lien YouTube fourni
# et le place dans les dossiers appropriés pour Android et iOS

echo "Téléchargement et intégration du son pour Axiom Vibe..."

# Créer les dossiers nécessaires s'ils n'existent pas
mkdir -p android/app/src/main/res/raw
mkdir -p ios/AxiomApp/Resources

# Vérifier si youtube-dl est installé
if command -v youtube-dl &> /dev/null; then
  echo "Téléchargement du son depuis YouTube..."
  youtube-dl -x --audio-format mp3 --audio-quality 0 https://youtu.be/fmn30d0vsuw -o temp_axiom_vibe.mp3
else
  echo "youtube-dl n'est pas installé. Veuillez télécharger le son manuellement et le placer dans le dossier du projet."
  echo "Lien YouTube: https://youtu.be/fmn30d0vsuw"
  exit 1
fi

# Copier le fichier audio dans les dossiers d'Android et iOS
echo "Copie du fichier audio dans les ressources Android..."
cp temp_axiom_vibe.mp3 android/app/src/main/res/raw/axiom_vibe.mp3

echo "Copie du fichier audio dans les ressources iOS..."
cp temp_axiom_vibe.mp3 ios/AxiomApp/Resources/axiom_vibe.mp3

# Nettoyer
rm temp_axiom_vibe.mp3

echo "Installation terminée! Le son Axiom Vibe est maintenant intégré dans l'application."
