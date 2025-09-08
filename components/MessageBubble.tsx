import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedMessage from './AnimatedMessage';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: number;
  isEncrypted?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  animationDelay?: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  animationDelay = 0,
}) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUser = message.sender === 'user';

  return (
    <AnimatedMessage delay={animationDelay} duration={400}>
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.contactMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.contactMessageText,
          ]}
        >
          {message.text}
        </Text>

        <View style={styles.messageInfo}>
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.contactTimestamp,
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>

          {message.isEncrypted && (
            <View style={styles.encryptedIndicator}>
              <Text style={styles.encryptedText}>🔒</Text>
            </View>
          )}

          {isUser && <Text style={styles.deliveryStatus}>✓✓</Text>}
        </View>
      </View>
    </AnimatedMessage>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 3,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '75%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userMessage: {
    backgroundColor: '#0084FF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  contactMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  contactMessageText: {
    color: '#333',
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
  },
  contactTimestamp: {
    color: '#888',
  },
  encryptedIndicator: {
    marginLeft: 8,
  },
  encryptedText: {
    fontSize: 10,
    opacity: 0.8,
  },
  deliveryStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
});

export default MessageBubble;
