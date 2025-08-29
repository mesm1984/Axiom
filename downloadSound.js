const https = require('https');
const fs = require('fs');
const path = require('path');

// URL du fichier audio à télécharger
// Normalement, vous utiliseriez un service pour extraire l'audio du lien YouTube
// Pour ce script, supposons que vous avez déjà l'URL directe du fichier audio
const fileUrl = 'REMPLACEZ_PAR_URL_DU_FICHIER_AUDIO';

const destination = path.join(__dirname, 'assets', 'sounds', 'axiom_vibe.mp3');

console.log('Téléchargement du fichier audio...');
console.log(`Destination: ${destination}`);

const file = fs.createWriteStream(destination);
https.get(fileUrl, (response) => {
  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('Téléchargement terminé !');
  });
}).on('error', (err) => {
  fs.unlink(destination, () => {});
  console.error(`Erreur lors du téléchargement: ${err.message}`);
});
