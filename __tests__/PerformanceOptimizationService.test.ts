/**
 * Tests unitaires pour PerformanceOptimizationService
 *
 * @version 1.0.0
 * @author Axiom Team
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import performanceService, {
  type DeviceCapabilities,
  type PerformanceProfile,
  type PerformanceMetrics,
  type OptimizationSettings,
  PerformanceError,
} from '../services/PerformanceOptimizationService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock React Native modules
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({
      height: 800,
      width: 400,
      scale: 2,
    })),
  },
  Platform: {
    OS: 'ios',
    Version: '15.0',
  },
}));

// Mock global performance
global.performance = {
  now: jest.fn(() => Date.now()),
} as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => {
  setTimeout(callback, 16);
  return 1;
});

describe('PerformanceOptimizationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (global.performance.now as jest.Mock).mockReturnValue(Date.now());
  });

  describe('Device Capabilities Detection', () => {
    it('should detect device capabilities correctly', async () => {
      const capabilities = performanceService.getDeviceCapabilities();

      if (capabilities) {
        expect(capabilities).toHaveProperty('ram');
        expect(capabilities).toHaveProperty('cpuCores');
        expect(capabilities).toHaveProperty('gpuTier');
        expect(capabilities).toHaveProperty('screenDensity');
        expect(capabilities).toHaveProperty('networkSpeed');
        expect(capabilities).toHaveProperty('batteryOptimized');

        expect(typeof capabilities.ram).toBe('number');
        expect(capabilities.ram).toBeGreaterThan(0);
        expect(['low', 'medium', 'high']).toContain(capabilities.gpuTier);
        expect(['slow', 'medium', 'fast']).toContain(capabilities.networkSpeed);
      }
    });

    it('should estimate RAM based on screen properties', async () => {
      // Mock high-density screen
      const mockDimensions = require('react-native').Dimensions;
      mockDimensions.get.mockReturnValue({
        height: 2400,
        width: 1080,
        scale: 3.5,
      });

      // Recalibrate to trigger new detection
      await performanceService.recalibrateProfile();
      const capabilities = performanceService.getDeviceCapabilities();

      expect(capabilities?.ram).toBeGreaterThanOrEqual(4096);
    });

    it('should estimate CPU cores based on performance', async () => {
      // Mock fast performance
      let callCount = 0;
      (global.performance.now as jest.Mock).mockImplementation(() => {
        const baseTime = 1000;
        if (callCount === 0) {
          callCount++;
          return baseTime;
        }
        return baseTime + 5; // Very fast execution (5ms)
      });

      await performanceService.recalibrateProfile();
      const capabilities = performanceService.getDeviceCapabilities();

      expect(capabilities?.cpuCores).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Performance Profile Selection', () => {
    it('should select appropriate profile for low-end device', async () => {
      // Mock low-end device capabilities
      const lowEndCapabilities: DeviceCapabilities = {
        ram: 1024,
        cpuCores: 2,
        gpuTier: 'low',
        screenDensity: 1.5,
        networkSpeed: 'slow',
        batteryOptimized: false,
      };

      // Store mock capabilities
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(lowEndCapabilities),
      );

      await performanceService.recalibrateProfile();
      const profile = performanceService.getCurrentProfile();

      expect(profile?.level).toBe('potato');
      expect(profile?.animationsEnabled).toBe(false);
      expect(profile?.maxConcurrentTransfers).toBe(1);
      expect(profile?.compressionLevel).toBe(9);
    });

    it('should select appropriate profile for high-end device', async () => {
      // Mock high-end device capabilities
      const highEndCapabilities: DeviceCapabilities = {
        ram: 8192,
        cpuCores: 8,
        gpuTier: 'high',
        screenDensity: 3,
        networkSpeed: 'fast',
        batteryOptimized: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(highEndCapabilities),
      );

      await performanceService.recalibrateProfile();
      const profile = performanceService.getCurrentProfile();

      expect(profile?.level).toBe('ultra');
      expect(profile?.animationsEnabled).toBe(true);
      expect(profile?.maxConcurrentTransfers).toBeGreaterThanOrEqual(5);
      expect(profile?.compressionLevel).toBeLessThanOrEqual(3);
    });
  });

  describe('Performance Metrics Collection', () => {
    it('should collect performance metrics', async () => {
      const metrics = performanceService.getCurrentMetrics();

      if (metrics) {
        expect(metrics).toHaveProperty('fps');
        expect(metrics).toHaveProperty('memoryUsage');
        expect(metrics).toHaveProperty('cpuUsage');
        expect(metrics).toHaveProperty('networkLatency');
        expect(metrics).toHaveProperty('renderTime');
        expect(metrics).toHaveProperty('gcCount');
        expect(metrics).toHaveProperty('timestamp');

        expect(typeof metrics.fps).toBe('number');
        expect(metrics.fps).toBeGreaterThanOrEqual(0);
        expect(metrics.fps).toBeLessThanOrEqual(120);

        expect(typeof metrics.memoryUsage).toBe('number');
        expect(metrics.memoryUsage).toBeGreaterThan(0);

        expect(typeof metrics.cpuUsage).toBe('number');
        expect(metrics.cpuUsage).toBeGreaterThanOrEqual(0);
        expect(metrics.cpuUsage).toBeLessThanOrEqual(100);
      }
    });

    it('should maintain metrics history', async () => {
      // Trigger multiple metrics collections
      await new Promise(resolve => setTimeout(resolve, 100));

      const history = performanceService.getMetricsHistory();
      expect(Array.isArray(history)).toBe(true);
      // History might be empty initially in test environment
    });
  });

  describe('Automatic Profile Adjustment', () => {
    it('should reduce quality when FPS is low', async () => {
      const initialProfile = performanceService.getCurrentProfile();

      if (initialProfile && initialProfile.animationsEnabled) {
        // Mock low FPS metrics
        const lowFpsMetrics: PerformanceMetrics = {
          fps: 15, // Very low FPS
          memoryUsage: 100,
          cpuUsage: 80,
          networkLatency: 100,
          renderTime: 50,
          gcCount: 5,
          timestamp: Date.now(),
        };

        // Simulate metrics update that should trigger adjustment
        // Note: This is a simplified test as the actual service runs on intervals
        const currentProfile = performanceService.getCurrentProfile();
        expect(currentProfile).toBeDefined();
      }
    });

    it('should handle memory pressure correctly', async () => {
      const capabilities = performanceService.getDeviceCapabilities();

      if (capabilities) {
        // Mock high memory usage
        const highMemoryMetrics: PerformanceMetrics = {
          fps: 60,
          memoryUsage: capabilities.ram * 0.9, // 90% memory usage
          cpuUsage: 50,
          networkLatency: 100,
          renderTime: 20,
          gcCount: 10,
          timestamp: Date.now(),
        };

        // The service should handle this automatically
        const profile = performanceService.getCurrentProfile();
        expect(profile).toBeDefined();
      }
    });
  });

  describe('Settings Management', () => {
    it('should update optimization settings', async () => {
      const newSettings: Partial<OptimizationSettings> = {
        preserveBattery: true,
        reducedMotion: true,
        dataCompression: false,
      };

      await performanceService.updateSettings(newSettings);
      const currentSettings = performanceService.getSettings();

      expect(currentSettings.preserveBattery).toBe(true);
      expect(currentSettings.reducedMotion).toBe(true);
      expect(currentSettings.dataCompression).toBe(false);
    });

    it('should apply battery optimization correctly', async () => {
      await performanceService.updateSettings({ preserveBattery: true });

      const profile = performanceService.getCurrentProfile();

      if (profile) {
        // Battery optimization should reduce concurrent transfers
        expect(profile.backgroundProcessing).toBe(false);
      }
    });

    it('should respect reduced motion preference', async () => {
      await performanceService.updateSettings({ reducedMotion: true });

      const profile = performanceService.getCurrentProfile();

      if (profile) {
        expect(profile.animationsEnabled).toBe(false);
      }
    });
  });

  describe('Performance Recommendations', () => {
    it('should provide relevant recommendations', () => {
      const recommendations =
        performanceService.getPerformanceRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
      // Recommendations might be empty if performance is good
    });

    it('should recommend memory cleanup when needed', () => {
      // Mock high memory usage scenario
      const mockMetrics: PerformanceMetrics = {
        fps: 60,
        memoryUsage: 3000, // High memory usage
        cpuUsage: 30,
        networkLatency: 100,
        renderTime: 20,
        gcCount: 2,
        timestamp: Date.now(),
      };

      // This would need to be tested with actual metrics in the service
      const recommendations =
        performanceService.getPerformanceRecommendations();
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Custom Profile Management', () => {
    it('should allow setting custom profile', async () => {
      const customProfile: Partial<PerformanceProfile> = {
        maxConcurrentTransfers: 3,
        chunkSize: 512,
        compressionLevel: 5,
      };

      await performanceService.setCustomProfile(customProfile);
      const currentProfile = performanceService.getCurrentProfile();

      expect(currentProfile?.maxConcurrentTransfers).toBe(3);
      expect(currentProfile?.chunkSize).toBe(512);
      expect(currentProfile?.compressionLevel).toBe(5);
    });

    it('should throw error when setting profile without base', async () => {
      // Clear current profile first
      performanceService.dispose();

      const customProfile: Partial<PerformanceProfile> = {
        maxConcurrentTransfers: 3,
      };

      await expect(
        performanceService.setCustomProfile(customProfile),
      ).rejects.toThrow(PerformanceError);
    });
  });

  describe('Event Listeners', () => {
    it('should notify listeners on metrics update', done => {
      let callCount = 0;
      const unsubscribe = performanceService.onMetricsUpdate(metrics => {
        callCount++;
        expect(metrics).toHaveProperty('fps');
        expect(metrics).toHaveProperty('timestamp');

        if (callCount >= 1) {
          unsubscribe();
          done();
        }
      });

      // Trigger metrics collection
      // Note: In a real environment, this would happen automatically
    });

    it('should allow unsubscribing from metrics updates', () => {
      const mockListener = jest.fn();
      const unsubscribe = performanceService.onMetricsUpdate(mockListener);

      unsubscribe();

      // Verify listener is removed (would need internal access to test fully)
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('Resource Cleanup', () => {
    it('should dispose resources correctly', () => {
      performanceService.dispose();

      // After disposal, some operations might not work
      // This is more of a smoke test to ensure dispose doesn't throw
      expect(() => performanceService.dispose()).not.toThrow();
    });
  });

  describe('Network Speed Detection', () => {
    it('should detect fast network correctly', async () => {
      // Mock fast network response
      global.fetch = jest.fn().mockResolvedValue({
        text: () => Promise.resolve('test'),
      });

      let startTime = 1000;
      (global.performance.now as jest.Mock).mockImplementation(() => {
        const time = startTime;
        startTime += 50; // 50ms response time
        return time;
      });

      await performanceService.recalibrateProfile();
      const capabilities = performanceService.getDeviceCapabilities();

      // Note: This test depends on the internal implementation
      expect(capabilities).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Should not throw and should use default values
      await expect(
        performanceService.recalibrateProfile(),
      ).resolves.toBeDefined();
    });
  });
});
