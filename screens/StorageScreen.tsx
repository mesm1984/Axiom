import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';

// Type pour les fichiers stockés
type StoredFile = {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  isSelected?: boolean;
};

const StorageScreen = () => {
  const [files, setFiles] = useState<StoredFile[]>([
    {
      id: '1',
      name: 'photo_vacances.jpg',
      size: '2.3 MB',
      type: 'image/jpeg',
      date: '2023-08-15',
    },
    {
      id: '2',
      name: 'presentation_projet.pptx',
      size: '5.7 MB',
      type: 'application/pptx',
      date: '2023-08-10',
    },
    {
      id: '3',
      name: 'document_important.pdf',
      size: '1.2 MB',
      type: 'application/pdf',
      date: '2023-08-05',
    },
    {
      id: '4',
      name: 'musique.mp3',
      size: '4.8 MB',
      type: 'audio/mp3',
      date: '2023-08-01',
    },
    {
      id: '5',
      name: 'video_anniversaire.mp4',
      size: '15.2 MB',
      type: 'video/mp4',
      date: '2023-07-25',
    },
  ]);

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  
  // Stockage total et utilisé (simulé)
  const totalStorage = 1024; // 1 Go en Mo
  const usedStorage = 120; // 120 Mo

  const toggleFileSelection = (id: string) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter(fileId => fileId !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
    }
  };

  const deleteSelected = () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Aucun fichier sélectionné', 'Veuillez sélectionner au moins un fichier à supprimer.');
      return;
    }

    Alert.alert(
      'Confirmation',
      `Voulez-vous supprimer ${selectedFiles.length} fichier(s) ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setFiles(files.filter(file => !selectedFiles.includes(file.id)));
            setSelectedFiles([]);
          },
        },
      ]
    );
  };

  const shareSelected = () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Aucun fichier sélectionné', 'Veuillez sélectionner au moins un fichier à partager.');
      return;
    }

    const selectedFileNames = files
      .filter(file => selectedFiles.includes(file.id))
      .map(file => file.name)
      .join(', ');

    Alert.alert('Partage', `Partager les fichiers: ${selectedFileNames}`);
  };

  const selectAll = () => {
    if (selectedFiles.length === files.length) {
      // If all are selected, deselect all
      setSelectedFiles([]);
    } else {
      // Select all
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image')) return '🖼️';
    if (type.startsWith('video')) return '🎬';
    if (type.startsWith('audio')) return '🎵';
    if (type.startsWith('application/pdf')) return '📄';
    if (type.startsWith('application/pptx')) return '📊';
    return '📁';
  };

  const renderFile = ({ item }: { item: StoredFile }) => {
    const isSelected = selectedFiles.includes(item.id);
    return (
      <TouchableOpacity 
        style={[styles.fileItem, isSelected && styles.fileItemSelected]} 
        onPress={() => toggleFileSelection(item.id)}
      >
        <Text style={styles.fileIcon}>{getFileIcon(item.type)}</Text>
        <View style={styles.fileDetails}>
          <Text style={styles.fileName}>{item.name}</Text>
          <Text style={styles.fileInfo}>{item.size} • {item.date}</Text>
        </View>
        <View style={styles.checkBox}>
          {isSelected && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate storage percentage
  const storagePercentage = (usedStorage / totalStorage) * 100;
  const freeStorage = totalStorage - usedStorage;

  return (
    <View style={styles.container}>
      <View style={styles.storageInfo}>
        <Text style={styles.storageTitle}>Espace de stockage</Text>
        <View style={styles.storageBar}>
          <View style={[styles.storageUsed, { width: `${storagePercentage}%` }]} />
        </View>
        <Text style={styles.storageText}>
          {usedStorage} Mo utilisés sur {totalStorage} Mo ({freeStorage} Mo disponibles)
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={selectAll}>
          <Text style={styles.actionButtonText}>
            {selectedFiles.length === files.length ? 'Désélectionner tout' : 'Sélectionner tout'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton, selectedFiles.length === 0 && styles.disabledButton]}
          onPress={deleteSelected}
          disabled={selectedFiles.length === 0}
        >
          <Text style={styles.actionButtonText}>Supprimer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton, selectedFiles.length === 0 && styles.disabledButton]}
          onPress={shareSelected}
          disabled={selectedFiles.length === 0}
        >
          <Text style={styles.actionButtonText}>Partager</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Fichiers stockés localement</Text>
      <FlatList
        data={files}
        renderItem={renderFile}
        keyExtractor={(item) => item.id}
        style={styles.fileList}
        contentContainerStyle={styles.fileListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  storageInfo: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  storageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  storageBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  storageUsed: {
    height: '100%',
    backgroundColor: '#0084FF',
  },
  storageText: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0084FF',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 8,
  },
  fileItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#0084FF',
    borderWidth: 1,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileInfo: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#0084FF',
    fontWeight: 'bold',
  },
});

export default StorageScreen;
