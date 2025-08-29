---

## 10. Priorisation des écrans pour le développement

L’ordre de développement recommandé pour maximiser la valeur utilisateur et faciliter les tests est le suivant :

1. **Écran d’accueil (Liste des con*Document à compléter et affiner au fil de l'avancement du projet.*

---

## 12. État d'avancement du projet (29 août 2025)

### 12.1 Fonctionnalités implémentées

#### Interface utilisateur
- ✅ Écran d'accueil avec liste des conversations
- ✅ Écran de conversation avec messages texte
- ✅ Écran de paramètres (structure de base)
- ✅ Écran de gestion du stockage (structure de base)
- ✅ Écran de transfert de fichiers (structure de base)

#### Fonctionnalités clés
- ✅ Envoi et réception de messages texte (simulé)
- ✅ Fonctionnalité Orb (anciennement Axiom Vibe) avec vibration et son
- ✅ Notifications sonores pour les nouveaux messages
- ✅ Simulateur d'envoi de fichiers (interface uniquement)
- ✅ Support multi-plateforme (Android et préparation pour iOS)
- ✅ Structure de base pour version web

### 12.2 Améliorations récentes
- ✅ Renommage de "Axiom Vibe" en "Orb" pour une meilleure cohérence avec le design
- ✅ Optimisation des animations du vibration pattern
- ✅ Implémentation du son pour la fonctionnalité Orb
- ✅ Ajout de sons de notification pour les nouveaux messages
- ✅ Correction des problèmes de linting et nettoyage du code
- ✅ Mise en place de la structure de projet React Native standard
- ✅ Configuration de Git pour le versioning du code

### 12.3 Travaux restants pour une application complète

#### Fonctionnalités prioritaires
- ⬜ Implémentation du chiffrement de bout en bout (E2EE)
- ⬜ Connexion au backend pour l'authentification et l'échange de clés
- ⬜ Transfert de fichiers P2P réel (pas seulement simulé)
- ⬜ Implémentation complète de la reprise de transfert interrompu
- ⬜ Gestion intelligente du stockage local (analyse, nettoyage)

#### Sécurité
- ⬜ Configuration du chiffrement des messages et fichiers
- ⬜ Stockage sécurisé des clés cryptographiques
- ⬜ Audit de sécurité externe
- ⬜ Implémentation des mécanismes de vérification d'identité
- ⬜ Protection contre les attaques MITM (Man in the Middle)
- ⬜ Protection contre les captures d'écran (en tenant compte des limitations des systèmes d'exploitation)
  * Blocage des captures d'écran sur Android (FLAG_SECURE)
  * Floutage automatique du contenu sensible sur iOS (limitation : impossible de bloquer complètement)
  * Notification à l'utilisateur lorsqu'une capture d'écran est détectée
  * Option pour masquer automatiquement les informations sensibles en arrière-plan

#### Stabilité et infrastructure
- ⬜ Mise en place d'un backend léger pour l'échange de clés
- ⬜ Configuration de serveurs STUN/TURN pour la connexion P2P
- ⬜ Optimisation des performances pour appareils bas de gamme
- ⬜ Mise en place de tests automatisés (unitaires, intégration)
- ⬜ Système de télémétrie respectant la vie privée (opt-in uniquement)

#### Finalisation du produit
- ⬜ Conception et mise en œuvre du processus d'onboarding
- ⬜ Documentation utilisateur complète
- ⬜ Documentation technique pour les composants open-source
- ⬜ Publication sur les stores (Google Play, App Store)
- ⬜ Mise en place d'un système de retour utilisateur

### 12.4 Planning prévisionnel révisé
- **Phase 1 (1-2 mois)** : Finalisation des fonctionnalités de base et de l'interface utilisateur
- **Phase 2 (2-3 mois)** : Implémentation du chiffrement E2EE et des transferts P2P
- **Phase 3 (1-2 mois)** : Tests de sécurité, optimisations et finalisation
- **Phase 4 (1 mois)** : Préparation au lancement et déploiement

L'application pourrait être prête pour un lancement beta dans 4-5 mois, et pour un lancement complet dans 6-8 mois en fonction des ressources disponibles et des priorités.

## 13. Protection contre les utilisateurs malveillants

La sécurité d'Axiom ne se limite pas uniquement à la protection des données, mais inclut également des mécanismes pour prévenir et gérer les utilisations malveillantes de la plateforme. Cette section décrit les stratégies et fonctionnalités à mettre en œuvre pour protéger l'écosystème Axiom et ses utilisateurs légitimes.

### 13.1 Système d'authentification robuste

- ⬜ **Authentification à deux facteurs (2FA)**
  * Support des applications d'authentification (Google Authenticator, Authy)
  * Options de vérification par SMS ou email
  * Clés de sécurité physiques (YubiKey, etc.)

- ⬜ **Vérification d'identité progressive**
  * Vérification initiale par email ou téléphone
  * Niveaux de vérification additionnels pour les fonctionnalités sensibles
  * Système de confiance évolutif basé sur l'historique de l'utilisateur

- ⬜ **Politiques de mots de passe et gestion des sessions**
  * Exigences de mots de passe forts avec indicateur visuel de robustesse
  * Détection et blocage des mots de passe compromis (via API de vérification)
  * Rotation périodique recommandée des mots de passe
  * Expiration automatique des sessions inactives
  * Possibilité de voir et terminer les sessions actives sur d'autres appareils

### 13.2 Contrôle des abus et modération

- ⬜ **Système de signalement intégré**
  * Interface simple pour signaler des messages ou comportements inappropriés
  * Catégorisation des types d'abus pour un traitement approprié
  * Possibilité de bloquer des utilisateurs indésirables

- ⬜ **Détection automatisée des comportements suspects**
  * Analyse des patterns de comportement anormaux (envoi massif, etc.)
  * Détection des tentatives d'hameçonnage (phishing)
  * Système anti-spam pour les invitations et messages

- ⬜ **Limites et restrictions dynamiques**
  * Limitation du nombre de messages par période pour les nouveaux comptes
  * Augmentation progressive des limites pour les comptes de confiance
  * Rate limiting adaptatif selon le comportement

### 13.3 Protections techniques

- ⬜ **Sécurité de l'infrastructure**
  * Protection contre les attaques DDoS
  * Pare-feu applicatif (WAF) pour le backend
  * Validation stricte des entrées sur toutes les API

- ⬜ **Prévention des abus techniques**
  * Protection contre le reverse engineering de l'application
  * Détection des environnements rootés/jailbreakés avec limitations appropriées
  * Obfuscation du code critique

- ⬜ **Audit et surveillance**
  * Journalisation sécurisée des événements critiques
  * Système de détection d'intrusion et d'anomalies
  * Alertes en temps réel pour les activités suspectes

### 13.4 Politiques d'utilisation et transparence

- ⬜ **Documentation claire des règles**
  * Conditions d'utilisation en langage simple et accessible
  * Code de conduite explicite pour la communauté
  * Procédures de recours transparentes

- ⬜ **Éducation des utilisateurs**
  * Guides sur les bonnes pratiques de sécurité
  * Notifications contextuelles sur les risques potentiels
  * Centre d'aide avec ressources sur la confidentialité et la sécurité

- ⬜ **Processus de sanction progressif**
  * Avertissements pour les infractions mineures
  * Limitations temporaires pour les infractions répétées
  * Bannissement en dernier recours avec procédure d'appel

Ces mesures, une fois implémentées, permettront de créer un environnement sécurisé où les utilisateurs légitimes peuvent communiquer en toute confiance, tout en décourageant efficacement les acteurs malveillants.

---sations)**
	- Base de la navigation, point d’entrée de l’application
	- Permet de tester l’ajout, la suppression et l’affichage des conversations

2. **Écran de conversation**
	- Fonctionnalité cœur de l’application (messagerie, envoi/réception de messages)
	- Intégration du clavier, des pièces jointes et de la fonction Axiom Vibe

3. **Écran de transfert de fichiers**
	- Sélection, envoi et réception de fichiers volumineux
	- Gestion de la qualité et de la reprise de transfert

4. **Écran paramètres**
	- Gestion du compte, des clés, des préférences de transfert (Wi-Fi uniquement)
	- Accès aux informations de sécurité

5. **Écran de gestion du stockage**
	- Visualisation et gestion des fichiers stockés localement
	- Suppression et sauvegarde

6. **Écrans secondaires** (ajout de contact, archivage, aide, etc.)
	- À développer en parallèle ou après les écrans principaux selon l’avancement

Cette priorisation permet d’obtenir rapidement un prototype fonctionnel, de valider les choix techniques et UX, puis d’enrichir progressivement l’application.

---

## 11. Wireframes (maquettes basse fidélité)

### 11.1 Écran d’accueil (Liste des conversations)

```
--------------------------------------------------
|  Axiom                                         |
|------------------------------------------------|
| [Avatar] Nom Contact   Aperçu dernier message  |
| [Icône HQ] 12:30       [Non lu]                |
|------------------------------------------------|
| [Avatar] Nom Contact   Aperçu dernier message  |
| [Icône HQ] 11:15       [Lu]                    |
|------------------------------------------------|
| [+ Nouvelle conversation]   [Paramètres ⚙️]     |
--------------------------------------------------
```

### 11.2 Écran de conversation

```
--------------------------------------------------
| [< Retour]  Nom Contact   [Icône sécurité]      |
|------------------------------------------------|
|  [Message reçu]                                 |
|  [Message envoyé]                               |
|  [Fichier HQ envoyé] [Icône HQ]                |
|------------------------------------------------|
| [Axiom Vibe]  [Pièce jointe] [Saisie message]  |
| [Envoyer]                                      |
--------------------------------------------------
```

### 11.3 Écran de transfert de fichiers

```
--------------------------------------------------
|  Sélectionner un fichier à envoyer              |
|------------------------------------------------|
| [Liste fichiers]                               |
| [Qualité : Originale / Comprimée]              |
| [Barre de progression]                         |
| [Reprendre transfert] [Annuler]                |
--------------------------------------------------
```

### 11.4 Écran paramètres

```
--------------------------------------------------
|  Paramètres                                    |
|------------------------------------------------|
| Compte / Clés de chiffrement                   |
| Mode Wi-Fi uniquement [On/Off]                 |
| Notifications                                 |
| Sécurité & Confidentialité                     |
| À propos / Support                            |
--------------------------------------------------
```

### 11.5 Écran gestion du stockage

```
--------------------------------------------------
|  Gestion du stockage                           |
|------------------------------------------------|
| [Liste fichiers locaux]                        |
| [Supprimer] [Sauvegarder]                     |
| [Espace utilisé]                               |
--------------------------------------------------
```
# Cahier des charges – Application de Messagerie Axiom

## 1. Présentation du projet

Axiom est une application de messagerie mobile axée sur la confidentialité, la sécurité et la qualité des échanges. Elle vise à offrir une expérience de communication moderne, privée et efficace, adaptée aux professionnels, créatifs et particuliers exigeants.

**Slogan** : Axiom. Redéfinir la communication. La sécurité par nature.

---

## 2. Objectifs

- Garantir la confidentialité absolue des échanges (chiffrement de bout en bout)
- Permettre le transfert de fichiers volumineux sans perte de qualité (P2P)
- Offrir une gestion intelligente du stockage local
- Proposer une expérience utilisateur simple, fluide et moderne

---

## 3. Fonctionnalités principales

### 3.1 Messagerie chiffrée de bout en bout
- Toutes les conversations sont protégées par un chiffrement fort (ex : Signal Protocol, Double Ratchet)
- Seuls les destinataires peuvent lire les messages

### 3.2 Transfert de fichiers P2P sans compression
- Envoi direct de fichiers volumineux (photos, vidéos, documents) sans passer par un serveur central
- Aucun compromis sur la qualité des fichiers

### 3.3 Gestion intelligente du stockage
- Visualisation des fichiers stockés
- Suppression automatique ou manuelle des fichiers volumineux
- Options de sauvegarde locale ou cloud (optionnel)

### 3.4 Mode "Transfert Wi-Fi uniquement"
- Option pour limiter les transferts lourds aux connexions Wi-Fi

### 3.5 Reprise des transferts interrompus
- Capacité à reprendre un transfert de fichier après une coupure de connexion

---

## 4. Exigences techniques

- Plateformes : iOS et Android (framework multiplateforme recommandé : React Native ou Flutter)
- Chiffrement : bibliothèque éprouvée (ex : libsignal, NaCl, libsodium)
- P2P : protocole sécurisé (WebRTC, libp2p, etc.)
- Backend : serveur d’échange de clés publiques uniquement (aucun stockage de messages ou fichiers)
- Stockage local : gestion efficace de l’espace disque
- UI/UX : design moderne, intuitif, accessible

---

## 5. User Stories principales

- En tant qu’utilisateur, je peux envoyer des messages chiffrés à mes contacts.
- En tant qu’utilisateur, je peux envoyer et recevoir des fichiers volumineux sans perte de qualité.
- En tant qu’utilisateur, je peux visualiser et gérer les fichiers reçus sur mon appareil.
- En tant qu’utilisateur, je peux activer l’option "Wi-Fi uniquement" pour les transferts lourds.
- En tant qu’utilisateur, je peux reprendre un transfert interrompu sans recommencer depuis le début.

---

## 6. Contraintes et recommandations

- Respect de la vie privée : aucune donnée sensible stockée côté serveur
- Code open source pour les modules critiques (chiffrement, P2P)
- Audit de sécurité externe avant lancement
- Documentation technique et utilisateur complète


## 7. Planning prévisionnel (à détailler)



## 8. Identité de marque et interface utilisateur

### Axiom : Redéfinir la communication

Axiom est bien plus qu'une simple application de messagerie. Conçue pour résoudre les frustrations liées à la qualité et à la confidentialité, elle offre une solution unique, privée et efficace, s'adressant aux professionnels, aux créatifs et à tous ceux qui souhaitent échanger des fichiers sans compromis.

#### Les deux piliers d'Axiom : Sécurité et Qualité

Au cœur d'Axiom se trouvent deux piliers fondamentaux :

- **Chiffrement de bout en bout** pour une confidentialité absolue.
- **Transfert de fichiers P2P (peer-to-peer)**, permettant d'envoyer des photos, des vidéos et des documents sans compression ni perte de qualité.

#### Une identité de marque forte

- **Nom** : Axiom
- **Slogan** : Axiom. Redéfinir la communication. La sécurité par nature.
- **Logo** : Une petite sphère au centre avec des ondes concentriques légèrement ondulées qui en émanent, symbolisant la diffusion pure et sans perte d'information.

#### Une interface conçue pour la simplicité et l'efficacité

L'interface d'Axiom est minimaliste, intuitive et facile à utiliser.

- **Écran d'accueil** : L'écran principal présente une liste épurée de vos conversations. D'un simple coup d'œil, vous voyez le nom du contact, un aperçu du dernier message et l'heure de réception. Des icônes claires indiquent si une conversation contient des fichiers de haute qualité.

- **Écran de conversation** : L'expérience de conversation est fluide. Le clavier simple en bas de l'écran vous permet d'envoyer rapidement des messages et d'accéder aux pièces jointes. Les fichiers envoyés en haute résolution sont clairement affichés dans la bulle de message, vous assurant que la qualité originale est bien préservée.

- **Gestes intuitifs** : Pour une navigation rapide, il suffit de balayer une conversation pour la marquer comme lue ou l'archiver, réduisant ainsi le nombre de clics et rendant l'application rapide à prendre en main.

#### Axiom Vibe : La touche ludique et efficace

Pour attirer l'attention de manière discrète, Axiom intègre la fonctionnalité Axiom Vibe, une version modernisée du "Wizz" de MSN Messenger. En appuyant sur la petite icône de vibration à côté de la barre de saisie, le téléphone du destinataire et la fenêtre de conversation vibrent brièvement. C'est un moyen rapide et non intrusif de dire "Je suis là" ou de signaler que l'on attend une réponse. Pour éviter les abus, l'utilisation de cette fonction est limitée.

Axiom est conçu pour être une solution complète, alliant une technologie de pointe à une expérience utilisateur pensée pour la simplicité et l'efficacité. Elle est l'outil idéal pour ceux qui ne veulent plus choisir entre sécurité, qualité et facilité d'utilisation.

*Document à compléter et affiner au fil de l’avancement du projet.*

---

## 9. Structuration des écrans de l’application

### 9.1 Écrans principaux

- **Écran d’accueil (Liste des conversations)**
	- Liste des conversations (nom, avatar, aperçu du dernier message, heure)
	- Icônes indiquant la présence de fichiers de haute qualité
	- Bouton pour démarrer une nouvelle conversation
	- Accès rapide aux paramètres

- **Écran de conversation**
	- Affichage des messages (texte, fichiers, images, vidéos)
	- Bulle spécifique pour les fichiers envoyés en haute résolution
	- Barre de saisie de message
	- Bouton pièce jointe (envoi de fichiers, photos, vidéos)
	- Icône Axiom Vibe (vibration)
	- Indicateur de chiffrement actif

- **Écran de transfert de fichiers**
	- Sélection de fichiers à envoyer
	- Indication de la qualité (originale/sans compression)
	- Suivi de la progression du transfert
	- Option de reprise en cas d’interruption

- **Écran de gestion du stockage**
	- Visualisation des fichiers stockés localement
	- Suppression manuelle ou automatique
	- Options de sauvegarde

- **Écran paramètres**
	- Gestion du compte et des clés de chiffrement
	- Activation du mode "Wi-Fi uniquement" pour les transferts
	- Gestion des notifications
	- Informations sur la sécurité et la confidentialité

### 9.2 Écrans secondaires

- **Écran d’archivage des conversations**
- **Écran d’ajout de contact**
- **Écran d’informations sur le contact**
- **Écran d’aide et support**

### 9.3 Navigation

- Barre de navigation principale (en bas ou sur le côté selon la plateforme)
- Gestes de balayage pour actions rapides (archiver, marquer comme lu, supprimer)
- Navigation fluide entre les écrans via React Navigation
