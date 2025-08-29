# Installation du son de notification de message pour Windows
# Ce script télécharge automatiquement le son du lien YouTube fourni
# et le place dans les dossiers appropriés pour Android et iOS

Write-Host "Téléchargement et intégration du son pour les notifications de messages..." -ForegroundColor Cyan

# Créer les dossiers nécessaires s'ils n'existent pas
New-Item -ItemType Directory -Force -Path "android\app\src\main\res\raw" | Out-Null
New-Item -ItemType Directory -Force -Path "ios\AxiomApp\Resources" | Out-Null

Write-Host "Pour télécharger le son depuis YouTube, veuillez:"
Write-Host "1. Visitez un site comme https://ytmp3.cc ou https://y2mate.com" -ForegroundColor Yellow
Write-Host "2. Entrez l'URL: https://youtu.be/t1kSpNTFFck" -ForegroundColor Yellow
Write-Host "3. Téléchargez le fichier audio en MP3" -ForegroundColor Yellow
Write-Host "4. Renommez-le en 'message_notification.mp3'" -ForegroundColor Yellow
Write-Host "5. Placez-le dans le dossier du projet" -ForegroundColor Yellow

$confirmation = Read-Host "Avez-vous téléchargé le fichier audio? (O/N)"

if ($confirmation -eq "O" -or $confirmation -eq "o") {
    $sourceFile = Read-Host "Entrez le chemin complet du fichier MP3 téléchargé"
    
    if (Test-Path $sourceFile) {
        # Copier le fichier audio dans les dossiers d'Android et iOS
        Write-Host "Copie du fichier audio dans les ressources Android..." -ForegroundColor Green
        Copy-Item $sourceFile -Destination "android\app\src\main\res\raw\message_notification.mp3" -Force
        
        Write-Host "Copie du fichier audio dans les ressources iOS..." -ForegroundColor Green
        Copy-Item $sourceFile -Destination "ios\AxiomApp\Resources\message_notification.mp3" -Force
        
        Write-Host "Installation terminée! Le son de notification de message est maintenant intégré dans l'application." -ForegroundColor Green
    }
    else {
        Write-Host "Erreur: Le fichier spécifié n'existe pas." -ForegroundColor Red
    }
}
else {
    Write-Host "Installation annulée. Veuillez télécharger le fichier audio et réessayer." -ForegroundColor Red
}
