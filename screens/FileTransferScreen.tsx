import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Switch,
} from 'react-native';

// TODO: Importer les modules nécessaires pour la sélection de fichiers et le chiffrement si besoin

type FileItem = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'transferring' | 'paused' | 'completed';
};

const FileTransferScreen: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [highQuality, setHighQuality] = useState(false);

  // Sélection de fichier (à implémenter)
  const selectFile = () => {
    // TODO: Implémenter la sélection de fichier
    // Exemple fictif pour la démo :
    const newFile: FileItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Document.pdf',
      size: 1024,
      progress: 0,
      status: 'pending',
    };
    setFiles(prev => [...prev, newFile]);
  };

  const toggleQuality = () => setHighQuality(q => !q);

  // Actions sur les fichiers (pause, reprendre, supprimer)
  const pauseFile = (id: string) => {
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, status: 'paused' } : f)),
    );
  };
  const resumeFile = (id: string) => {
    setFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, status: 'transferring' } : f)),
    );
  };
  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const renderFile = ({ item }: { item: FileItem }) => (
    <View style={styles.fileItem}>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>{item.name}</Text>
        <Text style={styles.fileSize}>{item.size} Ko</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
      </View>
      <View style={styles.fileActions}>
        {item.status === 'transferring' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.pauseButton]}
            onPress={() => pauseFile(item.id)}
          >
            <Text style={styles.actionButtonText}>⏸</Text>
          </TouchableOpacity>
        )}
        {item.status === 'paused' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.resumeButton]}
            onPress={() => resumeFile(item.id)}
          >
            <Text style={styles.actionButtonText}>▶</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteFile(item.id)}
        >
          <Text style={styles.actionButtonText}>🗑</Text>
        </TouchableOpacity>
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
          keyExtractor={item => item.id}
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

export default FileTransferScreen;
