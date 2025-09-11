import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
  Switch,
} from 'react-native';
import StorageManagementService, {
  StorageStats,
  FileInfo,
  StorageQuota,
} from '../services/StorageManagementService';
import PulseButton from '../components/PulseButton';
import PageTransition from '../components/PageTransition';
import BottomTabBar from '../components/BottomTabBar';

const StorageScreen = () => {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'settings'>(
    'overview',
  );

  const storageService = StorageManagementService.getInstance();

  const loadStorageData = useCallback(async () => {
    try {
      const [stats, quotaData] = await Promise.all([
        storageService.analyzeStorage(),
        storageService.getStorageQuota(),
      ]);
      setStorageStats(stats);
      setQuota(quotaData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de stockage');
    }
  }, [storageService]);

  useEffect(() => {
    loadStorageData();
  }, [loadStorageData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStorageData();
    setRefreshing(false);
  }, [loadStorageData]);

  const getProgressBarColor = (
    isCritical: boolean,
    isWarning: boolean,
  ): string => {
    if (isCritical) {
      return '#FF3B30';
    }
    if (isWarning) {
      return '#FF9500';
    }
    return '#34C759';
  };

  const getProgressBarWidth = (percentage: number) => {
    return `${Math.min(percentage, 100)}%` as const;
  };

  const handleDeleteSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    Alert.alert(
      'Supprimer les fichiers',
      `Êtes-vous sûr de vouloir supprimer ${selectedFiles.length} fichier(s) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteFiles(selectedFiles);
              setSelectedFiles([]);
              await loadStorageData();
              Alert.alert('Succès', 'Fichiers supprimés avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer les fichiers');
            }
          },
        },
      ],
    );
  };

  const handleIntelligentCleanup = async () => {
    Alert.alert(
      'Nettoyage intelligent',
      'Cette action supprimera automatiquement les fichiers anciens et les doublons. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Nettoyer',
          onPress: async () => {
            try {
              const result = await storageService.performIntelligentCleanup();
              await loadStorageData();
              Alert.alert(
                'Nettoyage terminé',
                `${result.deletedFiles.length} fichiers supprimés\n` +
                  `${StorageManagementService.formatFileSize(
                    result.spaceSaved,
                  )} d'espace libéré`,
              );
            } catch (error) {
              Alert.alert('Erreur', 'Échec du nettoyage automatique');
            }
          },
        },
      ],
    );
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(current =>
      current.includes(fileId)
        ? current.filter(id => id !== fileId)
        : [...current, fileId],
    );
  };

  const updateQuotaSetting = async (newQuota: StorageQuota) => {
    try {
      await storageService.setStorageQuota(newQuota);
      setQuota(newQuota);
      Alert.alert('Succès', 'Configuration mise à jour');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la configuration');
    }
  };

  if (!storageStats || !quota) {
    return (
      <PageTransition visible={true} type="fade">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyse du stockage...</Text>
        </View>
        <BottomTabBar currentRoute="Storage" />
      </PageTransition>
    );
  }

  const usagePercentage = (storageStats.usedSize / quota.maxTotalSize) * 100;
  const isWarningLevel = usagePercentage >= quota.warningThreshold * 100;
  const isCriticalLevel = usagePercentage >= quota.autoCleanupThreshold * 100;

  const renderOverviewTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Indicateur d'utilisation */}
      <View style={styles.usageCard}>
        <Text style={styles.cardTitle}>Utilisation du stockage</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                {
                  width: getProgressBarWidth(usagePercentage),
                  backgroundColor: getProgressBarColor(
                    isCriticalLevel,
                    isWarningLevel,
                  ),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {StorageManagementService.formatFileSize(storageStats.usedSize)} /{' '}
            {StorageManagementService.formatFileSize(quota.maxTotalSize)}
          </Text>
        </View>
      </View>

      {/* Statistiques par type */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Répartition par type</Text>
        {Object.entries(storageStats.filesByType).map(([type, stats]) => (
          <View key={type} style={styles.typeStatsRow}>
            <Text style={styles.typeLabel}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
            <View style={styles.typeStatsData}>
              <Text style={styles.typeCount}>{stats.count} fichiers</Text>
              <Text style={styles.typeSize}>
                {StorageManagementService.formatFileSize(stats.size)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Actions rapides */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Actions rapides</Text>
        
        <PulseButton
          title="🧹 Nettoyage intelligent"
          onPress={handleIntelligentCleanup}
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
          pulseColor="#007AFF"
        />
      </View>

      {/* Alertes */}
      {(storageStats.duplicateFiles.length > 0 ||
        storageStats.oldestFiles.length > 3) && (
        <View style={styles.alertsCard}>
          <Text style={styles.cardTitle}>⚠️ Recommandations</Text>
          
          {storageStats.duplicateFiles.length > 0 && (
            <Text style={styles.alertText}>
              {storageStats.duplicateFiles.length} doublons détectés
            </Text>
          )}
          
          {storageStats.oldestFiles.length > 3 && (
            <Text style={styles.alertText}>
              {storageStats.oldestFiles.length} fichiers anciens non utilisés
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderFileItem = ({ item }: { item: FileInfo }) => (
    <TouchableOpacity
      style={[
        styles.fileItem,
        selectedFiles.includes(item.id) && styles.selectedFileItem,
      ]}
      onPress={() => toggleFileSelection(item.id)}
    >
      <View style={styles.fileIcon}>
        <Text style={styles.fileIconText}>
          {item.type === 'image'
            ? '🖼️'
            : item.type === 'video'
            ? '🎥'
            : item.type === 'document'
            ? '📄'
            : item.type === 'audio'
            ? '🎵'
            : '📁'}
        </Text>
      </View>
      
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.fileDetails}>
          {StorageManagementService.formatFileSize(item.size)} •{' '}
          {new Date(item.lastAccessed).toLocaleDateString()}
        </Text>
      </View>
      
      {selectedFiles.includes(item.id) && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedIndicatorText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFilesTab = () => {
    const allFiles = [
      ...storageStats.largestFiles,
      ...storageStats.oldestFiles,
    ].filter(
      (file, index, arr) => arr.findIndex(f => f.id === file.id) === index,
    );

    return (
      <View style={styles.tabContent}>
        {selectedFiles.length > 0 && (
          <View style={styles.selectionHeader}>
            <Text style={styles.selectionText}>
              {selectedFiles.length} fichier(s) sélectionné(s)
            </Text>
            <PulseButton
              title="Supprimer"
              onPress={handleDeleteSelectedFiles}
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
              pulseColor="#FF3B30"
            />
          </View>
        )}
        
        <FlatList
          data={allFiles}
          renderItem={renderFileItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun fichier trouvé</Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderSettingsTab = () => {
    if (!quota) {
      return null;
    }

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Configuration du stockage</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Nettoyage automatique</Text>
            <Switch
              value={quota.autoCleanupEnabled}
              onValueChange={value =>
                updateQuotaSetting({ ...quota, autoCleanupEnabled: value })
              }
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>
              Seuil d'alerte: {Math.round(quota.warningThreshold * 100)}%
            </Text>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>
              Rétention: {quota.retentionDays} jours
            </Text>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>
              Limite:{' '}
              {StorageManagementService.formatFileSize(quota.maxTotalSize)}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <PageTransition visible={true} type="fade">
      <View style={styles.container}>
        {/* En-tête avec onglets */}
        <View style={styles.header}>
          <Text style={styles.title}>Gestion du stockage</Text>
          <View style={styles.tabContainer}>
            {(['overview', 'files', 'settings'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab === 'overview'
                    ? "Vue d'ensemble"
                    : tab === 'files'
                    ? 'Fichiers'
                    : 'Paramètres'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contenu des onglets */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'files' && renderFilesTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </View>
      
      <BottomTabBar currentRoute="Storage" />
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: -1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  usageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  typeStatsData: {
    alignItems: 'flex-end',
  },
  typeCount: {
    fontSize: 12,
    color: '#666',
  },
  typeSize: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  alertsCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  alertText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedFileItem: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileIconText: {
    fontSize: 18,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#666',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default StorageScreen;
