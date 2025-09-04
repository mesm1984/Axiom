export default FileTransferScreen;
// Définition du type TransferFile
type TransferFile = {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: 'completed' | 'paused' | 'pending';
};
import React, { useState, useEffect } from 'react';
import E2EEncryptionService from '../services/E2EEncryptionService';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch, Alert } from 'react-native';
const FileTransferScreen = () => {
  const [files, setFiles] = useState<TransferFile[]>([
    {
      id: '1',
      name: 'photo_vacances.jpg',
      size: '2.3 MB',
      progress: 100,
      status: 'completed',
    },
    {
      id: '2',
      name: 'presentation_projet.pptx',
      size: '5.7 MB',
      progress: 45,
      status: 'paused',
    },
    {
      id: '3',
      name: 'document_important.pdf',
      size: '1.2 MB',
      progress: 0,
      status: 'pending',
    },
  ]);
  const [decryptedNames, setDecryptedNames] = useState<{[id: string]: string}>({});
  const [highQuality, setHighQuality] = useState(true);
  useEffect(() => {
    (async () => {
      const encryptedNames: {[id: string]: {ciphertext: string; nonce: string}} = {};
      for (const file of files) {
        encryptedNames[file.id] = await E2EEncryptionService.encryptMetadata(file.name);
      }
      // Déchiffrement des noms pour affichage
      const decrypted: {[id: string]: string} = {};
      for (const id in encryptedNames) {
        // Correction : passer les bons arguments à decryptMetadata
        decrypted[id] = await E2EEncryptionService.decryptMetadata(encryptedNames[id].ciphertext, encryptedNames[id].nonce) || '';
      }
      setDecryptedNames(decrypted);
    })();
  }, [files]);

  // Ajout des fonctions manquantes
  const selectFile = () => {
    Alert.alert('Sélection de fichier', 'Fonction de sélection à implémenter.');
  };
  const toggleQuality = () => {
    setHighQuality(q => !q);
  };

  const deleteFile = (id: string) => {
    setFiles(currentFiles => currentFiles.filter(file => file.id !== id));
  };

  const renderFile = ({ item }: { item: TransferFile }) => (
    <View style={styles.fileItem}>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>{decryptedNames[item.id] || '...'}</Text>
        <Text style={styles.fileSize}>{item.size}</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
      </View>
      <View style={styles.fileActions}>
        {item.status === 'completed' ? (
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => deleteFile(item.id)}>
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        ) : item.status === 'paused' ? (
          <TouchableOpacity style={[styles.actionButton, styles.resumeButton]} onPress={() => Alert.alert('Reprise', 'Reprendre le transfert')}>
            <Text style={styles.actionButtonText}>▶️</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionButton, styles.pauseButton]} onPress={() => Alert.alert('Pause', 'Mettre en pause le transfert')}>
            <Text style={styles.actionButtonText}>⏸️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfert de fichiers</Text>
      <TouchableOpacity style={styles.selectButton} onPress={selectFile}>
        <Text style={styles.selectButtonText}>Sélectionner un fichier</Text>
      </TouchableOpacity>
      <View style={styles.qualityToggle}>
        <Text>Qualité : {highQuality ? 'Originale' : 'Comprimée'}</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={highQuality ? '#0084FF' : '#f4f3f4'}
          onValueChange={toggleQuality}
          value={highQuality}
        />
      </View>
      <View style={styles.fileListContainer}>
        <Text style={styles.sectionTitle}>Fichiers en transfert</Text>
        <FlatList
          data={files}
          renderItem={renderFile}
          keyExtractor={(item) => item.id}
          style={styles.fileList}
          contentContainerStyle={styles.fileListContent}
        />
      </View>
    </View>
  );
};

// ...fin du composant FileTransferScreen...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectButton: {
    backgroundColor: '#0084FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  qualityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  fileListContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  // ...existing code...
  // Bloc StyleSheet React Native unique et à la fin
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    selectButton: {
      backgroundColor: '#0084FF',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginBottom: 20,
    },
    selectButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
    },
    qualityToggle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      padding: 10,
      backgroundColor: '#f5f5f5',
      borderRadius: 5,
    },
    fileListContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    fileList: {
      flex: 1,
    },
    fileListContent: {
      paddingBottom: 10,
    },
    fileItem: {
      backgroundColor: '#f9f9f9',
      padding: 15,
      marginBottom: 10,
      borderRadius: 5,
      borderLeftWidth: 5,
      borderLeftColor: '#0084FF',
    },
    fileInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    fileName: {
      fontSize: 16,
      fontWeight: 'bold',
      flex: 1,
    },
    fileSize: {
      fontSize: 14,
      color: '#888',
    },
    progressContainer: {
      height: 5,
      backgroundColor: '#eee',
      borderRadius: 5,
      marginBottom: 10,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#0084FF',
    },
    fileActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    actionButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
    },
    pauseButton: {
      backgroundColor: '#FFD700',
    },
    resumeButton: {
      backgroundColor: '#00C853',
    },
    deleteButton: {
      backgroundColor: '#FF5252',
    },
    actionButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
  });
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  fileListContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fileList: {
    flex: 1,
  },
  fileListContent: {
    paddingBottom: 10,
  },
  fileItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#0084FF',
  },
  fileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  fileSize: {
    fontSize: 14,
    color: '#888',
  },
  progressContainer: {
    height: 5,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0084FF',
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  pauseButton: {
    backgroundColor: '#FFD700',
  },
  resumeButton: {
    backgroundColor: '#00C853',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
              const deleteFile = (id: string) => {
                setFiles(currentFiles => currentFiles.filter(file => file.id !== id));
              };
              const renderFile = ({ item }: { item: TransferFile }) => (
                <View style={styles.fileItem}>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{decryptedNames[item.id] || '...'}</Text>
                    <Text style={styles.fileSize}>{item.size}</Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
                  </View>
                  <View style={styles.fileActions}>
                    {item.status === 'completed' ? (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]} 
                        onPress={() => deleteFile(item.id)}
                      >
                        <Text style={styles.actionButtonText}>✕</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity 
                          style={[styles.actionButton, item.status === 'transferring' ? styles.pauseButton : styles.resumeButton]} 
                          onPress={() => toggleFileStatus(item.id)}
                        >
                          <Text style={styles.actionButtonText}>{item.status === 'transferring' ? '❚❚' : '▶'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.deleteButton]} 
                          onPress={() => deleteFile(item.id)}
                        >
                          <Text style={styles.actionButtonText}>✕</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );

              return (
                <View style={styles.container}>
                  <Text style={styles.title}>Transfert de fichiers</Text>
                  <TouchableOpacity style={styles.selectButton} onPress={selectFile}>
                    <Text style={styles.selectButtonText}>Sélectionner un fichier</Text>
                  </TouchableOpacity>
                  <View style={styles.qualityToggle}>
                    <Text>Qualité : {highQuality ? 'Originale' : 'Comprimée'}</Text>
                    <Switch
                      trackColor={{ false: '#767577', true: '#81b0ff' }}
                      thumbColor={highQuality ? '#0084FF' : '#f4f3f4'}
                      onValueChange={toggleQuality}
                      value={highQuality}
                    />
                  </View>
                  <View style={styles.fileListContainer}>
                    <Text style={styles.sectionTitle}>Fichiers en transfert</Text>
                    <FlatList
                      data={files}
                      renderItem={renderFile}
                      keyExtractor={(item) => item.id}
                      style={styles.fileList}
                      contentContainerStyle={styles.fileListContent}
                    />
                  </View>
                </View>
              );
            };
// ...fin du composant...
// Bloc StyleSheet déplacé ici
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectButton: {
    backgroundColor: '#0084FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  qualityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  fileListContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fileList: {
    flex: 1,
  },
  fileListContent: {
    paddingBottom: 10,
  },
  fileItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#0084FF',
  },
  fileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  fileSize: {
    fontSize: 14,
    color: '#888',
  },
  progressContainer: {
    height: 5,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0084FF',
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  pauseButton: {
    backgroundColor: '#FFD700',
  },
  resumeButton: {
    backgroundColor: '#00C853',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
    <View style={styles.container}>
      <Text style={styles.title}>Transfert de fichiers</Text>
      
      <TouchableOpacity style={styles.selectButton} onPress={selectFile}>
        <Text style={styles.selectButtonText}>Sélectionner un fichier</Text>
      </TouchableOpacity>
      
      <View style={styles.qualityToggle}>
        <Text>Qualité : {highQuality ? 'Originale' : 'Comprimée'}</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={highQuality ? "#0084FF" : "#f4f3f4"}
          onValueChange={toggleQuality}
          value={highQuality}
        />
      </View>

      <View style={styles.fileListContainer}>
        <Text style={styles.sectionTitle}>Fichiers en transfert</Text>
        <FlatList
          data={files}
          renderItem={renderFile}
          keyExtractor={(item) => item.id}
          style={styles.fileList}
          contentContainerStyle={styles.fileListContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectButton: {
    backgroundColor: '#0084FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  qualityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  fileListContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fileList: {
    flex: 1,
  },
  fileListContent: {
    paddingBottom: 10,
  },
  fileItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#0084FF',
  },
  fileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  fileSize: {
    fontSize: 14,
    color: '#888',
  },
  progressContainer: {
    height: 5,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0084FF',
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  pauseButton: {
    backgroundColor: '#FFD700',
  },
  resumeButton: {
    backgroundColor: '#00C853',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
