import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Conversation {
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
}

interface ConversationListItemProps {
  conversation: Conversation;
  decryptedName?: string;
  onPress: (id: string) => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  decryptedName,
  onPress,
}) => {
  if (conversation.archived) return null;

  return (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        conversation.unread && styles.unreadConversationItem,
      ]}
      onPress={() => onPress(conversation.id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <Text style={styles.avatar}>{conversation.avatar}</Text>
          {/* Indicateur de statut en ligne */}
          <View style={styles.onlineIndicator} />
        </View>

        {/* Badges améliorés */}
        <View style={styles.badgesContainer}>
          {conversation.isHQ && (
            <View style={styles.hqBadge}>
              <Text style={styles.hqBadgeText}>HQ</Text>
            </View>
          )}
          {conversation.hasFile && (
            <View style={styles.fileBadge}>
              <Text style={styles.fileBadgeText}>📎</Text>
            </View>
          )}
          {conversation.hasOrb && (
            <View style={styles.orbBadge}>
              <Text style={styles.orbBadgeText}>🔮</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.contactName}>
            {decryptedName || conversation.contactName}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{conversation.time}</Text>
            {conversation.unread && (
              <View style={styles.unreadCount}>
                <Text style={styles.unreadCountText}>•</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.conversationFooter}>
          <Text
            style={[
              styles.lastMessage,
              conversation.unread && styles.unreadMessage,
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {conversation.lastMessage}
          </Text>

          {/* Indicateurs de statut des messages */}
          <View style={styles.messageStatusContainer}>
            {conversation.unread ? (
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

const styles = StyleSheet.create({
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
});

export default ConversationListItem;
