import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';

// Type pour les fichiers stockés
type StoredFile = {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  mtime: string | number | Date;
};

const StorageScreen = () => {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Ajout d'une variable pour la taille maximale (exemple : 1 Go)
  const MAX_STORAGE = 1024 * 1024 * 1024; // 1 Go en octets
  const usedPercent = Math.min((totalSize / MAX_STORAGE) * 100, 100);

  useEffect(() => {
    const scanFiles = async () => {
      const dirPath = RNFS.DocumentDirectoryPath;
      const result = await RNFS.readDir(dirPath);
      let size = 0;
      const fileList: StoredFile[] = await Promise.all(
        result.map(async (file: any) => {
          const stats = await RNFS.stat(file.path);
          size += Number(stats.size);
          return {
            id: file.name,
            name: file.name,
            path: file.path,
            size: Number(stats.size),
            mtime: stats.mtime,
            type: file.name.split('.').pop() || 'unknown',
          };
        }),
      );
      setFiles(fileList);
      setTotalSize(size);
    };
    scanFiles();
  }, []);

  // Notification si espace critique
  useEffect(() => {
    if (totalSize > MAX_STORAGE * 0.9) {
      Alert.alert(
        'Stockage presque plein',
        'Votre espace de stockage est presque saturé. Pensez à supprimer ou sauvegarder vos fichiers.',
      );
    }
  }, [totalSize, MAX_STORAGE]);

  const toggleFileSelection = (id: string) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter(fileId => fileId !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
    }
  };

  const deleteSelected = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert(
        'Aucun fichier sélectionné',
        'Veuillez sélectionner au moins un fichier à supprimer.',
      );
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
          onPress: async () => {
            for (const file of files) {
              if (selectedFiles.includes(file.id)) {
                try {
                  await RNFS.unlink(file.path);
                } catch (e) {}
              }
            }
            const updatedFiles = files.filter(
              file => !selectedFiles.includes(file.id),
            );
            setFiles(updatedFiles);
            setSelectedFiles([]);
            // Recalculer la taille totale
            const newTotalSize = updatedFiles.reduce(
              (acc, f) => acc + f.size,
              0,
            );
            setTotalSize(newTotalSize);
          },
        },
      ],
    );
  };

  const shareSelected = () => {
    if (selectedFiles.length === 0) {
      Alert.alert(
        'Aucun fichier sélectionné',
        'Veuillez sélectionner au moins un fichier à partager.',
      );
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

  const autoClean = async () => {
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const LARGE_FILE = 50 * 1024 * 1024;
    const filesToDelete = files.filter(
      f =>
        f.size > LARGE_FILE ||
        (typeof f.mtime === 'number' && now - f.mtime > THIRTY_DAYS),
    );
    if (filesToDelete.length === 0) {
      Alert.alert(
        'Nettoyage automatique',
        'Aucun fichier volumineux ou ancien à supprimer.',
      );
      return;
    }
    Alert.alert(
      'Nettoyage automatique',
      `Voulez-vous supprimer ${filesToDelete.length} fichier(s) volumineux ou anciens ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            for (const file of filesToDelete) {
              try {
                await RNFS.unlink(file.path);
              } catch (e) {}
            }
            const updatedFiles = files.filter(f => !filesToDelete.includes(f));
            setFiles(updatedFiles);
            setSelectedFiles([]);
            setTotalSize(updatedFiles.reduce((acc, f) => acc + f.size, 0));
          },
        },
      ],
    );
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
          <Text style={styles.fileInfo}>
            {(item.size / 1024).toFixed(1)} Ko •{' '}
            {typeof item.mtime === 'string'
              ? item.mtime
              : new Date(item.mtime).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.checkBox}>
          {isSelected && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  // ...totalMo supprimé car non utilisé...

  return (
    <View style={styles.container}>
      <View style={styles.storageInfo}>
        <Text style={styles.storageTitle}>Espace de stockage utilisé</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${usedPercent}%` }]} />
        </View>
        <Text style={styles.storageText}>
          {(totalSize / (1024 * 1024)).toFixed(2)} Mo utilisés / 1024 Mo
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={selectAll}>
          <Text style={styles.actionButtonText}>
            {selectedFiles.length === files.length
              ? 'Désélectionner tout'
              : 'Sélectionner tout'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.deleteButton,
            selectedFiles.length === 0 && styles.disabledButton,
          ]}
          onPress={deleteSelected}
          disabled={selectedFiles.length === 0}
        >
          <Text style={styles.actionButtonText}>Supprimer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.shareButton,
            selectedFiles.length === 0 && styles.disabledButton,
          ]}
          onPress={shareSelected}
          disabled={selectedFiles.length === 0}
        >
          <Text style={styles.actionButtonText}>Partager</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.autoCleanButton]}
          onPress={autoClean}
        >
          <Text style={styles.actionButtonText}>Nettoyage auto</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Fichiers stockés localement</Text>
      <FlatList
        data={files}
        renderItem={renderFile}
        keyExtractor={item => item.id}
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
  autoCleanButton: {
    backgroundColor: '#FFA726',
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
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0084FF',
    borderRadius: 6,
  },
});

export default StorageScreen;
