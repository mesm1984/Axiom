import E2EEncryptionService from '../services/E2EEncryptionService';

// Mocks pour Keychain et AsyncStorage
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}));

describe('E2EEncryptionService basic flows', () => {
  test('encrypt/decrypt message and file', async () => {
    const svc = E2EEncryptionService.getInstance();
    await svc.initialize();

  // Utiliser notre clé publique comme "contact" pour un test self-encrypt/self-decrypt
  const publicKey = svc.getPublicKey();
  expect(publicKey).not.toBeNull();
  svc.addContactKey('self', publicKey as string);

    const message = 'Bonjour Axiom';
    const encrypted = svc.encryptMessage(message, 'self');
    expect(encrypted).not.toBeNull();

    const decrypted = svc.decryptMessage(encrypted as string, 'self');
    expect(decrypted).toBe(message);

    const fileContent = 'fichier test content';
    const fileBase64 = Buffer.from(fileContent).toString('base64');

    const encryptedFile = svc.encryptFile(fileBase64, 'self');
    expect(encryptedFile).not.toBeNull();

    const decryptedFileBase64 = svc.decryptFile(encryptedFile as string, 'self');
    expect(decryptedFileBase64).toBe(fileBase64);

    const decoded = Buffer.from(decryptedFileBase64 as string, 'base64').toString('utf8');
    expect(decoded).toBe(fileContent);
  });
});
