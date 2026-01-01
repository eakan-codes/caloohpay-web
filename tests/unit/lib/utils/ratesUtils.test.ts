/**
 * Tests for rate management utilities
 */

import { getCurrentRates, getDefaultRates, type PaymentRates } from '@/lib/utils/ratesUtils';
import { getSettingsStore } from '@/lib/stores';
import { PAYMENT_RATES } from '@/lib/constants';

// Mock the settings store
jest.mock('@/lib/stores', () => ({
  getSettingsStore: {
    getState: jest.fn(),
  },
}));

describe('ratesUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentRates', () => {
    it('should return rates from settings store when available', () => {
      const mockRates = { weekdayRate: 60, weekendRate: 85 };
      (getSettingsStore.getState as jest.Mock).mockReturnValue(mockRates);

      const rates = getCurrentRates();

      expect(rates).toEqual(mockRates);
      expect(getSettingsStore.getState).toHaveBeenCalledTimes(1);
    });

    it('should return default rates when store access fails', () => {
      (getSettingsStore.getState as jest.Mock).mockImplementation(() => {
        throw new Error('Store not initialized');
      });

      const rates = getCurrentRates();

      expect(rates).toEqual({
        weekdayRate: PAYMENT_RATES.WEEKDAY,
        weekendRate: PAYMENT_RATES.WEEKEND,
      });
    });

    it('should return valid PaymentRates interface', () => {
      (getSettingsStore.getState as jest.Mock).mockReturnValue({
        weekdayRate: 55,
        weekendRate: 80,
      });

      const rates = getCurrentRates();

      expect(rates).toHaveProperty('weekdayRate');
      expect(rates).toHaveProperty('weekendRate');
      expect(typeof rates.weekdayRate).toBe('number');
      expect(typeof rates.weekendRate).toBe('number');
    });
  });

  describe('getDefaultRates', () => {
    it('should return default rates from constants', () => {
      const rates = getDefaultRates();

      expect(rates).toEqual({
        weekdayRate: PAYMENT_RATES.WEEKDAY,
        weekendRate: PAYMENT_RATES.WEEKEND,
      });
    });

    it('should return consistent values across multiple calls', () => {
      const rates1 = getDefaultRates();
      const rates2 = getDefaultRates();

      expect(rates1).toEqual(rates2);
    });

    it('should match PAYMENT_RATES constants', () => {
      const rates = getDefaultRates();

      expect(rates.weekdayRate).toBe(50);
      expect(rates.weekendRate).toBe(75);
    });
  });
});
