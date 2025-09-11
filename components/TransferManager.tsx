import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import TransferResumptionService, {
  TransferSession,
  TransferProgress,
} from '../services/TransferResumptionService';
import PulseButton from './PulseButton';

interface TransferManagerProps {
  visible: boolean;
  onClose: () => void;
}

const TransferManager: React.FC<TransferManagerProps> = ({
  visible,
  onClose,
}) => {
  const [sessions, setSessions] = useState<TransferSession[]>([]);
  const [progressData, setProgressData] = useState<
    Map<string, TransferProgress>
  >(new Map());
  const [refreshing, setRefreshing] = useState(false);

  const transferService = TransferResumptionService.getInstance();

  const loadSessions = useCallback(async () => {
    try {
      const activeSessions = await transferService.getActiveSessions();
      setSessions(activeSessions);

      // S'abonner aux mises à jour de progrès
      activeSessions.forEach(session => {
        transferService.onProgress(session.id, (progress: TransferProgress) => {
          setProgressData(
            current => new Map(current.set(session.id, progress)),
          );
        });
      });
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    }
  }, [transferService]);

  useEffect(() => {
    if (visible) {
      loadSessions();
    }

    return () => {
      // Se désabonner des notifications de progrès
      sessions.forEach(session => {
        transferService.offProgress(session.id);
      });
    };
  }, [visible, loadSessions, sessions, transferService]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }, [loadSessions]);

  const handleResumeTransfer = async (sessionId: string) => {
    try {
      const success = await transferService.resumeTransferSession(sessionId);
      if (success) {
        await loadSessions();
        Alert.alert('Succès', 'Transfert repris avec succès');
      } else {
        Alert.alert('Erreur', 'Impossible de reprendre le transfert');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la reprise du transfert');
    }
  };

  const handlePauseTransfer = async (sessionId: string) => {
    try {
      await transferService.pauseTransfer(sessionId);
      await loadSessions();
      Alert.alert('Succès', 'Transfert mis en pause');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la pause du transfert');
    }
  };

  const handleCancelTransfer = (sessionId: string) => {
    Alert.alert(
      'Annuler le transfert',
      'Êtes-vous sûr de vouloir annuler ce transfert ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            try {
              await transferService.cancelTransfer(sessionId);
              await loadSessions();
              Alert.alert('Succès', 'Transfert annulé');
            } catch (error) {
              Alert.alert('Erreur', "Erreur lors de l'annulation");
            }
          },
        },
      ],
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusColor = (status: TransferSession['status']): string => {
    switch (status) {
      case 'active':
        return '#34C759';
      case 'paused':
        return '#FF9500';
      case 'pending':
        return '#007AFF';
      case 'completed':
        return '#34C759';
      case 'failed':
        return '#FF3B30';
      case 'cancelled':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: TransferSession['status']): string => {
    switch (status) {
      case 'active':
        return 'En cours';
      case 'paused':
        return 'En pause';
      case 'pending':
        return 'En attente';
      case 'completed':
        return 'Terminé';
      case 'failed':
        return 'Échec';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const renderTransferItem = ({ item }: { item: TransferSession }) => {
    const progress = progressData.get(item.id);
    const percentage = progress ? progress.percentage : item.progress;

    return (
      <View style={styles.transferItem}>
        <View style={styles.transferHeader}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.fileName}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        <View style={styles.transferInfo}>
          <Text style={styles.transferSize}>
            {formatFileSize(item.transferredBytes)} /{' '}
            {formatFileSize(item.fileSize)}
          </Text>
          <Text style={styles.transferPercentage}>
            {percentage.toFixed(1)}%
          </Text>
        </View>

        {/* Barre de progression */}
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: getStatusColor(item.status),
              },
            ]}
          />
        </View>

        {/* Informations détaillées */}
        {progress && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>
              Vitesse: {formatFileSize(progress.speed)}/s
            </Text>
            <Text style={styles.detailText}>
              ETA: {formatDuration(progress.eta)}
            </Text>
            <Text style={styles.detailText}>
              Chunks: {progress.chunksCompleted}/{progress.totalChunks}
            </Text>
          </View>
        )}

        {/* Messages d'erreur */}
        {item.errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{item.errorMessage}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {item.status === 'paused' && (
            <PulseButton
              title="Reprendre"
              onPress={() => handleResumeTransfer(item.id)}
              style={styles.actionButton}
              textStyle={styles.actionButtonText}
              pulseColor="#34C759"
            />
          )}

          {item.status === 'active' && (
            <PulseButton
              title="Pause"
              onPress={() => handlePauseTransfer(item.id)}
              style={[styles.actionButton, styles.pauseButton]}
              textStyle={styles.actionButtonText}
              pulseColor="#FF9500"
            />
          )}

          {(item.status === 'failed' || item.status === 'paused') && (
            <PulseButton
              title="Reprendre"
              onPress={() => handleResumeTransfer(item.id)}
              style={[styles.actionButton, styles.retryButton]}
              textStyle={styles.actionButtonText}
              pulseColor="#007AFF"
            />
          )}

          {item.status !== 'completed' && (
            <PulseButton
              title="Annuler"
              onPress={() => handleCancelTransfer(item.id)}
              style={[styles.actionButton, styles.cancelButton]}
              textStyle={styles.actionButtonText}
              pulseColor="#FF3B30"
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestionnaire de transferts</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={sessions}
          renderItem={renderTransferItem}
          keyExtractor={item => item.id}
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun transfert en cours</Text>
              <Text style={styles.emptySubText}>
                Les transferts actifs, en pause ou échoués apparaîtront ici
              </Text>
            </View>
          }
        />

        <View style={styles.footer}>
          <PulseButton
            title="🧹 Nettoyer les anciens"
            onPress={async () => {
              const cleaned = await transferService.cleanupOldSessions();
              await loadSessions();
              Alert.alert(
                'Nettoyage terminé',
                `${cleaned} session(s) supprimée(s)`,
              );
            }}
            style={styles.cleanupButton}
            textStyle={styles.cleanupButtonText}
            pulseColor="#8E8E93"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  transferItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  transferInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transferSize: {
    fontSize: 14,
    color: '#666',
  },
  transferPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#888',
  },
  errorContainer: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  errorText: {
    fontSize: 12,
    color: '#856404',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#34C759',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  retryButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cleanupButton: {
    backgroundColor: '#8E8E93',
  },
  cleanupButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default TransferManager;
