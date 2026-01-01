/**
 * Centralized rate management utilities
 *
 * This module provides a single source of truth for retrieving payment rates,
 * ensuring that user-customized settings from the store are consistently used
 * across all compensation calculations throughout the application.
 */

import { getSettingsStore } from '@/lib/stores';
import { PAYMENT_RATES } from '@/lib/constants';

/**
 * Interface for payment rates
 */
export interface PaymentRates {
  weekdayRate: number;
  weekendRate: number;
}

/**
 * Gets the current payment rates from user settings or defaults
 *
 * @returns Payment rates object with weekday and weekend rates
 *
 * @remarks
 * This function provides a centralized way to retrieve payment rates.
 * It first checks the user's settings store for customized rates,
 * falling back to application defaults if not available.
 *
 * Use this function instead of directly accessing PAYMENT_RATES constants
 * to ensure user-customized rates are respected.
 *
 * @example
 * ```typescript
 * const rates = getCurrentRates();
 * const calculator = new OnCallPaymentsCalculator(rates.weekdayRate, rates.weekendRate);
 * ```
 */
export function getCurrentRates(): PaymentRates {
  // Try to get rates from user settings store
  try {
    const settings = getSettingsStore.getState();
    return {
      weekdayRate: settings.weekdayRate,
      weekendRate: settings.weekendRate,
    };
  } catch (error) {
    // Fallback to default rates if store access fails
    console.warn('Failed to retrieve rates from settings store, using defaults:', error);
    return {
      weekdayRate: PAYMENT_RATES.WEEKDAY,
      weekendRate: PAYMENT_RATES.WEEKEND,
    };
  }
}

/**
 * Gets the default payment rates from application constants
 *
 * @returns Default payment rates
 *
 * @remarks
 * Use this when you explicitly need the default rates,
 * for example in settings UI to show "Restore Defaults" values.
 */
export function getDefaultRates(): PaymentRates {
  return {
    weekdayRate: PAYMENT_RATES.WEEKDAY,
    weekendRate: PAYMENT_RATES.WEEKEND,
  };
}
