import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import AnimatedButton from './AnimatedButton';

interface ConversationHeaderProps {
  contactId: string;
  isE2EReady: boolean;
  fingerprint: string;
  onSecurityInfo: () => void;
  onRotateKeys: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  contactId,
  isE2EReady,
  fingerprint,
  onSecurityInfo,
  onRotateKeys,
}) => {
  const getContactName = (id: string) => {
    return id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const contactName = getContactName(contactId);
  const initials = getInitials(contactName);

  return (
    <>
      {/* En-tête du contact */}
      <View style={styles.header}>
        <View style={styles.contactAvatar}>
          <Text style={styles.contactAvatarText}>{initials}</Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contactName}</Text>
          <Text style={styles.contactStatus}>
            {isE2EReady ? '🔒 Chiffrement actif' : '⏳ Initialisation...'}
          </Text>
        </View>

        <AnimatedButton
          onPress={onSecurityInfo}
          style={styles.securityButton}
          pressInScale={0.9}
        >
          <Text style={styles.securityButtonText}>🔒</Text>
        </AnimatedButton>
      </View>

      {/* Bandeau de sécurité */}
      {isE2EReady && (
        <View style={styles.banner}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.bannerText}>Messages chiffrés bout en bout</Text>
          <AnimatedButton onPress={onSecurityInfo} pressInScale={0.9}>
            <Text style={styles.infoIcon}>ℹ️</Text>
          </AnimatedButton>
        </View>
      )}

      {/* Section empreinte et rotation des clés */}
      <View style={styles.fingerprintContainer}>
        <Text style={styles.fingerprintText}>
          Empreinte de sécurité : {fingerprint}
        </Text>
        <AnimatedButton
          style={styles.rotateButton}
          onPress={onRotateKeys}
          pressInScale={0.95}
        >
          <Text style={styles.rotateButtonText}>🔄 Renouveler les clés</Text>
        </AnimatedButton>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  contactAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contactAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactStatus: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  securityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityButtonText: {
    fontSize: 18,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lockIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  infoIcon: {
    marginLeft: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
  bannerText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  fingerprintContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fingerprintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  rotateButton: {
    backgroundColor: '#0084FF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rotateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ConversationHeader;
