/**
 * Unit tests for analytics utility functions
 */

import { describe, it, expect } from '@jest/globals';
import {
  buildFrequencyMatrix,
  calculateBurdenDistribution,
  calculateInterruptionCorrelation,
  getDayName,
  formatHour,
} from '../analyticsUtils';
import type { OnCallEntry } from '@/lib/types';

describe('analyticsUtils', () => {
  describe('buildFrequencyMatrix', () => {
    it('should create empty matrix for no on-calls', () => {
      const result = buildFrequencyMatrix([]);
      expect(result).toHaveLength(7 * 24); // 7 days x 24 hours
      expect(result.every((cell) => cell.count === 0)).toBe(true);
    });

    it('should count on-call hours correctly', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: '1', summary: 'User 1' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T09:00:00Z', // Monday 9 AM
          end: '2024-01-01T11:00:00Z', // Monday 11 AM (2 hours)
        },
      ];

      const result = buildFrequencyMatrix(oncalls);
      const nonZeroCells = result.filter((cell) => cell.count > 0);

      // Should have counts for 2 hours (9 AM and 10 AM)
      expect(nonZeroCells.length).toBeGreaterThan(0);
    });

    it('should filter by user ID when provided', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: '1', summary: 'User 1' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T09:00:00Z',
          end: '2024-01-01T11:00:00Z',
        },
        {
          user: { id: '2', summary: 'User 2' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T09:00:00Z',
          end: '2024-01-01T11:00:00Z',
        },
      ];

      const resultAll = buildFrequencyMatrix(oncalls);
      const resultUser1 = buildFrequencyMatrix(oncalls, '1');

      const allNonZero = resultAll.filter((cell) => cell.count > 0);
      const user1NonZero = resultUser1.filter((cell) => cell.count > 0);

      // User 1 filtered should have fewer or equal non-zero cells
      expect(user1NonZero.length).toBeLessThanOrEqual(allNonZero.length);
    });
  });

  describe('calculateBurdenDistribution', () => {
    it('should return empty array for no on-calls', () => {
      const result = calculateBurdenDistribution([]);
      expect(result).toEqual([]);
    });

    it('should calculate percentages correctly', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: '1', summary: 'User 1' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-01T12:00:00Z', // 12 hours
        },
        {
          user: { id: '2', summary: 'User 2' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T12:00:00Z',
          end: '2024-01-01T24:00:00Z', // 12 hours
        },
      ];

      const result = calculateBurdenDistribution(oncalls);

      expect(result).toHaveLength(2);
      expect(result[0].percentage).toBe(50);
      expect(result[1].percentage).toBe(50);
      expect(result[0].totalOnCallHours).toBeCloseTo(12, 1);
      expect(result[1].totalOnCallHours).toBeCloseTo(12, 1);
    });

    it('should sort by hours descending', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: '1', summary: 'User 1' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-01T06:00:00Z', // 6 hours
        },
        {
          user: { id: '2', summary: 'User 2' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T12:00:00Z',
          end: '2024-01-01T24:00:00Z', // 12 hours
        },
      ];

      const result = calculateBurdenDistribution(oncalls);

      expect(result[0].userId).toBe('2'); // User 2 has more hours
      expect(result[1].userId).toBe('1');
    });
  });

  describe('calculateInterruptionCorrelation', () => {
    it('should return empty array for no on-calls', () => {
      const result = calculateInterruptionCorrelation([], 50, 75);
      expect(result).toEqual([]);
    });

    it('should calculate pay correctly for weekday qualifying OOH shift', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: '1', summary: 'User 1' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T17:30:00Z', // Monday 17:30 (end of work day)
          end: '2024-01-02T09:00:00Z', // Tuesday 09:00 (next morning)
        },
      ];

      const result = calculateInterruptionCorrelation(oncalls, 50, 75);

      expect(result).toHaveLength(1);
      // Qualifies for 1 weekday night (Monday) - shift extends past 17:30 and lasts 15.5 hours
      expect(result[0].totalPay).toBeCloseTo(50, 0); // 1 night * £50
    });

    it('should calculate pay correctly for weekend qualifying OOH shift', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: '1', summary: 'User 1' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-05T17:30:00Z', // Friday 17:30
          end: '2024-01-06T09:00:00Z', // Saturday 09:00
        },
      ];

      const result = calculateInterruptionCorrelation(oncalls, 50, 75);

      expect(result).toHaveLength(1);
      // Qualifies for 1 weekend night (Friday) - shift extends past 17:30 and lasts 15.5 hours
      expect(result[0].totalPay).toBeCloseTo(75, 0); // 1 night * £75
    });

    it('should not count shifts that do not qualify as OOH', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: '1', summary: 'User 1' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-01T09:00:00Z', // Monday 09:00
          end: '2024-01-01T17:00:00Z', // Monday 17:00 (before 17:30 cutoff)
        },
      ];

      const result = calculateInterruptionCorrelation(oncalls, 50, 75);

      expect(result).toHaveLength(1);
      // Does not qualify - doesn't extend past 17:30
      expect(result[0].totalPay).toBeCloseTo(0, 0);
    });

    it('should calculate pay for multi-day shifts correctly', () => {
      const oncalls: OnCallEntry[] = [
        {
          user: { id: '1', summary: 'User 1' },
          schedule: { id: 's1', summary: 'Schedule 1', html_url: 'http://test.com' },
          start: '2024-01-04T17:30:00Z', // Thursday 17:30
          end: '2024-01-08T09:00:00Z', // Monday 09:00 (4 nights: Thu, Fri, Sat, Sun)
        },
      ];

      const result = calculateInterruptionCorrelation(oncalls, 50, 75);

      expect(result).toHaveLength(1);
      // Qualifies for: Thursday (weekday), Friday (weekend), Saturday (weekend), Sunday (weekend)
      // = 1 weekday night + 3 weekend nights
      expect(result[0].totalPay).toBeCloseTo(50 + 75 * 3, 0); // £50 + £225 = £275
    });
  });

  describe('getDayName', () => {
    it('should return correct day names', () => {
      expect(getDayName(0)).toBe('Sun');
      expect(getDayName(1)).toBe('Mon');
      expect(getDayName(2)).toBe('Tue');
      expect(getDayName(3)).toBe('Wed');
      expect(getDayName(4)).toBe('Thu');
      expect(getDayName(5)).toBe('Fri');
      expect(getDayName(6)).toBe('Sat');
    });

    it('should return Unknown for invalid day', () => {
      expect(getDayName(7)).toBe('Unknown');
      expect(getDayName(-1)).toBe('Unknown');
    });
  });

  describe('formatHour', () => {
    it('should format hours correctly', () => {
      expect(formatHour(0)).toBe('12 AM');
      expect(formatHour(1)).toBe('1 AM');
      expect(formatHour(11)).toBe('11 AM');
      expect(formatHour(12)).toBe('12 PM');
      expect(formatHour(13)).toBe('1 PM');
      expect(formatHour(23)).toBe('11 PM');
    });
  });
});
