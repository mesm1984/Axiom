import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [conversationsList, setConversationsList] = useState<Conversation[]>([]);
  
  // Chargement initial des conversations
  const loadConversations = () => {
    // Ici, on simule le chargement des données
    // Dans une vraie application, ce serait une requête vers une API ou une base de données locale
    setConversationsList(initialConversations);
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
    }, [])
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
            unread: true 
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
        const randomIndex = Math.floor(Math.random() * Math.min(conversationsList.length, 3));
        
        setConversationsList(current => {
          const updated = [...current];
          if (updated[randomIndex]) {
            updated[randomIndex] = { 
              ...updated[randomIndex], 
              lastMessage: 'Message reçu automatiquement',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unread: true 
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
      lastMessage: 'J\'ai reçu le fichier, merci',
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
      current.map(conv => 
        conv.id === id ? { ...conv, unread: false } : conv
      )
    );
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    // Ne pas afficher les conversations archivées
    if (item.archived) return null;
    
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => openConversation(item.id)}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          {item.isHQ && <View style={styles.hqBadge}><Text style={styles.hqBadgeText}>HQ</Text></View>}
          {item.hasFile && <View style={styles.fileBadge}><Text style={styles.fileBadgeText}>📁</Text></View>}
          {item.hasOrb && <Text style={styles.orbBadge}>⚪</Text>}
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
    <View style={styles.container}>
      <FlatList
        data={conversationsList}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
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
            <Text style={styles.emptySubText}>Commencez à discuter en appuyant sur "Nouvelle conversation"</Text>
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
    backgroundColor: '#f5f5f5',
  },

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
  fileBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  fileBadgeText: {
    fontSize: 8,
  },
  orbBadge: {
    fontSize: 14,
    color: '#007AFF',
    marginHorizontal: 4,
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
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  storageButton: {
    bottom: 140,
    backgroundColor: '#4CAF50',
  },
  floatingButtonText: {
    fontSize: 24,
  },
});

export default HomeScreen;
