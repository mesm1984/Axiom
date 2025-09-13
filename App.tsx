import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Animated,
  TextInput,
  Switch,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';

// Système de thème
interface Theme {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  accent: string;
}

const lightTheme: Theme = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  primary: '#007AFF',
  accent: '#FF6B35',
};

const darkTheme: Theme = {
  background: '#0D1929',
  surface: '#1C1C1E',
  card: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  primary: '#007AFF',
  accent: '#FF6B35',
};

interface Message {
  type: 'sent' | 'received';
  text: string;
  time: string;
  encrypted?: boolean;
}

interface Conversation {
  name: string;
  avatar: string;
  status: string;
  messages: Message[];
}

interface FileTransfer {
  id: string;
  name: string;
  size: number;
  type: string;
  uri?: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  uploadTime?: string;
  recipient?: string;
  encrypted: boolean;
}

const App = () => {
  // Fonction pour obtenir le thème actuel
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const currentTheme = darkMode ? darkTheme : lightTheme;

  // Styles dynamiques des paramètres basés sur le thème
  const dynamicStyles = {
    settingsTitle: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: currentTheme.text,
      marginBottom: 8,
    },
    settingsSectionTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: currentTheme.text,
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: currentTheme.text,
      marginBottom: 10,
      textAlign: 'center' as const,
    },
    settingLabel: {
      fontSize: 17,
      fontWeight: '500' as const,
      color: currentTheme.text,
      marginBottom: 2,
    },
    settingActionText: {
      flex: 1,
      fontSize: 17,
      color: currentTheme.text,
      fontWeight: '500' as const,
    },
    settingsCard: {
      backgroundColor: currentTheme.card,
      borderRadius: 16,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  };
  const [activeSection, setActiveSection] = useState<string>('Accueil');
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [isVibrating, setIsVibrating] = useState<boolean>(false);
  const [vibeHistory, setVibeHistory] = useState<
    Array<{ id: string; timestamp: number; from: string }>
  >([]);
  const [lastVibeTime, setLastVibeTime] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [showNewConversation, setShowNewConversation] =
    useState<boolean>(false);
  const [dynamicConversations, setDynamicConversations] = useState<{
    [key: string]: Conversation;
  }>({});
  const [messageText, setMessageText] = useState<string>('');
  const [fileTransfers, setFileTransfers] = useState<FileTransfer[]>([]);

  // États pour les paramètres (darkMode déjà défini plus haut)
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoEncryption, setAutoEncryption] = useState<boolean>(true);
  const [biometricAuth, setBiometricAuth] = useState<boolean>(false);
  const [autoBackup, setAutoBackup] = useState<boolean>(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const triggerShakeAnimation = () => {
    shakeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVibePress = () => {
    const now = Date.now();
    const oneMinute = 60 * 1000;

    // Limitation : 1 vibe par minute
    if (now - lastVibeTime < oneMinute) {
      const remainingTime = Math.ceil(
        (oneMinute - (now - lastVibeTime)) / 1000,
      );
      Alert.alert(
        '⏱️ AxiomVibe Cooldown',
        `Attendez ${remainingTime}s avant d'envoyer un nouveau vibe`,
        [{ text: 'OK' }],
      );
      return;
    }

    // Déclencher l'animation de vibration
    setIsVibrating(true);
    setLastVibeTime(now);
    triggerShakeAnimation();

    // Ajouter à l'historique
    const newVibe = {
      id: `vibe-${now}`,
      timestamp: now,
      from: 'Vous',
    };
    setVibeHistory(prev => [...prev, newVibe]);

    // Arrêter l'animation après 1 seconde
    setTimeout(() => {
      setIsVibrating(false);
    }, 1000);

    // Notification de succès
    Alert.alert(
      '📳 AxiomVibe Envoyé !',
      'Votre vibe sécurisé a été transmis avec chiffrement AES-256',
      [{ text: 'Super !' }],
    );
  };

  const showVibeHistory = () => {
    if (vibeHistory.length === 0) {
      Alert.alert(
        '📳 Historique AxiomVibe',
        'Aucun vibe envoyé pour le moment.',
        [{ text: 'OK' }],
      );
      return;
    }

    const historyText = vibeHistory
      .slice(-5) // Derniers 5 vibes
      .map(vibe => {
        const time = new Date(vibe.timestamp).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `📳 ${vibe.from} • ${time}`;
      })
      .join('\n');

    Alert.alert(
      '📳 Historique AxiomVibe',
      `Derniers vibes sécurisés :\n\n${historyText}\n\n⚡ Tous les vibes sont chiffrés avec AES-256`,
      [
        {
          text: 'Effacer historique',
          onPress: () => setVibeHistory([]),
          style: 'destructive',
        },
        { text: 'OK', style: 'default' },
      ],
    );
  };

  const handleConversationPress = (
    conversationId: string,
    contactName: string,
  ) => {
    setSelectedConversation(conversationId);
    setActiveSection('axiomvibe');
    Alert.alert(
      'AxiomVibe',
      `Ouverture de la conversation avec ${contactName}`,
    );
  };

  const getConversationData = (): Conversation => {
    // Vérifier d'abord si c'est une conversation dynamique
    if (selectedConversation && dynamicConversations[selectedConversation]) {
      return dynamicConversations[selectedConversation];
    }

    // Sinon, utiliser les conversations statiques
    const conversations = {
      'alex-dubois': {
        name: 'Alex Dubois',
        avatar: '👤',
        status: '🟢 En ligne • Chiffrement AES-256',
        messages: [
          {
            type: 'received' as const,
            text: "Salut ! Comment ça va aujourd'hui ? 😊",
            time: '14:28',
            encrypted: false,
          },
          {
            type: 'sent' as const,
            text: 'Ça va bien merci ! Et toi ? Tu as testé les nouvelles fonctions de sécurité ?',
            time: '14:30',
            encrypted: false,
          },
          {
            type: 'received' as const,
            text: 'Oui ! Le système AxiomSecurity fonctionne parfaitement. Nos conversations sont maintenant ultra-sécurisées ! 🛡️',
            time: '14:32',
            encrypted: true,
          },
          {
            type: 'sent' as const,
            text: 'Parfait ! Je suis content que tout fonctionne bien 🚀',
            time: '14:33',
            encrypted: true,
          },
        ],
      },
      'equipe-securite': {
        name: 'Équipe Sécurité',
        avatar: '👥',
        status: '🟢 En ligne • Chiffrement AES-256',
        messages: [
          {
            type: 'received' as const,
            text: 'Rapport de sécurité quotidien : Tous les systèmes opérationnels 🔒',
            time: '13:00',
            encrypted: true,
          },
          {
            type: 'sent' as const,
            text: 'Parfait ! Y a-t-il des incidents à signaler ?',
            time: '13:02',
            encrypted: false,
          },
          {
            type: 'received' as const,
            text: 'Aucun incident détecté. Surveillance continue active.',
            time: '13:45',
            encrypted: true,
          },
          {
            type: 'received' as const,
            text: 'Mise à jour du protocole de sécurité terminée avec succès ✅',
            time: '13:46',
            encrypted: true,
          },
        ],
      },
      'support-axiom': {
        name: 'Support Axiom',
        avatar: '🏢',
        status: '📱 Support • Assistance technique',
        messages: [
          {
            type: 'received' as const,
            text: "Bienvenue sur Axiom ! Comment pouvons-nous vous aider aujourd'hui ?",
            time: 'Hier',
            encrypted: false,
          },
          {
            type: 'sent' as const,
            text: 'Merci ! Tout fonctionne parfaitement 👍',
            time: 'Hier',
            encrypted: false,
          },
          {
            type: 'received' as const,
            text: "Excellent ! N'hésitez pas si vous avez des questions.",
            time: 'Hier',
            encrypted: false,
          },
        ],
      },
    };

    return (
      conversations[selectedConversation as keyof typeof conversations] ||
      conversations['alex-dubois']
    );
  };

  const getAllConversations = () => {
    const staticConversations = [
      {
        id: 'alex-dubois',
        name: 'Alex Dubois',
        avatar: '👤',
        lastMessage: '🔐 Message chiffré reçu',
        time: '14:32',
        unread: 2,
        online: true,
      },
      {
        id: 'equipe-securite',
        name: 'Équipe Sécurité',
        avatar: '👥',
        lastMessage: '🔐 Communication sécurisée active',
        time: '13:45',
        unread: 1,
        online: true,
      },
      {
        id: 'support-axiom',
        name: 'Support Axiom',
        avatar: '🏢',
        lastMessage: 'Bienvenue sur Axiom !',
        time: 'Hier',
        unread: 0,
        online: false,
      },
    ];

    // Ajouter les conversations dynamiques
    const dynamicConversationsList = Object.keys(dynamicConversations).map(
      id => {
        const conv = dynamicConversations[id];
        const lastMessage = conv.messages[conv.messages.length - 1];
        return {
          id,
          name: conv.name,
          avatar: conv.avatar,
          lastMessage: lastMessage ? lastMessage.text : 'Nouvelle conversation',
          time: lastMessage ? lastMessage.time : 'Maintenant',
          unread: 0,
          online: true,
        };
      },
    );

    return [...staticConversations, ...dynamicConversationsList];
  };

  const getFilteredConversations = () => {
    const conversations = getAllConversations();
    if (!searchText.trim()) {
      return conversations;
    }

    return conversations.filter(
      conv =>
        conv.name.toLowerCase().includes(searchText.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchText.toLowerCase()),
    );
  };

  const getAvailableContacts = () => {
    return [
      {
        id: 'marie-tech',
        name: 'Marie Lefort',
        avatar: '👩‍💻',
        status: '🟢 En ligne • Développeuse Senior',
        department: 'Technique',
      },
      {
        id: 'paul-security',
        name: 'Paul Dupont',
        avatar: '🛡️',
        status: '🟢 En ligne • Expert Sécurité',
        department: 'Sécurité',
      },
      {
        id: 'sophie-design',
        name: 'Sophie Martin',
        avatar: '🎨',
        status: '🟡 Absent • UI/UX Designer',
        department: 'Design',
      },
      {
        id: 'jean-manager',
        name: 'Jean Moreau',
        avatar: '👔',
        status: '🟢 En ligne • Chef de Projet',
        department: 'Management',
      },
      {
        id: 'lisa-qa',
        name: 'Lisa Chen',
        avatar: '🔍',
        status: '🟢 En ligne • QA Engineer',
        department: 'Qualité',
      },
      {
        id: 'thomas-admin',
        name: 'Thomas Admin',
        avatar: '⚙️',
        status: '🔴 Hors ligne • Administrateur',
        department: 'Système',
      },
    ];
  };

  const handleStartConversation = (contactId: string, contactName: string) => {
    // Créer une nouvelle conversation dynamique
    const newConversation: Conversation = {
      name: contactName,
      avatar:
        getAvailableContacts().find(c => c.id === contactId)?.avatar || '👤',
      status: '🟢 En ligne • Conversation démarrée',
      messages: [
        {
          type: 'received' as const,
          text: 'Salut ! Ravi de pouvoir discuter avec toi via Axiom ! 😊',
          time: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          encrypted: false,
        },
      ],
    };

    // Ajouter la conversation aux conversations dynamiques
    setDynamicConversations(prev => ({
      ...prev,
      [contactId]: newConversation,
    }));

    // Sélectionner cette nouvelle conversation et naviguer
    setSelectedConversation(contactId);
    setShowNewConversation(false);
    setActiveSection('axiomvibe');
    Alert.alert(
      'Nouvelle Conversation',
      `Conversation créée avec ${contactName} !`,
    );
  };

  const handleBackToConversations = () => {
    setShowNewConversation(false);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) {
      return;
    }

    const newMessage: Message = {
      type: 'sent' as const,
      text: messageText.trim(),
      time: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      encrypted: true,
    };

    // Ajouter le message à la conversation
    if (dynamicConversations[selectedConversation]) {
      // Conversation dynamique
      setDynamicConversations(prev => ({
        ...prev,
        [selectedConversation]: {
          ...prev[selectedConversation],
          messages: [...prev[selectedConversation].messages, newMessage],
        },
      }));
    } else {
      // Conversation statique - on peut créer une copie dynamique
      const currentConv = getConversationData();
      setDynamicConversations(prev => ({
        ...prev,
        [selectedConversation]: {
          ...currentConv,
          messages: [...currentConv.messages, newMessage],
        },
      }));
    }

    // Vider le champ de saisie
    setMessageText('');

    // Simuler une réponse automatique après 2-5 secondes
    setTimeout(() => {
      simulateContactResponse();
    }, 2000 + Math.random() * 3000);
  };

  const simulateContactResponse = () => {
    if (!selectedConversation) {
      return;
    }

    const responses = [
      'Message reçu et déchiffré avec succès! 🔒',
      'Communication sécurisée établie ✅',
      'Parfait, le chiffrement E2E fonctionne!',
      'Message authentifié et vérifié 🛡️',
      'Excellent! La sécurité est garantie.',
      'Merci pour ton message 😊',
      "C'est noté, je te réponds plus tard!",
      'Conversation sécurisée active 🔐',
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    const responseMessage: Message = {
      type: 'received' as const,
      text: randomResponse,
      time: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      encrypted: true,
    };

    // Ajouter la réponse à la conversation
    if (dynamicConversations[selectedConversation]) {
      setDynamicConversations(prev => ({
        ...prev,
        [selectedConversation]: {
          ...prev[selectedConversation],
          messages: [...prev[selectedConversation].messages, responseMessage],
        },
      }));
    } else {
      const currentConv = getConversationData();
      setDynamicConversations(prev => ({
        ...prev,
        [selectedConversation]: {
          ...currentConv,
          messages: [...currentConv.messages, responseMessage],
        },
      }));
    }
  };

  const handlePress = (feature: string) => {
    if (feature === 'Nouvelle Conversation') {
      setShowNewConversation(true);
      setActiveSection('conversations');
    } else if (feature === 'Conversations') {
      setShowNewConversation(false);
      setActiveSection('conversations');
    } else if (feature === 'Transfert Express') {
      setActiveSection('fichiers');
    } else if (feature === 'Test Chiffrement') {
      // Test de démonstration du chiffrement AES-256
      testEncryption();
    } else {
      setActiveSection(feature.toLowerCase());
    }
  };

  const testEncryption = () => {
    const testMessage = 'Message secret Axiom 🔐';
    // const testPassword = 'demo123'; // Variable pour les tests futurs

    Alert.alert(
      '🧪 Test Chiffrement AES-256',
      `Message original: "${testMessage}"\n\n` +
        '✅ Chiffrement: AES-256-CBC\n' +
        '✅ Clé: PBKDF2-SHA512 (100k iterations)\n' +
        '✅ Salt: 256 bits aléatoire\n' +
        '✅ IV: 128 bits aléatoire\n\n' +
        'Le message a été chiffré et déchiffré avec succès !\n\n' +
        'Note: En mode production, les messages seraient chiffrés bout-à-bout.',
      [
        { text: 'Voir détails techniques', onPress: showTechnicalDetails },
        { text: 'OK', style: 'default' },
      ],
    );
  };

  const showTechnicalDetails = () => {
    Alert.alert(
      '🔧 Détails Techniques',
      '🔐 Algorithme: AES-256-CBC\n' +
        '🔑 Dérivation: PBKDF2-SHA512\n' +
        '⚡ Itérations: 100,000\n' +
        '🎲 Salt: 256 bits (unique)\n' +
        '🎲 IV: 128 bits (aléatoire)\n' +
        '📊 Force: Military-Grade\n' +
        '✅ Conformité: FIPS-140-2\n' +
        '🛡️ Protection: Contre bruteforce\n\n' +
        'Status: Module crypto fonctionnel\n' +
        'Backend: En développement',
      [{ text: 'OK' }],
    );
  };

  // Fonctions pour gérer les paramètres
  const handleManageKeys = () => {
    Alert.alert(
      '🔑 Gestion des clés',
      'Fonctionnalités de gestion des clés de chiffrement :\n\n' +
        '• Génération de nouvelles clés\n' +
        '• Sauvegarde sécurisée\n' +
        '• Rotation des clés\n' +
        '• Import/Export\n\n' +
        'Cette fonctionnalité sera disponible dans la prochaine version.',
      [{ text: 'OK' }],
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      '🗂️ Nettoyer le cache',
      "Voulez-vous vraiment supprimer tous les fichiers temporaires et le cache de l'application ?",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Nettoyer',
          style: 'destructive',
          onPress: () => {
            // Simulation du nettoyage
            Alert.alert(
              '✅ Cache nettoyé',
              'Le cache a été supprimé avec succès.',
            );
          },
        },
      ],
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      "📋 Conditions d'utilisation",
      'Axiom - Application de communication sécurisée\n\n' +
        '• Respect de la vie privée\n' +
        '• Chiffrement de bout en bout\n' +
        '• Aucune collecte de données personnelles\n' +
        '• Code source ouvert\n\n' +
        'Version complète disponible sur le site web.',
      [{ text: 'OK' }],
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      '🛡️ Politique de confidentialité',
      'Engagement Axiom pour votre confidentialité :\n\n' +
        '✅ Aucune collecte de données\n' +
        '✅ Chiffrement local uniquement\n' +
        '✅ Pas de tracking\n' +
        '✅ Pas de publicité\n' +
        '✅ Code auditable\n\n' +
        'Vos données restent sur votre appareil.',
      [{ text: 'OK' }],
    );
  };

  // Nouvelles fonctions pour les paramètres fonctionnels
  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled) {
      Alert.alert(
        '🔔 Notifications activées',
        'Vous recevrez maintenant des notifications pour les nouveaux messages.',
        [{ text: 'OK' }],
      );
    } else {
      Alert.alert(
        '🔕 Notifications désactivées',
        'Vous ne recevrez plus de notifications push.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    Alert.alert(
      enabled ? '🔊 Sons activés' : '🔇 Sons désactivés',
      enabled
        ? 'Les notifications émettront maintenant un son.'
        : 'Les notifications seront silencieuses.',
      [{ text: 'OK' }],
    );
  };

  const handleBiometricAuthToggle = (enabled: boolean) => {
    setBiometricAuth(enabled);
    if (enabled) {
      Alert.alert(
        '👆 Authentification biométrique activée',
        'Utilisez votre empreinte ou Face ID pour déverrouiller l\'application.',
        [{ text: 'OK' }],
      );
    } else {
      Alert.alert(
        '🔒 Authentification biométrique désactivée',
        'L\'application ne nécessitera plus d\'authentification biométrique.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleAutoEncryptionToggle = (enabled: boolean) => {
    setAutoEncryption(enabled);
    Alert.alert(
      enabled ? '🔒 Chiffrement automatique activé' : '🔓 Chiffrement automatique désactivé',
      enabled
        ? 'Tous vos messages seront automatiquement chiffrés.'
        : 'Les messages ne seront plus chiffrés automatiquement.',
      [{ text: 'OK' }],
    );
  };

  const handleAutoBackupToggle = (enabled: boolean) => {
    setAutoBackup(enabled);
    Alert.alert(
      enabled ? '☁️ Sauvegarde automatique activée' : '📱 Sauvegarde automatique désactivée',
      enabled
        ? 'Vos conversations seront sauvegardées automatiquement.'
        : 'Les sauvegardes automatiques sont désactivées.',
      [{ text: 'OK' }],
    );
  };

  const handleAttachmentPress = () => {
    Alert.alert('Pièces jointes', 'Choisissez le type de fichier à envoyer :', [
      { text: '📷 Photo (Galerie)', onPress: () => selectImageFromLibrary() },
      { text: '📸 Photo (Caméra)', onPress: () => takePhotoWithCamera() },
      { text: '🎥 Vidéo', onPress: () => selectVideoFromLibrary() },
      { text: '📄 Document', onPress: () => selectDocument() },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const selectImageFromLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          sendFileMessage('📷', asset.fileName || 'image.jpg', asset.uri || '');
        }
      },
    );
  };

  const takePhotoWithCamera = () => {
    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          sendFileMessage('📸', asset.fileName || 'photo.jpg', asset.uri || '');
        }
      },
    );
  };

  const selectVideoFromLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'video' as MediaType,
        quality: 0.8,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          sendFileMessage('🎥', asset.fileName || 'video.mp4', asset.uri || '');
        }
      },
    );
  };

  const selectDocument = async () => {
    try {
      if (!DocumentPicker) {
        Alert.alert('Erreur', 'DocumentPicker non disponible');
        return;
      }

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      if (result && result[0]) {
        const file = result[0];
        sendFileMessage('📄', file.name || 'document', file.uri);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Erreur', 'Impossible de sélectionner le document');
      }
    }
  };

  const sendFileMessage = (emoji: string, fileName: string, _uri: string) => {
    if (!selectedConversation) {
      return;
    }

    const message = `${emoji} ${fileName}`;

    const newMessage: Message = {
      type: 'sent' as const,
      text: message,
      time: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      encrypted: true,
    };

    // Ajouter le message à la conversation
    if (dynamicConversations[selectedConversation]) {
      setDynamicConversations(prev => ({
        ...prev,
        [selectedConversation]: {
          ...prev[selectedConversation],
          messages: [...prev[selectedConversation].messages, newMessage],
        },
      }));
    } else {
      // Mise à jour pour les conversations statiques - Note: cette partie nécessite une refactorisation
      // Pour l'instant, on ne met pas à jour les conversations statiques car elles sont redéfinies à chaque render
      console.log(
        'Message ajouté à une conversation statique:',
        selectedConversation,
      );
    }

    Alert.alert(
      'Fichier envoyé',
      `${message}\n\nLe fichier a été ajouté à la conversation de manière sécurisée.`,
    );

    // Simulation d'une réponse du contact après 2 secondes
    setTimeout(() => {
      simulateContactFileResponse(fileName);
    }, 2000);
  };

  const simulateContactFileResponse = (fileName: string) => {
    if (!selectedConversation) {
      return;
    }

    const fileResponse = `👍 Fichier reçu : ${fileName}`;

    const responseMessage: Message = {
      type: 'received' as const,
      text: fileResponse,
      time: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      encrypted: true,
    };

    // Ajouter la réponse à la conversation
    if (dynamicConversations[selectedConversation]) {
      setDynamicConversations(prev => ({
        ...prev,
        [selectedConversation]: {
          ...prev[selectedConversation],
          messages: [...prev[selectedConversation].messages, responseMessage],
        },
      }));
    }
  };

  // Fonctions de gestion des transferts de fichiers
  const addFileToTransfer = (
    name: string,
    size: number,
    type: string,
    uri?: string,
  ) => {
    const newTransfer: FileTransfer = {
      id: Date.now().toString(),
      name,
      size,
      type,
      uri,
      status: 'pending',
      progress: 0,
      uploadTime: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      recipient: 'Cloud Sécurisé',
      encrypted: true,
    };

    setFileTransfers(prev => [newTransfer, ...prev]);
    startFileUpload(newTransfer.id);
  };

  const startFileUpload = (transferId: string) => {
    setFileTransfers(prev =>
      prev.map(transfer =>
        transfer.id === transferId
          ? { ...transfer, status: 'uploading' as const }
          : transfer,
      ),
    );

    // Simulation de progression d'upload
    const progressInterval = setInterval(() => {
      setFileTransfers(prev =>
        prev.map(transfer => {
          if (transfer.id === transferId && transfer.status === 'uploading') {
            const newProgress = Math.min(
              transfer.progress + Math.random() * 15,
              100,
            );

            if (newProgress >= 100) {
              clearInterval(progressInterval);
              return {
                ...transfer,
                progress: 100,
                status: 'completed' as const,
              };
            }

            return { ...transfer, progress: newProgress };
          }
          return transfer;
        }),
      );
    }, 200);

    // Auto-complétion après 6 secondes maximum
    setTimeout(() => {
      clearInterval(progressInterval);
      setFileTransfers(prev =>
        prev.map(transfer =>
          transfer.id === transferId && transfer.status === 'uploading'
            ? { ...transfer, progress: 100, status: 'completed' as const }
            : transfer,
        ),
      );
    }, 6000);
  };

  const cancelFileTransfer = (transferId: string) => {
    setFileTransfers(prev =>
      prev.map(transfer =>
        transfer.id === transferId
          ? { ...transfer, status: 'cancelled' as const }
          : transfer,
      ),
    );
  };

  const retryFileTransfer = (transferId: string) => {
    setFileTransfers(prev =>
      prev.map(transfer =>
        transfer.id === transferId
          ? { ...transfer, status: 'pending' as const, progress: 0 }
          : transfer,
      ),
    );
    startFileUpload(transferId);
  };

  const handleFileSelection = () => {
    Alert.alert(
      'Ajouter un fichier',
      'Choisissez le type de fichier à transférer :',
      [
        {
          text: '📷 Photos & Vidéos',
          onPress: () => showMediaOptions(),
        },
        {
          text: '📄 Documents',
          onPress: () => {
            selectDocumentFile().catch(error => {
              console.log('Document selection error:', error);
            });
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ],
    );
  };

  const showMediaOptions = () => {
    Alert.alert('Photos & Vidéos', 'Choisissez la source :', [
      {
        text: '� Photo (Galerie)',
        onPress: () => {
          selectFileFromLibrary();
        },
      },
      {
        text: '📸 Photo (Caméra)',
        onPress: () => {
          takeFileWithCamera();
        },
      },
      {
        text: '🎥 Vidéo (Galerie)',
        onPress: () => {
          selectVideoFile();
        },
      },
      { text: '← Retour', onPress: () => handleFileSelection() },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const selectFileFromLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      },
      (response: ImagePickerResponse) => {
        try {
          if (response.errorMessage) {
            console.error('Image library error:', response.errorMessage);
            Alert.alert('Erreur', "Impossible d'accéder à la galerie photo");
            return;
          }

          if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            addFileToTransfer(
              asset.fileName || 'photo.jpg',
              asset.fileSize || 0,
              'image',
              asset.uri,
            );
          }
        } catch (error) {
          console.error('Image selection error:', error);
          Alert.alert('Erreur', "Erreur lors de la sélection de l'image");
        }
      },
    );
  };

  const takeFileWithCamera = () => {
    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          addFileToTransfer(
            asset.fileName || 'photo.jpg',
            asset.fileSize || 0,
            'image',
            asset.uri,
          );
        }
      },
    );
  };

  const selectVideoFile = () => {
    launchImageLibrary(
      {
        mediaType: 'video' as MediaType,
        quality: 0.8,
      },
      (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          addFileToTransfer(
            asset.fileName || 'video.mp4',
            asset.fileSize || 0,
            'video',
            asset.uri,
          );
        }
      },
    );
  };

  const selectDocumentFile = async () => {
    try {
      if (!DocumentPicker) {
        Alert.alert('Erreur', 'DocumentPicker non disponible');
        return;
      }

      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      if (res && res.length > 0) {
        const file = res[0];
        addFileToTransfer(
          file.name || 'document',
          file.size || 0,
          file.type || 'document',
          file.uri,
        );
      }
    } catch (err: any) {
      // Gérer l'annulation de l'utilisateur
      if (DocumentPicker.isCancel(err)) {
        console.log('Document selection cancelled by user');
        return;
      }

      // Gérer les autres erreurs
      console.error('Document selection error:', err);
      Alert.alert(
        'Erreur',
        `Impossible de sélectionner le document: ${
          err.message || 'Erreur inconnue'
        }`,
        [{ text: 'OK' }],
      );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: FileTransfer['status']): string => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'uploading':
        return '📤';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '📄';
    }
  };

  const getStatusText = (status: FileTransfer['status']): string => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'uploading':
        return 'Transfert en cours';
      case 'completed':
        return 'Transféré';
      case 'failed':
        return 'Échec';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'conversations':
        if (showNewConversation) {
          return (
            <View style={styles.sectionContent}>
              {/* Header nouvelle conversation */}
              <View style={styles.conversationsHeader}>
                <TouchableOpacity
                  style={styles.newConversationBackButton}
                  onPress={handleBackToConversations}
                >
                  <Text style={styles.backButtonText}>← Retour</Text>
                </TouchableOpacity>
                <Text style={dynamicStyles.sectionTitle}>
                  ➕ Nouvelle Conversation
                </Text>
              </View>

              {/* Liste des contacts disponibles */}
              <ScrollView style={styles.contactsList}>
                <Text style={styles.contactsSubtitle}>
                  Sélectionnez un contact pour démarrer une conversation
                </Text>

                {getAvailableContacts().map(contact => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactItem}
                    onPress={() =>
                      handleStartConversation(contact.id, contact.name)
                    }
                  >
                    <View style={styles.contactRow}>
                      <Text style={styles.contactAvatar}>{contact.avatar}</Text>
                      <View style={styles.newContactInfo}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        <Text style={styles.contactStatus}>
                          {contact.status}
                        </Text>
                        <Text style={styles.contactDepartment}>
                          📂 {contact.department}
                        </Text>
                      </View>
                      <Text style={styles.startChatIcon}>💬</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        }

        return (
          <View style={styles.sectionContent}>
            {/* Header de la section avec recherche */}
            <View style={styles.conversationsHeader}>
              <Text style={dynamicStyles.sectionTitle}>
                💬 Conversations Sécurisées
              </Text>
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher une conversation..."
                  placeholderTextColor="#666666"
                  value={searchText}
                  onChangeText={setSearchText}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearSearchButton}
                    onPress={() => setSearchText('')}
                  >
                    <Text style={styles.clearSearchIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Sécurité Axiom - Protection Réelle */}
            <View style={styles.axiomSecurityContainer}>
              <View style={styles.axiomSecurityHeader}>
                <Text style={styles.axiomSecurityTitle}>
                  🔐 Axiom Security - Chiffrement Local
                </Text>
                <View style={styles.securityStatus}>
                  <View style={styles.securityStatusDot} />
                  <Text style={styles.securityStatusText}>Actif</Text>
                </View>
              </View>
              <Text style={styles.axiomSecurityDescription}>
                AES-256 Local • PBKDF2 • Stockage Chiffré
              </Text>
              <View style={styles.securityFeatures}>
                <View style={styles.securityFeature}>
                  <Text style={styles.featureIcon}>🔒</Text>
                  <Text style={styles.featureText}>Chiffrement AES-256</Text>
                </View>
                <View style={styles.securityFeature}>
                  <Text style={styles.featureIcon}>📱</Text>
                  <Text style={styles.featureText}>Stockage Sécurisé</Text>
                </View>
                <View style={styles.securityFeature}>
                  <Text style={styles.featureIcon}>⚠️</Text>
                  <Text style={styles.featureText}>Mode Démo</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.axiomSecurityButton}
                onPress={() => handlePress('Test Chiffrement')}
              >
                <Text style={styles.axiomSecurityButtonText}>
                  🧪 Test Chiffrement
                </Text>
              </TouchableOpacity>
            </View>

            {/* Liste des conversations */}
            <View style={styles.conversationsList}>
              {getFilteredConversations().length === 0 ? (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsIcon}>�</Text>
                  <Text style={styles.noResultsText}>
                    Aucune conversation trouvée pour "{searchText}"
                  </Text>
                  <Text style={styles.noResultsSubtext}>
                    Essayez avec un autre terme de recherche
                  </Text>
                </View>
              ) : (
                getFilteredConversations().map(conversation => (
                  <TouchableOpacity
                    key={conversation.id}
                    style={styles.conversationItem}
                    onPress={() =>
                      handleConversationPress(
                        conversation.id,
                        conversation.name,
                      )
                    }
                  >
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatar}>{conversation.avatar}</Text>
                      {conversation.online && (
                        <View style={styles.onlineIndicator} />
                      )}
                    </View>
                    <View style={styles.conversationInfo}>
                      <View style={styles.conversationHeader}>
                        <Text style={styles.contactName}>
                          {conversation.name}
                        </Text>
                        <Text style={styles.messageTime}>
                          {conversation.time}
                        </Text>
                      </View>
                      <Text style={styles.lastMessage}>
                        {conversation.lastMessage}
                      </Text>
                      <View style={styles.conversationMeta}>
                        <Text style={styles.encryptionLevel}>
                          {conversation.id === 'support-axiom'
                            ? 'E2E'
                            : 'AES-256'}
                        </Text>
                        {conversation.unread > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCount}>
                              {conversation.unread}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Bouton nouvelle conversation */}
            <TouchableOpacity
              style={styles.newConversationButton}
              onPress={() => handlePress('Nouvelle Conversation')}
            >
              <Text style={styles.newConversationText}>
                ➕ Nouvelle Conversation
              </Text>
            </TouchableOpacity>

            {/* Statistiques de sécurité */}
            <View style={styles.securityStats}>
              <View style={styles.securityStat}>
                <Text style={styles.securityStatValue}>3</Text>
                <Text style={styles.securityStatLabel}>
                  Conversations actives
                </Text>
              </View>
              <View style={styles.securityStat}>
                <Text style={styles.securityStatValue}>256</Text>
                <Text style={styles.securityStatLabel}>Bits AES</Text>
              </View>
              <View style={styles.securityStat}>
                <Text style={styles.securityStatValue}>100%</Text>
                <Text style={styles.securityStatLabel}>Chiffrées</Text>
              </View>
            </View>
          </View>
        );
      case 'axiomvibe':
        return (
          <Animated.View
            style={[
              styles.axiomVibeContainer,
              {
                transform: [{ translateX: shakeAnimation }],
              },
            ]}
          >
            {/* Header AxiomVibe */}
            <View style={styles.axiomVibeHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setActiveSection('conversations')}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <View style={styles.contactInfo}>
                <Text style={styles.contactAvatar}>
                  {getConversationData().avatar}
                </Text>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactNameHeader}>
                    {getConversationData().name}
                  </Text>
                  <Text style={styles.contactStatus}>
                    {getConversationData().status}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={showVibeHistory}
              >
                <Text style={styles.historyIcon}>📳</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.callButton}>
                <Text style={styles.callIcon}>📞</Text>
              </TouchableOpacity>
            </View>

            {/* Zone de messages */}
            <ScrollView style={styles.messagesContainer}>
              <View style={styles.messagesList}>
                {getConversationData().messages.map((message, index) => {
                  if (message.type === 'received') {
                    return (
                      <View key={index} style={styles.messageReceived}>
                        <View style={styles.messageReceivedBubble}>
                          {message.encrypted && (
                            <View style={styles.encryptionIndicator}>
                              <Text style={styles.encryptionIcon}>🔐</Text>
                              <Text style={styles.encryptionText}>
                                Message chiffré AES-256
                              </Text>
                            </View>
                          )}
                          <Text style={styles.messageReceivedText}>
                            {message.text}
                          </Text>
                          <Text style={styles.messageTime}>{message.time}</Text>
                        </View>
                      </View>
                    );
                  } else {
                    return (
                      <View key={index} style={styles.messageSent}>
                        <View style={styles.messageSentBubble}>
                          {message.encrypted && (
                            <View style={styles.encryptionProgress}>
                              <Text style={styles.encryptionIcon}>⚡</Text>
                              <Text style={styles.encryptionText}>
                                Chiffrement en cours...
                              </Text>
                            </View>
                          )}
                          <Text style={styles.messageSentText}>
                            {message.text}
                          </Text>
                          <Text style={styles.messageTimeSent}>
                            {message.time}
                          </Text>
                        </View>
                      </View>
                    );
                  }
                })}

                {/* Message AxiomVibe reçu - Conditionnel */}
                {selectedConversation === 'alex-dubois' && (
                  <View style={styles.vibeMessage}>
                    <View style={styles.vibeMessageBubble}>
                      <View style={styles.vibeIndicator}>
                        <Text style={styles.vibeMessageIcon}>📳</Text>
                        <Text style={styles.vibeMessageText}>
                          AxiomVibe reçu !
                        </Text>
                      </View>
                      <Text style={styles.vibeDescription}>
                        {getConversationData().name} vous a envoyé un vibe
                        sécurisé
                      </Text>
                      <Text style={styles.messageTime}>14:34</Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Barre de saisie */}
            <View style={styles.inputContainer}>
              <View style={styles.securityIndicator}>
                <Text style={styles.securityIcon}>🔐</Text>
                <Text style={styles.securityLabel}>AES-256</Text>
              </View>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.attachButton}
                  onPress={handleAttachmentPress}
                >
                  <Text style={styles.attachIcon}>📎</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Tapez votre message..."
                  placeholderTextColor="#666666"
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline={true}
                  maxLength={500}
                  autoCapitalize="sentences"
                  autoCorrect={true}
                />
                <TouchableOpacity
                  style={[
                    styles.vibeButton,
                    isVibrating && styles.vibeButtonActive,
                  ]}
                  onPress={handleVibePress}
                >
                  <Text
                    style={[
                      styles.vibeIcon,
                      isVibrating && styles.vibeIconActive,
                    ]}
                  >
                    📳
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    messageText.trim() ? styles.sendButtonActive : null,
                  ]}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <Text style={styles.sendIcon}>🚀</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        );
      case 'fichiers':
        return (
          <View style={styles.sectionContent}>
            <View style={styles.fileHeader}>
              <View style={styles.fileTitleContainer}>
                <Text style={dynamicStyles.sectionTitle}>
                  📁 Transfert de Fichiers
                </Text>
                <Text style={styles.sectionDescription}>
                  Partage sécurisé avec chiffrement AES-256
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addFileButton}
                onPress={handleFileSelection}
              >
                <Text style={styles.addFileIcon}>➕</Text>
              </TouchableOpacity>
            </View>

            {fileTransfers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📂</Text>
                <Text style={styles.emptyStateText}>
                  Aucun transfert en cours
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Appuyez sur ➕ pour ajouter un fichier
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.transfersList}
                showsVerticalScrollIndicator={false}
              >
                {fileTransfers.map(transfer => (
                  <View key={transfer.id} style={styles.transferItem}>
                    <View style={styles.transferHeader}>
                      <View style={styles.transferInfo}>
                        <Text style={styles.transferIcon}>
                          {transfer.type === 'image'
                            ? '📷'
                            : transfer.type === 'video'
                            ? '🎥'
                            : transfer.type === 'document'
                            ? '📄'
                            : '📎'}
                        </Text>
                        <View style={styles.transferDetails}>
                          <Text style={styles.transferName} numberOfLines={1}>
                            {transfer.name}
                          </Text>
                          <Text style={styles.transferMeta}>
                            {formatFileSize(transfer.size)} •{' '}
                            {transfer.uploadTime}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.transferStatus}>
                        <Text style={styles.statusIcon}>
                          {getStatusIcon(transfer.status)}
                        </Text>
                        <Text style={styles.statusText}>
                          {getStatusText(transfer.status)}
                        </Text>
                      </View>
                    </View>

                    {transfer.status === 'uploading' && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${transfer.progress}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {Math.round(transfer.progress)}%
                        </Text>
                      </View>
                    )}

                    {transfer.status === 'completed' && (
                      <View style={styles.completedInfo}>
                        <Text style={styles.completedText}>
                          � Fichier chiffré et transféré vers{' '}
                          {transfer.recipient}
                        </Text>
                      </View>
                    )}

                    {(transfer.status === 'failed' ||
                      transfer.status === 'cancelled') && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.retryButton}
                          onPress={() => retryFileTransfer(transfer.id)}
                        >
                          <Text style={styles.retryButtonText}>
                            🔄 Réessayer
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {transfer.status === 'uploading' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => cancelFileTransfer(transfer.id)}
                        >
                          <Text style={styles.cancelButtonText}>
                            ❌ Annuler
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.fileStatsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statusIcon}>�</Text>
                <Text style={styles.statusText}>
                  {fileTransfers.filter(t => t.status === 'completed').length}{' '}
                  transférés
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statusIcon}>⏳</Text>
                <Text style={styles.statusText}>
                  {
                    fileTransfers.filter(
                      t => t.status === 'uploading' || t.status === 'pending',
                    ).length
                  }{' '}
                  en cours
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statusIcon}>🔐</Text>
                <Text style={styles.statusText}>Chiffrement AES-256</Text>
              </View>
            </View>
          </View>
        );
      case 'paramètres':
        return (
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.settingsContent}
          >
            {/* Header amélioré */}
            <View style={styles.settingsHeader}>
              <Text style={dynamicStyles.settingsTitle}>⚙️ Paramètres</Text>
              <Text style={styles.settingsSubtitle}>
                Personnalisez votre expérience Axiom
              </Text>
            </View>
            {/* Section Apparence */}
            <View style={dynamicStyles.settingsCard}>
              <View style={styles.settingsSectionHeader}>
                <Text style={dynamicStyles.settingsSectionTitle}>🎨 Apparence</Text>
                <Text style={styles.settingsSectionSubtitle}>
                  Personnalisez l'interface
                </Text>
              </View>

              <View style={styles.settingsGroup}>
                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={dynamicStyles.settingLabel}>Mode sombre</Text>
                    <Text style={styles.settingDescription}>
                      Interface sombre pour les yeux
                    </Text>
                  </View>
                  <Switch
                    value={darkMode}
                    onValueChange={setDarkMode}
                    trackColor={{ false: '#2C2C2E', true: '#007AFF' }}
                    thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              </View>
            </View>
            {/* Section Notifications */}
            <View style={dynamicStyles.settingsCard}>
              <View style={styles.settingsSectionHeader}>
                <Text style={dynamicStyles.settingsSectionTitle}>
                  🔔 Notifications
                </Text>
                <Text style={styles.settingsSectionSubtitle}>
                  Gérez vos alertes
                </Text>
              </View>

              <View style={styles.settingsGroup}>
                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={dynamicStyles.settingLabel}>Notifications push</Text>
                    <Text style={styles.settingDescription}>
                      Recevoir les alertes
                    </Text>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleNotificationsToggle}
                    trackColor={{ false: '#2C2C2E', true: '#007AFF' }}
                    thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>

                <View style={styles.settingsSeparator} />

                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={dynamicStyles.settingLabel}>Sons</Text>
                    <Text style={styles.settingDescription}>
                      Sons de notification
                    </Text>
                  </View>
                  <Switch
                    value={soundEnabled}
                    onValueChange={handleSoundToggle}
                    trackColor={{ false: '#2C2C2E', true: '#007AFF' }}
                    thumbColor={soundEnabled ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              </View>
            </View>
            {/* Section Sécurité */}
            <View style={dynamicStyles.settingsCard}>
              <View style={styles.settingsSectionHeader}>
                <Text style={dynamicStyles.settingsSectionTitle}>🔒 Sécurité</Text>
                <Text style={styles.settingsSectionSubtitle}>
                  Protection avancée
                </Text>
              </View>

              <View style={styles.settingsGroup}>
                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={dynamicStyles.settingLabel}>
                      Chiffrement automatique
                    </Text>
                    <Text style={styles.settingDescription}>
                      Chiffrer tous les messages
                    </Text>
                  </View>
                  <Switch
                    value={autoEncryption}
                    onValueChange={handleAutoEncryptionToggle}
                    trackColor={{ false: '#2C2C2E', true: '#007AFF' }}
                    thumbColor={autoEncryption ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>

                <View style={styles.settingsSeparator} />

                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={dynamicStyles.settingLabel}>
                      Authentification biométrique
                    </Text>
                    <Text style={styles.settingDescription}>
                      Empreinte ou Face ID
                    </Text>
                  </View>
                  <Switch
                    value={biometricAuth}
                    onValueChange={handleBiometricAuthToggle}
                    trackColor={{ false: '#2C2C2E', true: '#007AFF' }}
                    thumbColor={biometricAuth ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>

                <View style={styles.settingsSeparator} />

                <TouchableOpacity
                  style={styles.settingActionButton}
                  onPress={handleManageKeys}
                >
                  <Text style={styles.settingActionIcon}>🔑</Text>
                  <Text style={dynamicStyles.settingActionText}>
                    Gérer les clés de chiffrement
                  </Text>
                  <Text style={styles.settingActionArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Section Stockage */}
            <View style={dynamicStyles.settingsCard}>
              <View style={styles.settingsSectionHeader}>
                <Text style={dynamicStyles.settingsSectionTitle}>💾 Stockage</Text>
                <Text style={styles.settingsSectionSubtitle}>
                  Gestion des données
                </Text>
              </View>

              <View style={styles.settingsGroup}>
                <View style={styles.settingItem}>
                  <View style={styles.settingContent}>
                    <Text style={dynamicStyles.settingLabel}>
                      Sauvegarde automatique
                    </Text>
                    <Text style={styles.settingDescription}>
                      Backup des conversations
                    </Text>
                  </View>
                  <Switch
                    value={autoBackup}
                    onValueChange={handleAutoBackupToggle}
                    trackColor={{ false: '#2C2C2E', true: '#007AFF' }}
                    thumbColor={autoBackup ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>

                <View style={styles.settingsSeparator} />

                <TouchableOpacity
                  style={styles.settingActionButton}
                  onPress={handleClearCache}
                >
                  <Text style={styles.settingActionIcon}>🗂️</Text>
                  <Text style={dynamicStyles.settingActionText}>
                    Nettoyer le cache
                  </Text>
                  <Text style={styles.settingActionArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Section À propos */}
            <View style={dynamicStyles.settingsCard}>
              <View style={styles.settingsSectionHeader}>
                <Text style={dynamicStyles.settingsSectionTitle}>ℹ️ À propos</Text>
                <Text style={styles.settingsSectionSubtitle}>
                  Informations sur l'app
                </Text>
              </View>

              <View style={styles.settingsGroup}>
                <View style={styles.settingInfoItem}>
                  <Text style={dynamicStyles.settingLabel}>
                    Version de l'application
                  </Text>
                  <Text style={styles.settingValue}>Axiom 1.0.0</Text>
                </View>

                <View style={styles.settingsSeparator} />

                <View style={styles.settingInfoItem}>
                  <Text style={dynamicStyles.settingLabel}>Dernière mise à jour</Text>
                  <Text style={styles.settingValue}>13 septembre 2025</Text>
                </View>

                <View style={styles.settingsSeparator} />

                <TouchableOpacity
                  style={styles.settingActionButton}
                  onPress={handleTermsOfService}
                >
                  <Text style={styles.settingActionIcon}>📋</Text>
                  <Text style={dynamicStyles.settingActionText}>
                    Conditions d'utilisation
                  </Text>
                  <Text style={styles.settingActionArrow}>›</Text>
                </TouchableOpacity>

                <View style={styles.settingsSeparator} />

                <TouchableOpacity
                  style={styles.settingActionButton}
                  onPress={handlePrivacyPolicy}
                >
                  <Text style={styles.settingActionIcon}>🛡️</Text>
                  <Text style={dynamicStyles.settingActionText}>
                    Politique de confidentialité
                  </Text>
                  <Text style={styles.settingActionArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.bottomSpacer} />
          </ScrollView>
        );
      case 'stockage':
        return (
          <View style={styles.sectionContent}>
            <Text style={dynamicStyles.sectionTitle}>💾 Stockage</Text>
            <Text style={styles.sectionDescription}>
              Gestion de l'espace et sauvegarde
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>📊 Utilisation de l'espace</Text>
              <Text style={styles.featureItem}>☁️ Sauvegarde cloud</Text>
              <Text style={styles.featureItem}>🧹 Nettoyage automatique</Text>
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.sectionContent}>
            {/* En-tête d'accueil */}
            <View style={styles.welcomeHeader}>
              <Text style={styles.welcomeTitle}>Bienvenue sur Axiom</Text>
              <Text style={styles.welcomeSubtitle}>
                Votre plateforme de communication ultra-sécurisée
              </Text>
            </View>

            {/* Statistiques de sécurité */}
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>📊 Statut de Sécurité</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statusIcon}>🔐</Text>
                  <Text style={styles.statusText}>256-bit</Text>
                  <Text style={styles.statLabel}>Chiffrement AES</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statusIcon}>🛡️</Text>
                  <Text style={styles.statusText}>100%</Text>
                  <Text style={styles.statLabel}>Sécurisé</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statusIcon}>⚡</Text>
                  <Text style={styles.statusText}>0.02s</Text>
                  <Text style={styles.statLabel}>Latence</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statusIcon}>🌐</Text>
                  <Text style={styles.statusText}>P2P</Text>
                  <Text style={styles.statLabel}>Direct</Text>
                </View>
              </View>
            </View>

            {/* Raccourcis rapides */}
            <View style={styles.quickActions}>
              <Text style={styles.quickActionsTitle}>🚀 Actions Rapides</Text>
              <View style={styles.actionGrid}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => handlePress('Nouvelle Conversation')}
                >
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionTitle}>Nouveau Chat</Text>
                  <Text style={styles.actionSubtitle}>
                    Démarrer une conversation sécurisée
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => handlePress('Transfert Express')}
                >
                  <Text style={styles.actionIcon}>📁</Text>
                  <Text style={styles.actionTitle}>Envoi Rapide</Text>
                  <Text style={styles.actionSubtitle}>
                    Transférer un fichier instantanément
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Indicateur de statut */}
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                Système opérationnel - Tous les services actifs
              </Text>
            </View>

            {/* Informations sur la version */}
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>
                Axiom v1.0.0 • Build 2025.09.13
              </Text>
              <Text style={styles.versionText}>
                Dernière synchronisation: Il y a quelques secondes
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: currentTheme.background }]}
      >
        {/* Header avec logo */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image
                source={require('./images/logo2_axiom.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Axiom</Text>
              <Text style={styles.headerSubtitle}>Communication Sécurisée</Text>
            </View>
          </View>
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>{renderContent()}</View>
      </ScrollView>

      {/* Barre de navigation */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[
            styles.navButton,
            activeSection === 'Accueil' && styles.activeNavButton,
          ]}
          onPress={() => handlePress('Accueil')}
        >
          <Text
            style={[
              styles.navText,
              activeSection === 'Accueil' && styles.activeNavText,
            ]}
          >
            🏠
          </Text>
          <Text
            style={[
              styles.navLabel,
              activeSection === 'Accueil' && styles.activeNavLabel,
            ]}
          >
            Accueil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            activeSection === 'conversations' && styles.activeNavButton,
          ]}
          onPress={() => handlePress('Conversations')}
        >
          <Text
            style={[
              styles.navText,
              activeSection === 'conversations' && styles.activeNavText,
            ]}
          >
            💬
          </Text>
          <Text
            style={[
              styles.navLabel,
              activeSection === 'conversations' && styles.activeNavLabel,
            ]}
          >
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            activeSection === 'fichiers' && styles.activeNavButton,
          ]}
          onPress={() => handlePress('Fichiers')}
        >
          <Text
            style={[
              styles.navText,
              activeSection === 'fichiers' && styles.activeNavText,
            ]}
          >
            📁
          </Text>
          <Text
            style={[
              styles.navLabel,
              activeSection === 'fichiers' && styles.activeNavLabel,
            ]}
          >
            Fichiers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            activeSection === 'paramètres' && styles.activeNavButton,
          ]}
          onPress={() => handlePress('Paramètres')}
        >
          <Text
            style={[
              styles.navText,
              activeSection === 'paramètres' && styles.activeNavText,
            ]}
          >
            ⚙️
          </Text>
          <Text
            style={[
              styles.navLabel,
              activeSection === 'paramètres' && styles.activeNavLabel,
            ]}
          >
            Config
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            activeSection === 'stockage' && styles.activeNavButton,
          ]}
          onPress={() => handlePress('Stockage')}
        >
          <Text
            style={[
              styles.navText,
              activeSection === 'stockage' && styles.activeNavText,
            ]}
          >
            💾
          </Text>
          <Text
            style={[
              styles.navLabel,
              activeSection === 'stockage' && styles.activeNavLabel,
            ]}
          >
            Stockage
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1929',
  },
  header: {
    backgroundColor: '#0B0B0B',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 15,
  },
  logoContainer: {
    position: 'absolute',
    left: 15,
    top: '50%',
    transform: [{ translateY: -35 }],
    padding: 0,
    backgroundColor: '#0B0B0B',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BDC3C7',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#BDC3C7',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    fontSize: 14,
    color: '#85C1E9',
    marginBottom: 8,
    paddingLeft: 10,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 20,
    color: '#85C1E9',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#BDC3C7',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#52C41A',
    marginBottom: 5,
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: '#0B0B0B',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  activeNavButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'center',
  },
  navText: {
    fontSize: 16,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10,
    color: '#BDC3C7',
    textAlign: 'center',
  },
  activeNavText: {
    fontSize: 18,
  },
  activeNavLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Nouveaux styles pour l'écran d'accueil
  welcomeHeader: {
    marginBottom: 25,
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#0D1929',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 20,
  },
  quickActionsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  actionSubtitle: {
    color: '#CCCCCC',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  versionText: {
    color: '#666666',
    fontSize: 10,
    marginBottom: 2,
  },
  // Styles pour l'écran conversations avec Axiom Security
  conversationsHeader: {
    marginBottom: 20,
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchPlaceholder: {
    color: '#666666',
    fontSize: 14,
    flex: 1,
  },
  axiomSecurityContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 15,
    marginBottom: 25,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#4A9EFF',
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
  },
  axiomSecurityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  axiomSecurityTitle: {
    color: '#4A9EFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    flexWrap: 'wrap',
  },
  securityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  securityStatusText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  axiomSecurityDescription: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 16,
    textAlign: 'left',
  },
  securityFeatures: {
    marginBottom: 15,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 20,
  },
  featureText: {
    color: '#CCCCCC',
    fontSize: 12,
    flex: 1,
    flexWrap: 'wrap',
  },
  axiomSecurityButton: {
    backgroundColor: '#4A9EFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  axiomSecurityButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  conversationsList: {
    width: '100%',
    marginBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    fontSize: 32,
    width: 50,
    height: 50,
    textAlign: 'center',
    lineHeight: 50,
    backgroundColor: '#0D1929',
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  lastMessage: {
    color: '#CCCCCC',
    fontSize: 13,
    marginBottom: 8,
  },
  conversationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  encryptionLevel: {
    color: '#4A9EFF',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#0D1929',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unreadBadge: {
    backgroundColor: '#FF4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  newConversationButton: {
    backgroundColor: '#4A9EFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  newConversationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
  },
  securityStat: {
    alignItems: 'center',
  },
  securityStatValue: {
    color: '#4A9EFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  securityStatLabel: {
    color: '#CCCCCC',
    fontSize: 11,
    textAlign: 'center',
  },
  // Styles AxiomVibe - Interface de chat
  axiomVibeContainer: {
    flex: 1,
    backgroundColor: '#0D1929',
  },
  axiomVibeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0B0B',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#4A9EFF',
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactNameHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  contactStatus: {
    color: '#4CAF50',
    fontSize: 12,
  },
  callButton: {
    padding: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
  },
  callIcon: {
    fontSize: 20,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#0D1929',
  },
  messagesList: {
    padding: 15,
  },
  messageReceived: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  messageReceivedBubble: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    padding: 12,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#333333',
  },
  messageReceivedText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  messageSent: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  messageSentBubble: {
    backgroundColor: '#4A9EFF',
    borderRadius: 18,
    borderTopRightRadius: 4,
    padding: 12,
    maxWidth: '80%',
  },
  messageSentText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  messageTime: {
    color: '#CCCCCC',
    fontSize: 10,
    textAlign: 'left',
  },
  messageTimeSent: {
    color: '#E3F2FD',
    fontSize: 10,
    textAlign: 'right',
  },
  encryptionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1929',
    borderRadius: 10,
    padding: 6,
    marginBottom: 8,
  },
  encryptionProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 6,
    marginBottom: 8,
  },
  encryptionIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  encryptionText: {
    color: '#4A9EFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  inputContainer: {
    backgroundColor: '#0B0B0B',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 6,
    marginBottom: 10,
  },
  securityIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  securityLabel: {
    color: '#4A9EFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachButton: {
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginRight: 10,
  },
  attachIcon: {
    fontSize: 18,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 100,
    minHeight: 44,
  },
  inputPlaceholder: {
    color: '#666666',
    fontSize: 14,
  },
  sendButton: {
    padding: 12,
    backgroundColor: '#333333',
    borderRadius: 20,
    opacity: 0.5,
  },
  sendButtonActive: {
    backgroundColor: '#4A9EFF',
    opacity: 1,
  },
  sendIcon: {
    fontSize: 18,
  },
  // Styles AxiomVibe - Bouton de vibration
  vibeButton: {
    padding: 12,
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  vibeButtonActive: {
    backgroundColor: '#FF4500',
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  vibeIcon: {
    fontSize: 18,
    textAlign: 'center',
  },
  vibeIconActive: {
    fontSize: 20,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  // Styles pour messages AxiomVibe
  vibeMessage: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  vibeMessageBubble: {
    backgroundColor: '#FF6B35',
    borderRadius: 15,
    padding: 12,
    maxWidth: '70%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF4500',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  vibeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  vibeMessageIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  vibeMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  vibeDescription: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
    opacity: 0.9,
  },
  // Style pour bouton historique des vibes
  historyButton: {
    padding: 10,
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    marginRight: 8,
  },
  historyIcon: {
    fontSize: 16,
  },
  // Styles pour la recherche
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 0,
    marginLeft: 8,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearSearchIcon: {
    color: '#666666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Styles pour les résultats de recherche
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  noResultsText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  // Styles pour nouvelle conversation
  newConversationBackButton: {
    padding: 8,
    backgroundColor: '#0D1929',
    borderRadius: 8,
    marginRight: 10,
  },
  backButtonText: {
    color: '#4A9EFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contactsList: {
    flex: 1,
    marginTop: 10,
  },
  contactsSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    opacity: 0.8,
  },
  contactItem: {
    backgroundColor: '#0D1929',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  newContactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactDepartment: {
    color: '#4A9EFF',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  startChatIcon: {
    color: '#4A9EFF',
    fontSize: 18,
    opacity: 0.7,
  },

  // Styles pour le transfert de fichiers
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fileTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  addFileButton: {
    backgroundColor: '#4A9EFF',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  addFileIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  transfersList: {
    flex: 1,
    marginTop: 16,
  },
  transferItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transferInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  transferIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transferDetails: {
    flex: 1,
  },
  transferName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transferMeta: {
    color: '#8E8E93',
    fontSize: 12,
  },
  transferStatus: {
    alignItems: 'flex-end',
  },
  statusIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#2C2C2E',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A9EFF',
    borderRadius: 2,
  },
  progressText: {
    color: '#4A9EFF',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  completedInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#0D4F1C',
    borderRadius: 6,
  },
  completedText: {
    color: '#30D158',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  retryButton: {
    backgroundColor: '#FF9F0A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF453A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fileStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  // Styles pour les paramètres améliorés
  settingsContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  settingsHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  settingsSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingsSectionHeader: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  settingsSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingsSectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingsGroup: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 60,
  },
  settingInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingsSeparator: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginLeft: 20,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  settingActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
  },
  settingActionIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  settingActionText: {
    flex: 1,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  settingActionArrow: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '300',
  },
  // Styles originaux conservés pour compatibilité
  settingsSection: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  bottomSpacer: {
    height: 50,
  },
});

export default App;
