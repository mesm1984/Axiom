import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// Pas besoin de React Navigation pour la version web

// Type pour les conversations
type Conversation = {
  id: string;
  contactName: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isHQ: boolean;
  unread: boolean;
};

const HomeScreen = () => {
  // Données simulées pour les conversations
  const conversations: Conversation[] = [
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
      lastMessage: 'J\'ai reçu le fichier, merci',
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

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => console.log("Navigation vers la conversation avec " + item.contactName)}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          {item.isHQ && <View style={styles.hqBadge}><Text style={styles.hqBadgeText}>HQ</Text></View>}
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
      <ScrollView style={styles.conversationsList}>
        {conversations.map((item) => renderConversationItem({ item }))}
      </ScrollView>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.newConversationButton]}
          onPress={() => console.log("Nouvelle conversation")}
        >
          <Text style={styles.actionButtonText}>+ Nouvelle conversation</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.settingsButton]}
          onPress={() => console.log("Paramètres")}
        >
          <Text style={styles.actionButtonText}>⚙️ Paramètres</Text>
        </TouchableOpacity>
      </View>
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
});

export default HomeScreen;
