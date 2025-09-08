import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';

// Écran d'accueil (HomeScreen)
const HomeScreen = ({ onNavigate }) => {
  // Données simulées pour les conversations
  const conversations = [
    {
      id: '1',
      contactName: 'Marie Dupont',
      avatar: '👩',
      lastMessage: 'Oui, à demain alors !',
      time: '12:30',
      isHQ: true,
      unread: true,
    },
    {
      id: '2',
      contactName: 'Jean Martin',
      avatar: '👨',
      lastMessage: "J'ai reçu le fichier, merci",
      time: '11:15',
      isHQ: false,
      unread: false,
    },
    {
      id: '3',
      contactName: 'Sophie Bernard',
      avatar: '👧',
      lastMessage: 'Tu as vu les photos ?',
      time: '09:45',
      isHQ: true,
      unread: true,
    },
    {
      id: '4',
      contactName: 'Paul Durand',
      avatar: '👴',
      lastMessage: 'Appelle-moi quand tu peux',
      time: 'Hier',
      isHQ: false,
      unread: false,
    },
    {
      id: '5',
      contactName: 'Lucie Moreau',
      avatar: '👩‍🦰',
      lastMessage: 'On se retrouve au café ?',
      time: 'Hier',
      isHQ: true,
      unread: false,
    },
  ];

  const renderConversationItem = item => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.conversationItem}
        onPress={() =>
          onNavigate('Conversation', {
            contactId: item.id,
            contactName: item.contactName,
          })
        }
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          {item.isHQ && (
            <View style={styles.hqBadge}>
              <Text style={styles.hqBadgeText}>HQ</Text>
            </View>
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.contactName}>{item.contactName}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>

          <View style={styles.conversationFooter}>
            <Text
              style={[styles.lastMessage, item.unread && styles.unreadMessage]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.lastMessage}
            </Text>
            {item.unread && <View style={styles.unreadBadge} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Conversations</Text>
      </View>

      <ScrollView style={styles.conversationsList}>
        {conversations.map(item => renderConversationItem(item))}
      </ScrollView>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.newConversationButton]}
          onPress={() => onNavigate('Conversation', { isNew: true })}
        >
          <Text style={styles.actionButtonText}>+ Nouvelle conversation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.settingsButton]}
          onPress={() => onNavigate('Settings')}
        >
          <Text style={styles.actionButtonText}>⚙️ Paramètres</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Écran de conversation (ConversationScreen)
const ConversationScreen = ({ route, onNavigate }) => {
  const [message, setMessage] = useState('');
  const contactName = route?.params?.contactName || 'Nouvelle conversation';
  const isNew = route?.params?.isNew || false;

  // Messages simulés
  const messages = isNew
    ? []
    : [
        {
          id: 1,
          text: 'Bonjour, comment vas-tu ?',
          sender: 'them',
          time: '10:30',
        },
        {
          id: 2,
          text: 'Très bien merci, et toi ?',
          sender: 'me',
          time: '10:31',
        },
        {
          id: 3,
          text: "Bien aussi ! As-tu reçu les fichiers que je t'ai envoyés hier ?",
          sender: 'them',
          time: '10:32',
        },
        {
          id: 4,
          text: 'Oui, tout est parfait. Je les examine actuellement.',
          sender: 'me',
          time: '10:33',
        },
        {
          id: 5,
          text: "Super ! N'hésite pas si tu as des questions.",
          sender: 'them',
          time: '10:35',
        },
      ];

  const sendMessage = () => {
    if (message.trim() !== '') {
      // Utiliser une approche non-bloquante au lieu de alert
      console.log(`Message envoyé: ${message}`);
      // TODO: Implémenter un toast ou une notification
      setMessage('');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => onNavigate('Home')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{contactName}</Text>
        <TouchableOpacity
          onPress={() => onNavigate('FileTransfer')}
          style={styles.fileButton}
        >
          <Text style={styles.fileButtonText}>📎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === 'me' ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
            <Text style={styles.messageTime}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Tapez votre message..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Écran de transfert de fichiers (FileTransferScreen)
const FileTransferScreen = ({ onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const files = [
    { id: '1', name: 'Document.pdf', size: '2.4 MB', icon: '📄' },
    { id: '2', name: 'Photo.jpg', size: '1.8 MB', icon: '🖼️' },
    { id: '3', name: 'Présentation.pptx', size: '5.7 MB', icon: '📊' },
    { id: '4', name: 'Tableau.xlsx', size: '1.2 MB', icon: '📉' },
  ];

  const selectFile = file => {
    setSelectedFile(file);
  };

  const sendFile = () => {
    if (selectedFile) {
      // Utiliser une approche non-bloquante au lieu de alert
      console.log(`Fichier envoyé: ${selectedFile.name}`);
      // TODO: Implémenter un toast ou une notification
      onNavigate('Conversation');
    } else {
      console.warn('Veuillez sélectionner un fichier');
      // TODO: Afficher un message d'erreur à l'utilisateur de manière non-bloquante
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => onNavigate('Conversation')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Envoyer un fichier</Text>
      </View>

      <View style={styles.fileList}>
        {files.map(file => (
          <TouchableOpacity
            key={file.id}
            style={[
              styles.fileItem,
              selectedFile?.id === file.id && styles.selectedFileItem,
            ]}
            onPress={() => selectFile(file)}
          >
            <Text style={styles.fileIcon}>{file.icon}</Text>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileSize}>{file.size}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.sendFileButton, !selectedFile && styles.disabledButton]}
        onPress={sendFile}
        disabled={!selectedFile}
      >
        <Text style={styles.sendFileButtonText}>Envoyer</Text>
      </TouchableOpacity>
    </View>
  );
};

// Écran de paramètres (SettingsScreen)
const SettingsScreen = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState(true);
  const [hqMode, setHqMode] = useState(true);

  const settings = [
    {
      id: 'notifications',
      title: 'Notifications',
      value: notifications,
      toggle: () => setNotifications(!notifications),
    },
    {
      id: 'hqMode',
      title: 'Mode haute qualité',
      value: hqMode,
      toggle: () => setHqMode(!hqMode),
    },
  ];

  const storageUsed = '2.7 GB';
  const storageLimit = '10 GB';

  return (
    <View style={styles.screen}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => onNavigate('Home')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Paramètres</Text>
      </View>

      <View style={styles.settingsContainer}>
        {settings.map(setting => (
          <View key={setting.id} style={styles.settingItem}>
            <Text style={styles.settingTitle}>{setting.title}</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                setting.value ? styles.toggleActive : styles.toggleInactive,
              ]}
              onPress={setting.toggle}
            >
              <View
                style={[
                  styles.toggleCircle,
                  setting.value && styles.toggleCircleActive,
                ]}
              />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.storageInfo}>
          <Text style={styles.settingTitle}>Stockage</Text>
          <Text>
            {storageUsed} / {storageLimit}
          </Text>
          <View style={styles.storageBarContainer}>
            <View
              style={[
                styles.storageBar,
                {
                  width: `${
                    (parseFloat(storageUsed) / parseFloat(storageLimit)) * 100
                  }%`,
                },
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.storageButton}
            onPress={() => onNavigate('Storage')}
          >
            <Text style={styles.storageButtonText}>Gérer le stockage</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Écran de gestion du stockage (StorageScreen)
const StorageScreen = ({ onNavigate }) => {
  const storageItems = [
    { id: '1', type: 'Images', size: '1.2 GB', icon: '🖼️', percentage: 44 },
    { id: '2', type: 'Vidéos', size: '0.8 GB', icon: '🎬', percentage: 30 },
    { id: '3', type: 'Documents', size: '0.5 GB', icon: '📄', percentage: 19 },
    { id: '4', type: 'Audio', size: '0.2 GB', icon: '🎵', percentage: 7 },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => onNavigate('Settings')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Gestion du stockage</Text>
      </View>

      <View style={styles.storageOverview}>
        <Text style={styles.storageTitle}>
          Utilisation du stockage: 2.7 GB / 10 GB
        </Text>
        <View style={styles.storageBarContainer}>
          <View style={styles.storageBarFill} />
        </View>
      </View>

      <ScrollView style={styles.storageItemsList}>
        {storageItems.map(item => (
          <View key={item.id} style={styles.storageItem}>
            <Text style={styles.storageItemIcon}>{item.icon}</Text>
            <View style={styles.storageItemDetails}>
              <Text style={styles.storageItemType}>{item.type}</Text>
              <View style={styles.storageItemBarContainer}>
                <View
                  style={[
                    styles.storageItemBar,
                    { width: `${item.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.storageItemSize}>
                {item.size} ({item.percentage}%)
              </Text>
            </View>
            <TouchableOpacity style={styles.storageItemButton}>
              <Text style={styles.storageItemButtonText}>Nettoyer</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.clearAllButton}>
        <Text style={styles.clearAllButtonText}>Vider le cache (0.3 GB)</Text>
      </TouchableOpacity>
    </View>
  );
};

// Application principale avec navigation simplifiée
const AxiomAppWeb = () => {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [routeParams, setRouteParams] = useState({});

  const navigate = (screen, params = {}) => {
    setCurrentScreen(screen);
    setRouteParams(params);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen onNavigate={navigate} />;
      case 'Conversation':
        return (
          <ConversationScreen
            route={{ params: routeParams }}
            onNavigate={navigate}
          />
        );
      case 'FileTransfer':
        return <FileTransferScreen onNavigate={navigate} />;
      case 'Settings':
        return <SettingsScreen onNavigate={navigate} />;
      case 'Storage':
        return <StorageScreen onNavigate={navigate} />;
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Axiom App</Text>
        <Text style={styles.headerSubtitle}>Messagerie sécurisée</Text>
      </View>

      <View style={styles.content}>{renderScreen()}</View>
    </View>
  );
};

// Styles pour tous les écrans
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    height: '100vh',
  },
  header: {
    backgroundColor: '#0084FF',
    padding: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  fileButton: {
    marginLeft: 'auto',
  },
  fileButtonText: {
    fontSize: 20,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // HomeScreen styles
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    fontSize: 35,
  },
  hqBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0084FF',
    borderRadius: 8,
    padding: 2,
    paddingHorizontal: 4,
  },
  hqBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadMessage: {
    color: '#000',
    fontWeight: 'bold',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0084FF',
    marginLeft: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  newConversationButton: {
    backgroundColor: '#0084FF',
  },
  settingsButton: {
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },

  // ConversationScreen styles
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0084FF',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // FileTransferScreen styles
  fileList: {
    flex: 1,
    padding: 15,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 8,
  },
  selectedFileItem: {
    backgroundColor: '#e6f3ff',
    borderWidth: 2,
    borderColor: '#0084FF',
  },
  fileIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
  },
  sendFileButton: {
    backgroundColor: '#0084FF',
    padding: 15,
    alignItems: 'center',
    margin: 15,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  sendFileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // SettingsScreen styles
  settingsContainer: {
    flex: 1,
    padding: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 5,
  },
  toggleActive: {
    backgroundColor: '#0084FF',
  },
  toggleInactive: {
    backgroundColor: '#e0e0e0',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  storageInfo: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 15,
    borderRadius: 8,
  },
  storageBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 10,
    overflow: 'hidden',
  },
  storageBar: {
    height: 10,
    backgroundColor: '#0084FF',
    borderRadius: 5,
  },
  storageButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  storageButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // StorageScreen styles
  storageOverview: {
    padding: 15,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 8,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: '#0084FF',
    width: '27%',
  },
  storageItemsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  storageItemIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  storageItemDetails: {
    flex: 1,
  },
  storageItemType: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  storageItemBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  storageItemBar: {
    height: 8,
    backgroundColor: '#0084FF',
    borderRadius: 4,
  },
  storageItemSize: {
    fontSize: 12,
    color: '#666',
  },
  storageItemButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  storageItemButtonText: {
    fontSize: 12,
    color: '#333',
  },
  clearAllButton: {
    backgroundColor: '#ff3b30',
    padding: 15,
    alignItems: 'center',
    margin: 15,
    borderRadius: 8,
  },
  clearAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AxiomAppWeb;
