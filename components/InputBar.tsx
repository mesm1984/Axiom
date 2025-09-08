import React from 'react';
import { View, TextInput, Text, StyleSheet, Platform } from 'react-native';
import AnimatedButton from './AnimatedButton';

interface InputBarProps {
  message: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isE2EReady: boolean;
  placeholder?: string;
}

const InputBar: React.FC<InputBarProps> = ({
  message,
  onChangeText,
  onSend,
  isE2EReady,
  placeholder = 'Tapez votre message...',
}) => {
  const canSend = message.trim().length > 0 && isE2EReady;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          editable={isE2EReady}
        />

        <AnimatedButton
          style={[
            styles.sendButton,
            canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
          ]}
          onPress={onSend}
          disabled={!canSend}
          pressInScale={0.9}
        >
          <Text
            style={[
              styles.sendButtonText,
              canSend
                ? styles.sendButtonTextActive
                : styles.sendButtonTextDisabled,
            ]}
          >
            ➤
          </Text>
        </AnimatedButton>
      </View>

      {!isE2EReady && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            🔒 Chiffrement en cours d'initialisation...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    backgroundColor: '#f8f8f8',
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendButtonActive: {
    backgroundColor: '#0084FF',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sendButtonTextActive: {
    color: '#fff',
  },
  sendButtonTextDisabled: {
    color: '#999',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    borderTopWidth: 1,
    borderTopColor: '#ffeaa7',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default InputBar;
