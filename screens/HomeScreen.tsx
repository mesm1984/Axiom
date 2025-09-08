import React, { useState, useEffect } from 'react';
import E2EEncryptionService from '../services/E2EEncryptionService';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

// Type pour les conversations
type Conversation = {
  id: string;
  contactName: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isHQ: boolean;
  unread: boolean;
  archived?: boolean;
  hasFile?: boolean;
  hasOrb?: boolean;
};

const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [conversationsList, setConversationsList] = useState<Conversation[]>(
    [],
  );
  const [decryptedNames, setDecryptedNames] = useState<{
    [id: string]: string;
  }>({});

  // Chargement initial des conversations
  const loadConversations = async () => {
    // Simuler chargement des données
    setConversationsList(initialConversations);
    // Chiffrer les noms de contacts à l'initialisation
    const encryptedNames: {
      [id: string]: { ciphertext: string; nonce: string };
    } = {};
    for (const conv of initialConversations) {
      encryptedNames[conv.id] = await E2EEncryptionService.encryptMetadata(
        conv.contactName,
      );
    }
    // Déchiffrer pour affichage (dans une vraie app, on stockerait chiffré)
    const decrypted: { [id: string]: string } = {};
    for (const id in encryptedNames) {
      decrypted[id] =
        (await E2EEncryptionService.decryptMetadata(
          encryptedNames[id].ciphertext,
          encryptedNames[id].nonce,
        )) || '';
    }
    setDecryptedNames(decrypted);
  };

  // Fonction pour simuler la vérification de nouveaux messages
  const checkForNewMessages = () => {
    // Cette fonction pourrait se connecter à un serveur pour vérifier les nouveaux messages
    console.log('Vérification des nouveaux messages...');
    // Pour l'instant, on ne fait rien de spécial
  };

  // Simuler un chargement initial des conversations
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualiser les conversations lorsqu'on revient à l'écran d'accueil
  useFocusEffect(
    React.useCallback(() => {
      // Cette fonction sera exécutée quand l'écran est affiché
      checkForNewMessages();
      return () => {
        // Cette fonction sera exécutée quand on quitte l'écran
      };
    }, []),
  );

  // Fonction pour actualiser la liste des conversations
  const onRefresh = () => {
    setRefreshing(true);
    // Simuler un temps de chargement
    setTimeout(() => {
      // Ajouter un nouveau message non lu dans la première conversation
      setConversationsList(current => {
        const updated = [...current];
        if (updated.length > 0) {
          updated[0] = {
            ...updated[0],
            lastMessage: 'Nouveau message après refresh',
            time: '09:30',
            unread: true,
          };
        }
        return updated;
      });

      setRefreshing(false);
    }, 1000);
  };

  // Simuler la réception d'un nouveau message après un délai
  useEffect(() => {
    const timer = setTimeout(() => {
      // Ajouter un nouveau message non lu aléatoirement dans une conversation existante
      if (conversationsList.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * Math.min(conversationsList.length, 3),
        );

        setConversationsList(current => {
          const updated = [...current];
          if (updated[randomIndex]) {
            updated[randomIndex] = {
              ...updated[randomIndex],
              lastMessage: 'Message reçu automatiquement',
              time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              unread: true,
            };
          }
          return updated;
        });
      }
    }, 15000); // 15 secondes après le chargement

    return () => clearTimeout(timer);
  }, [conversationsList.length]);

  // Plus besoin de configurer l'en-tête ici, il sera configuré dans App.tsx

  // Données simulées pour les conversations
  const initialConversations: Conversation[] = [
    {
      id: '1',
      contactName: 'Marie Dupont',
      avatar: '👩',
      lastMessage: 'Oui, à demain alors !',
      time: '12:30',
      isHQ: true,
      unread: true,
      hasFile: true,
      hasOrb: true,
    },
    {
      id: '2',
      contactName: 'Jean Martin',
      avatar: '👨',
      lastMessage: "J'ai reçu le fichier, merci",
      time: '11:15',
      isHQ: false,
      unread: false,
      hasFile: false,
      hasOrb: false,
    },
    {
      id: '3',
      contactName: 'Sophie Bernard',
      avatar: '👧',
      lastMessage: 'Tu as vu les photos ?',
      time: '09:45',
      isHQ: true,
      unread: true,
      hasFile: true,
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

  // Ces fonctions sont définies mais actuellement non utilisées.
  // Elles sont préparées pour une fonctionnalité future
  /* 
  // Fonction pour marquer un message comme lu ou non lu
  const toggleUnread = (id: string) => {
    setConversationsList(current => 
      current.map(conv => 
        conv.id === id ? { ...conv, unread: !conv.unread } : conv
      )
    );
  };

  // Fonction pour archiver une conversation
  const archiveConversation = (id: string) => {
    setConversationsList(current => 
      current.map(conv => 
        conv.id === id ? { ...conv, archived: true } : conv
      )
    );
  };
  */

  // Ouvrir une conversation spécifique
  const openConversation = (id: string) => {
    // Dans une vraie application, on passerait l'ID de la conversation
    // pour charger les messages correspondants
    navigation.navigate('Conversation');

    // Marquer le message comme lu quand on ouvre la conversation
    setConversationsList(current =>
      current.map(conv => (conv.id === id ? { ...conv, unread: false } : conv)),
    );
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    // Ne pas afficher les conversations archivées
    if (item.archived) return null;

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          item.unread && styles.unreadConversationItem,
        ]}
        onPress={() => openConversation(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatar}>{item.avatar}</Text>
            {/* Indicateur de statut en ligne */}
            <View style={styles.onlineIndicator} />
          </View>

          {/* Badges améliorés */}
          <View style={styles.badgesContainer}>
            {item.isHQ && (
              <View style={styles.hqBadge}>
                <Text style={styles.hqBadgeText}>HQ</Text>
              </View>
            )}
            {item.hasFile && (
              <View style={styles.fileBadge}>
                <Text style={styles.fileBadgeText}>�</Text>
              </View>
            )}
            {item.hasOrb && (
              <View style={styles.orbBadge}>
                <Text style={styles.orbBadgeText}>🔮</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.contactName}>
              {decryptedNames[item.id] || item.contactName}
            </Text>
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{item.time}</Text>
              {item.unread && (
                <View style={styles.unreadCount}>
                  <Text style={styles.unreadCountText}>•</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.conversationFooter}>
            <Text
              style={[styles.lastMessage, item.unread && styles.unreadMessage]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.lastMessage}
            </Text>

            {/* Indicateurs de statut des messages */}
            <View style={styles.messageStatusContainer}>
              {item.unread ? (
                <View style={styles.unreadBadge} />
              ) : (
                <Text style={styles.readStatus}>✓✓</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversationsList}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id}
        style={styles.conversationsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0084FF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune conversation</Text>
            <Text style={styles.emptySubText}>
              Commencez à discuter en appuyant sur "Nouvelle conversation"
            </Text>
          </View>
        }
      />

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.newConversationButton]}
          onPress={() => navigation.navigate('Conversation')}
        >
          <Text style={styles.actionButtonText}>+ Nouvelle conversation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.settingsButton]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.actionButtonText}>⚙️ Paramètres</Text>
        </TouchableOpacity>
      </View>

      {/* Menu flottant pour d'autres actions */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('FileTransfer')}
      >
        <Text style={styles.floatingButtonText}>📁</Text>
      </TouchableOpacity>

      {/* Bouton pour la gestion du stockage */}
      <TouchableOpacity
        style={[styles.floatingButton, styles.storageButton]}
        onPress={() => navigation.navigate('Storage')}
      >
        <Text style={styles.floatingButtonText}>📊</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    borderBottomWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadConversationItem: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#0084FF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  avatar: {
    fontSize: 28,
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
    borderColor: '#fff',
  },
  badgesContainer: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  hqBadge: {
    backgroundColor: '#0084FF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginHorizontal: 1,
  },
  hqBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  fileBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginHorizontal: 1,
  },
  fileBadgeText: {
    fontSize: 8,
    color: 'white',
  },
  orbBadge: {
    backgroundColor: '#9C27B0',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginHorizontal: 1,
  },
  orbBadgeText: {
    fontSize: 8,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginRight: 4,
  },
  unreadCount: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0084FF',
  },
  unreadCountText: {
    fontSize: 12,
    color: '#0084FF',
    fontWeight: 'bold',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 18,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  messageStatusContainer: {
    marginLeft: 8,
    justifyContent: 'flex-end',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0084FF',
  },
  readStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  newConversationButton: {
    backgroundColor: '#0084FF',
  },
  settingsButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 14,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  storageButton: {
    bottom: 170,
    backgroundColor: '#4CAF50',
  },
  floatingButtonText: {
    fontSize: 24,
    color: '#fff',
  },
});

export default HomeScreen;
