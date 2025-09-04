import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import E2EEncryptionService from '../services/E2EEncryptionService';
import { encryptMessage, decryptMessage, generateKeyPair } from '../utils/crypto';

// Fonction de test pour afficher les clés échangées et le dernier message déchiffré
async function testCryptoFlow(contactId: string, messages: Message[]) {
  const userKeysJson = await AsyncStorage.getItem('axiom_user_keys');
  const contactPubKey = await AsyncStorage.getItem(`axiom_contact_public_key_${contactId}`);
  console.log('Clé publique utilisateur:', userKeysJson);
  console.log('Clé publique contact:', contactPubKey);
  if (messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    console.log('Dernier message:', lastMsg.text);
  }
}
// Simule l'envoi de la clé publique à un contact et la réception de sa clé
async function exchangePublicKeys(myPublicKey: string, contactId: string, contactPublicKey: string) {
  await AsyncStorage.setItem(`axiom_contact_public_key_${contactId}`, contactPublicKey);
  await AsyncStorage.setItem(`axiom_user_public_key_for_${contactId}`, myPublicKey);
}

// Type pour les messages
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: number;
  isEncrypted?: boolean;
}

type ContactSelectorProps = {
  contactId: string;
  setContactId: (id: string) => void;
};
const ContactSelector: React.FC<ContactSelectorProps> = ({ contactId, setContactId }) => (
  <View style={styles.contactSelectorContainer}>
    <Text>ID du contact :</Text>
    <TextInput
      value={contactId}
      onChangeText={setContactId}
      placeholder="ID du contact"
      style={styles.contactSelectorInput}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    elevation: 2,
  },
  lockIcon: {
    marginRight: 8,
    fontSize: 18,
  },
  infoIcon: {
    marginLeft: 8,
    fontSize: 16,
  },
  bannerText: {
    color: '#2ecc40',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  contactMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  contactMessageText: {
    color: '#000000',
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  encryptedBadge: {
    fontSize: 12,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  sendButtonText: {
    fontSize: 20,
  },
  contactSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8,
  },
  contactSelectorInput: {
    marginLeft: 8,
    borderWidth: 1,
    padding: 4,
    minWidth: 120,
    borderRadius: 4,
  },
  fingerprintContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  fingerprintText: {
    fontSize: 12,
    color: '#666',
  },
});

const ConversationScreen = () => {
  const [contactId, setContactId] = useState('demo-contact-123');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isE2EReady, setIsE2EReady] = useState(false);
  const [encryptionService] = useState(() => E2EEncryptionService.getInstance());
  const [fingerprint, setFingerprint] = useState<string>('');

  useEffect(() => {
    if (isE2EReady && contactId && encryptionService) {
      const fp = encryptionService.generateSecurityFingerprint(contactId);
      setFingerprint(fp || 'Indisponible');
    }
  }, [isE2EReady, contactId, encryptionService]);

  useEffect(() => {
    // Test du flux crypto après chaque envoi
    testCryptoFlow(contactId, messages);
  }, [messages, contactId]);

  const initializeEncryption = React.useCallback(async () => {
    try {
      await encryptionService.initialize();
      encryptionService.addContactKey(contactId, 'demo-public-key-contact-123');
      setIsE2EReady(true);
      console.log('Chiffrement E2E initialisé');
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'initialiser le chiffrement sécurisé");
      console.error('Erreur init E2E:', error);
    }
  }, [encryptionService, contactId]);

  useEffect(() => {
    const init = async () => {
      await initializeEncryption();
      loadDemoMessages();
    };
    init();
  }, [initializeEncryption]);

  const loadDemoMessages = () => {
    const demoMessages: Message[] = [
      {
        id: '1',
        text: 'Salut ! Comment ça va ?',
        sender: 'contact',
        timestamp: Date.now() - 300000,
        isEncrypted: true
      },
      {
        id: '2',
        text: 'Ça va bien, merci ! Et toi ?',
        sender: 'user',
        timestamp: Date.now() - 240000,
        isEncrypted: true
      }
    ];
    setMessages(demoMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !isE2EReady) return;
    try {
      // Vérifier si la paire de clés existe déjà en local
      let userKeys = null;
      const keysJson = await AsyncStorage.getItem('axiom_user_keys');
      if (keysJson) {
        userKeys = JSON.parse(keysJson);
      } else {
        userKeys = generateKeyPair();
        await AsyncStorage.setItem('axiom_user_keys', JSON.stringify(userKeys));
      }
      // Récupérer la clé publique du destinataire (multi-utilisateur)
      let contactPublicKey = await AsyncStorage.getItem(`axiom_contact_public_key_${contactId}`);
      if (!contactPublicKey) {
        contactPublicKey = userKeys.publicKey;
        await AsyncStorage.setItem(`axiom_contact_public_key_${contactId}`, contactPublicKey || '');
      }
      // Simulation d'un échange de clés publiques avant envoi du premier message
      await exchangePublicKeys(userKeys.publicKey, contactId, contactPublicKey || userKeys.publicKey);
      // Chiffrer le message
      const encrypted = encryptMessage(newMessage.trim(), contactPublicKey, userKeys.secretKey);
      if (!encrypted) {
        Alert.alert('Erreur', 'Impossible de chiffrer le message');
        return;
      }
      // Déchiffrement immédiat pour la démo (normalement côté destinataire)
      const decrypted = decryptMessage(
        encrypted.ciphertext,
        encrypted.nonce,
        userKeys.publicKey,
        userKeys.secretKey
      );
      const message: Message = {
        id: Date.now().toString(),
        text: `[chiffré] ${encrypted.ciphertext.substring(0, 32)}...\n[déchiffré] ${decrypted}`,
        sender: 'user',
        timestamp: Date.now(),
        isEncrypted: true
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      console.log('Message chiffré envoyé:', encrypted);
      console.log('Message déchiffré:', decrypted);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'envoi du message sécurisé');
      console.error('Erreur envoi message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.contactMessage]}>
        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.contactMessageText]}>
          {item.text}
        </Text>
        <View style={styles.messageInfo}>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
          {item.isEncrypted && (
            <Text style={styles.encryptedBadge}>🔒</Text>
          )}
        </View>
      </View>
    );
  };

  const getSecurityFingerprint = () => {
    if (!isE2EReady) return 'Chiffrement non initialisé';
    const fp = encryptionService.generateSecurityFingerprint(contactId);
    return fp || 'Indisponible';
  };

  const showSecurityInfo = () => {
    Alert.alert(
      'Informations de sécurité',
      `Empreinte de sécurité:\n${getSecurityFingerprint()}\n\nVérifiez cette empreinte avec votre contact pour confirmer la sécurité de vos échanges.`,
      [{ text: 'OK' }]
    );
  };

  const handleRotateKeys = async () => {
    await encryptionService.rotateKeys();
    Alert.alert('Sécurité', 'Nouvelle paire de clés générée et sauvegardée.');
    setIsE2EReady(false);
    await encryptionService.initialize();
    setIsE2EReady(true);
  };

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ContactSelector contactId={contactId} setContactId={setContactId} />
      <View style={styles.fingerprintContainer}>
        <Text style={styles.fingerprintText}>Empreinte de sécurité du contact : {fingerprint}</Text>
        <TouchableOpacity style={styles.sendButton} onPress={handleRotateKeys}>
          <Text style={styles.sendButtonText}>🔄 Renouveler les clés</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.banner}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.bannerText}>Chiffrement activé</Text>
        <TouchableOpacity onPress={showSecurityInfo}>
          <Text style={styles.infoIcon}>ℹ️</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder={isE2EReady ? "Message sécurisé..." : "Initialisation..."}
          editable={isE2EReady}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !isE2EReady && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!isE2EReady || !newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>
		</KeyboardAvoidingView>
	);
};

export default ConversationScreen;
