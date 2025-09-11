/**
 * Tests pour TelemetryService
 */

import TelemetryService from '../services/TelemetryService';
import { Platform } from 'react-native';

// Mock des dépendances
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));

// Mock de fetch global
global.fetch = jest.fn();

describe('TelemetryService', () => {
  let service: TelemetryService;

  beforeEach(() => {
    service = TelemetryService.getInstance();
    jest.clearAllMocks();
  });

  describe('Configuration par défaut', () => {
    test('devrait être désactivé par défaut', () => {
      const config = service.getConfiguration();
      expect(config.enabled).toBe(false);
    });

    test('devrait avoir une configuration par défaut appropriée', () => {
      const config = service.getConfiguration();

      expect(config.collectPerformance).toBe(true);
      expect(config.collectUsage).toBe(true);
      expect(config.collectErrors).toBe(true);
      expect(config.collectSecurity).toBe(false); // Plus sensible
      expect(config.uploadInterval).toBe(60);
      expect(config.maxStoredEvents).toBe(1000);
    });
  });

  describe('Activation/Désactivation', () => {
    test('devrait activer la télémétrie avec consentement', async () => {
      await service.setTelemetryEnabled(true);

      const config = service.getConfiguration();
      expect(config.enabled).toBe(true);
    });

    test('devrait désactiver la télémétrie et supprimer les données', async () => {
      await service.setTelemetryEnabled(true);
      await service.setTelemetryEnabled(false);

      const config = service.getConfiguration();
      expect(config.enabled).toBe(false);

      // Vérifier que les événements ont été supprimés
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('telemetry_events');
    });
  });

  describe('Collecte de métriques', () => {
    beforeEach(async () => {
      await service.setTelemetryEnabled(true);
    });

    test('devrait collecter les métriques de performance', () => {
      const metrics = {
        appStartTime: 1500,
        screenLoadTime: 300,
        transferSpeed: 1024000,
      };

      service.trackPerformance(metrics);

      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(1);
    });

    test("devrait collecter les métriques d'usage", () => {
      const metrics = {
        feature: 'file_transfer',
        action: 'start_transfer',
        success: true,
        duration: 5000,
      };

      service.trackUsage(metrics);

      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(1);
    });

    test("devrait collecter les métriques d'erreur", () => {
      const metrics = {
        errorType: 'network_error',
        errorMessage: 'Connection timeout',
        context: 'file_transfer',
      };

      service.trackError(metrics);

      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(1);
    });

    test('devrait anonymiser les stack traces', () => {
      const metrics = {
        errorType: 'runtime_error',
        stackTrace: 'Error at /Users/john/app/src/component.js:123',
        context: 'app_startup',
      };

      service.trackError(metrics);

      // Les données sensibles devraient être anonymisées
      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(1);
    });

    test('ne devrait pas collecter si la télémétrie est désactivée', () => {
      service.trackPerformance({ appStartTime: 1000 });

      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(0);
    });

    test('ne devrait pas collecter la sécurité si désactivée', async () => {
      await service.configureTelemetry({ collectSecurity: false });

      service.trackSecurity({
        eventType: 'encryption',
        success: true,
        duration: 100,
      });

      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(0);
    });
  });

  describe('Méthodes de tracking spécialisées', () => {
    beforeEach(async () => {
      await service.setTelemetryEnabled(true);
    });

    test("devrait tracker le démarrage de l'app", () => {
      const startTime = Date.now() - 1500;
      service.trackAppStart(startTime);

      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(2); // Performance + Usage
    });

    test('devrait tracker la navigation', () => {
      service.trackScreenNavigation('ConversationScreen', 250);

      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(2); // Usage + Performance
    });

    test('devrait tracker les transferts P2P', () => {
      service.trackP2PTransfer(true, 1048576, 5000, 209715); // 1MB en 5s

      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(3); // Usage + Performance + Security
    });

    test('devrait tracker le chiffrement', () => {
      service.trackEncryption('encrypt', true, 50);

      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(2); // Security + Performance
    });
  });

  describe('Upload et persistance', () => {
    beforeEach(async () => {
      await service.setTelemetryEnabled(true);
    });

    test('devrait sauvegarder les événements localement', async () => {
      service.trackUsage({
        feature: 'test',
        action: 'test_action',
        success: true,
      });

      const AsyncStorage = require('@react-native-async-storage/async-storage');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'telemetry_events',
        expect.stringContaining('test_action'),
      );
    });

    test('devrait uploader les événements avec succès', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      service.trackUsage({
        feature: 'test',
        action: 'test_upload',
        success: true,
      });

      const success = await service.uploadEventsNow();
      expect(success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('telemetry'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    test("devrait gérer les erreurs d'upload", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      service.trackUsage({
        feature: 'test',
        action: 'test_upload_fail',
        success: true,
      });

      const success = await service.uploadEventsNow();
      expect(success).toBe(false);

      // Les événements devraient rester en queue
      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(1);
    });

    test("devrait limiter le nombre d'événements stockés", async () => {
      await service.configureTelemetry({ maxStoredEvents: 5 });

      // Ajouter plus d\'événements que la limite
      for (let i = 0; i < 10; i++) {
        service.trackUsage({
          feature: 'test',
          action: `action_${i}`,
          success: true,
        });
      }

      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBeLessThanOrEqual(5);
    });
  });

  describe('Conformité RGPD', () => {
    test('devrait exporter les données utilisateur', async () => {
      await service.setTelemetryEnabled(true);
      service.trackUsage({
        feature: 'test',
        action: 'export_test',
        success: true,
      });

      const exportData = await service.exportUserData();

      expect(exportData).toHaveProperty('config');
      expect(exportData).toHaveProperty('events');
      expect(exportData).toHaveProperty('statistics');
      expect(exportData.events).toHaveLength(1);
    });

    test('devrait supprimer toutes les données utilisateur', async () => {
      await service.setTelemetryEnabled(true);
      service.trackUsage({
        feature: 'test',
        action: 'delete_test',
        success: true,
      });

      await service.deleteAllUserData();

      const config = service.getConfiguration();
      const stats = service.getTelemetryStats();

      expect(config.enabled).toBe(false);
      expect(stats.eventCount).toBe(0);
    });
  });

  describe('Statistiques et debugging', () => {
    test('devrait fournir des statistiques détaillées', () => {
      const stats = service.getTelemetryStats();

      expect(stats).toHaveProperty('enabled');
      expect(stats).toHaveProperty('eventCount');
      expect(stats).toHaveProperty('sessionId');
      expect(stats).toHaveProperty('sessionDuration');
      expect(stats).toHaveProperty('config');
    });

    test('devrait fournir des informations de debug', async () => {
      await service.setTelemetryEnabled(true);
      service.trackUsage({
        feature: 'debug',
        action: 'test_debug',
        success: true,
      });

      const debugInfo = await service.debugTelemetry();

      expect(debugInfo).toHaveProperty('config');
      expect(debugInfo).toHaveProperty('eventCount');
      expect(debugInfo).toHaveProperty('events');
      expect(debugInfo).toHaveProperty('sessionInfo');
    });
  });

  describe('Configuration personnalisée', () => {
    test('devrait permettre de configurer les types de collecte', async () => {
      await service.configureTelemetry({
        collectPerformance: false,
        collectUsage: true,
        collectErrors: false,
        collectSecurity: true,
      });

      const config = service.getConfiguration();

      expect(config.collectPerformance).toBe(false);
      expect(config.collectUsage).toBe(true);
      expect(config.collectErrors).toBe(false);
      expect(config.collectSecurity).toBe(true);
    });

    test('devrait respecter les préférences de collecte', async () => {
      await service.setTelemetryEnabled(true);
      await service.configureTelemetry({
        collectPerformance: false,
      });

      service.trackPerformance({ appStartTime: 1000 });

      const stats = service.getTelemetryStats();
      expect(stats.eventCount).toBe(0);
    });
  });
});
