const fs = require('fs');
const path = require('path');

// Chemins des répertoires
const androidRawDir = path.resolve(
  __dirname,
  '../android/app/src/main/res/raw',
);
const iosResourcesDir = path.resolve(__dirname, '../ios/AxiomApp/Resources');

// Fonction pour créer un répertoire s'il n'existe pas
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Création du répertoire: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Fonction pour copier un fichier
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`Copié: ${source} -> ${destination}`);
  } catch (error) {
    console.error(`Erreur lors de la copie de ${source}: ${error.message}`);
  }
}

// Fonction principale
function main() {
  console.log('Préparation des ressources audio pour Android et iOS...');

  // S'assurer que les répertoires de destination existent
  ensureDirectoryExists(androidRawDir);
  ensureDirectoryExists(iosResourcesDir);

  // Répertoire source pour les fichiers audio
  const sourceDir = path.resolve(__dirname, '../assets/sounds');
  const axiomVibeSource = path.join(sourceDir, 'axiom_vibe.mp3');
  const messageNotifSource = path.join(sourceDir, 'message_notification.mp3');
  const axiomVibeAndroid = path.join(androidRawDir, 'axiom_vibe.mp3');
  const messageNotifAndroid = path.join(
    androidRawDir,
    'message_notification.mp3',
  );

  // Copier depuis assets/sounds vers Android raw et iOS Resources
  if (fs.existsSync(axiomVibeSource)) {
    copyFile(axiomVibeSource, axiomVibeAndroid);
    copyFile(axiomVibeSource, path.join(iosResourcesDir, 'axiom_vibe.mp3'));
  } else {
    console.error(`Le fichier source ${axiomVibeSource} n'existe pas!`);
  }

  if (fs.existsSync(messageNotifSource)) {
    copyFile(messageNotifSource, messageNotifAndroid);
    copyFile(
      messageNotifSource,
      path.join(iosResourcesDir, 'message_notification.mp3'),
    );
  } else {
    console.error(`Le fichier source ${messageNotifSource} n'existe pas!`);
  }

  console.log('Préparation des ressources terminée!');
}

// Exécution
main();
