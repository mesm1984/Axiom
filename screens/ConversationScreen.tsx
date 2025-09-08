import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import E2EEncryptionService from '../services/E2EEncryptionService';
import MessageBubble from '../components/MessageBubble';
import InputBar from '../components/InputBar';
import ConversationHeader from '../components/ConversationHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  encryptMessage,
  decryptMessage,
  generateKeyPair,
} from '../utils/crypto';

// Fonction de test pour afficher les clés échangées et le dernier message déchiffré
async function testCryptoFlow(contactId: string, messages: Message[]) {
  const userKeysJson = await AsyncStorage.getItem('axiom_user_keys');
  const contactPubKey = await AsyncStorage.getItem(
    `axiom_contact_public_key_${contactId}`,
  );
  console.log('Clé publique utilisateur:', userKeysJson);
  console.log('Clé publique contact:', contactPubKey);
  if (messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    console.log('Dernier message:', lastMsg.text);
  }
}
// Simule l'envoi de la clé publique à un contact et la réception de sa clé
async function exchangePublicKeys(
  myPublicKey: string,
  contactId: string,
  contactPublicKey: string,
) {
  await AsyncStorage.setItem(
    `axiom_contact_public_key_${contactId}`,
    contactPublicKey,
  );
  await AsyncStorage.setItem(
    `axiom_user_public_key_for_${contactId}`,
    myPublicKey,
  );
}

// Type pour les messages
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: number;
  isEncrypted?: boolean;
};

type ContactSelectorProps = {
  contactId: string;
  setContactId: (id: string) => void;
};
const ContactSelector: React.FC<ContactSelectorProps> = ({
  contactId,
  setContactId,
}) => (
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
    backgroundColor: '#f8f9fa',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contactSelectorContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  contactSelectorInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

const ConversationScreen = () => {
  const [contactId, setContactId] = useState('demo-contact-123');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isE2EReady, setIsE2EReady] = useState(false);
  const [encryptionService] = useState(() =>
    E2EEncryptionService.getInstance(),
  );
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

  const initializeEncryption = async () => {
    try {
      await encryptionService.initialize();
      encryptionService.addContactKey(contactId, 'demo-public-key-contact-123');
      setIsE2EReady(true);
      console.log('Chiffrement E2E initialisé');
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'initialiser le chiffrement sécurisé");
      console.error('Erreur init E2E:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initializeEncryption();
      loadDemoMessages();
    };
    init();
  }, []);

  const loadDemoMessages = () => {
    const demoMessages: Message[] = [
      {
        id: '1',
        text: 'Salut ! Comment ça va ?',
        sender: 'contact',
        timestamp: Date.now() - 300000,
        isEncrypted: true,
      },
      {
        id: '2',
        text: 'Ça va bien, merci ! Et toi ?',
        sender: 'user',
        timestamp: Date.now() - 240000,
        isEncrypted: true,
      },
    ];
    setMessages(demoMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !isE2EReady) {
      return;
    }
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
      let contactPublicKey = await AsyncStorage.getItem(
        `axiom_contact_public_key_${contactId}`,
      );
      if (!contactPublicKey) {
        contactPublicKey = userKeys.publicKey;
        await AsyncStorage.setItem(
          `axiom_contact_public_key_${contactId}`,
          contactPublicKey || '',
        );
      }
      // Simulation d'un échange de clés publiques avant envoi du premier message
      await exchangePublicKeys(
        userKeys.publicKey,
        contactId,
        contactPublicKey || userKeys.publicKey,
      );
      // Chiffrer le message
      const encrypted = encryptMessage(
        newMessage.trim(),
        contactPublicKey,
        userKeys.secretKey,
      );
      if (!encrypted) {
        Alert.alert('Erreur', 'Impossible de chiffrer le message');
        return;
      }
      // Déchiffrement immédiat pour la démo (normalement côté destinataire)
      const decrypted = decryptMessage(
        encrypted.ciphertext,
        encrypted.nonce,
        userKeys.publicKey,
        userKeys.secretKey,
      );
      const message: Message = {
        id: Date.now().toString(),
        text: `[chiffré] ${encrypted.ciphertext.substring(
          0,
          32,
        )}...\n[déchiffré] ${decrypted}`,
        sender: 'user',
        timestamp: Date.now(),
        isEncrypted: true,
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      console.log('Message chiffré envoyé:', encrypted);
      console.log('Message déchiffré:', decrypted);
    } catch (error) {
      Alert.alert('Erreur', "Erreur lors de l'envoi du message sécurisé");
      console.error('Erreur envoi message:', error);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    // Animation échelonnée pour les messages : délai basé sur l'index
    const animationDelay = index * 50; // 50ms entre chaque message
    return <MessageBubble message={item} animationDelay={animationDelay} />;
  };

  const getSecurityFingerprint = () => {
    if (!isE2EReady) {
      return 'Chiffrement non initialisé';
    }
    const fp = encryptionService.generateSecurityFingerprint(contactId);
    return fp || 'Indisponible';
  };

  const showSecurityInfo = () => {
    Alert.alert(
      'Informations de sécurité',
      `Empreinte de sécurité:\n${getSecurityFingerprint()}\n\nVérifiez cette empreinte avec votre contact pour confirmer la sécurité de vos échanges.`,
      [{ text: 'OK' }],
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ContactSelector contactId={contactId} setContactId={setContactId} />

      <ConversationHeader
        contactId={contactId}
        isE2EReady={isE2EReady}
        fingerprint={fingerprint}
        onSecurityInfo={showSecurityInfo}
        onRotateKeys={handleRotateKeys}
      />

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item: Message) => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() =>
          !isE2EReady ? (
            <LoadingSpinner
              text="Initialisation du chiffrement..."
              visible={true}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                🔒 Conversation sécurisée prête
              </Text>
              <Text style={styles.emptySubtext}>
                Vos messages sont chiffrés bout en bout
              </Text>
            </View>
          )
        }
      />

      <InputBar
        message={newMessage}
        onChangeText={setNewMessage}
        onSend={sendMessage}
        isE2EReady={isE2EReady}
        placeholder={isE2EReady ? 'Message sécurisé...' : 'Initialisation...'}
      />
    </KeyboardAvoidingView>
  );
};

export default ConversationScreen;
