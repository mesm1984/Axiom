#!/bin/bash

# Création du dossier pour les fichiers audio
mkdir -p ios/AxiomApp/Resources

# Copie des fichiers audio
cp android/app/src/main/res/raw/axiom_vibe.mp3 ios/AxiomApp/Resources/
cp android/app/src/main/res/raw/message_notification.mp3 ios/AxiomApp/Resources/

echo "Fichiers audio copiés avec succès dans le dossier iOS"
