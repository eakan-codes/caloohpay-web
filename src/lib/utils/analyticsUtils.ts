/**
 * Utility functions for analytics data transformation
 */

import { DateTime } from 'luxon';
import type {
  OnCallEntry,
  FrequencyMatrixCell,
  UserBurdenData,
  UserInterruptionData,
} from '@/lib/types';

/**
 * Transforms on-call entries into frequency matrix data
 * Creates a 7x24 grid showing when users are on-call
 */
export function buildFrequencyMatrix(
  oncalls: OnCallEntry[],
  userId?: string
): FrequencyMatrixCell[] {
  const frequencyMap = new Map<string, number>();

  // Filter by user if specified
  const filteredOncalls = userId ? oncalls.filter((oncall) => oncall.user.id === userId) : oncalls;

  filteredOncalls.forEach((oncall) => {
    const start = DateTime.fromISO(oncall.start);
    const end = DateTime.fromISO(oncall.end);

    // Iterate through each hour in the on-call period
    let current = start;
    while (current < end) {
      const dayOfWeek = current.weekday % 7; // Convert to 0-6 (Sunday-Saturday)
      const hour = current.hour;
      const key = `${dayOfWeek}-${hour}`;

      frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
      current = current.plus({ hours: 1 });
    }
  });

  // Convert map to array of cells
  const cells: FrequencyMatrixCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      cells.push({
        dayOfWeek: day,
        hour,
        count: frequencyMap.get(key) || 0,
      });
    }
  }

  return cells;
}

/**
 * Calculates burden distribution from on-call entries
 * Shows percentage of total on-call time per user
 */
export function calculateBurdenDistribution(oncalls: OnCallEntry[]): UserBurdenData[] {
  const userHoursMap = new Map<string, { name: string; hours: number }>();
  let totalHours = 0;

  oncalls.forEach((oncall) => {
    const start = DateTime.fromISO(oncall.start);
    const end = DateTime.fromISO(oncall.end);
    const hours = end.diff(start, 'hours').hours;

    const userId = oncall.user.id;
    const userName = oncall.user.summary || oncall.user.name || 'Unknown';

    const existing = userHoursMap.get(userId);
    if (existing) {
      existing.hours += hours;
    } else {
      userHoursMap.set(userId, { name: userName, hours });
    }

    totalHours += hours;
  });

  // Convert to array with percentages
  const distribution: UserBurdenData[] = [];
  userHoursMap.forEach((data, userId) => {
    distribution.push({
      userId,
      userName: data.name,
      totalOnCallHours: Math.round(data.hours * 100) / 100,
      percentage: totalHours > 0 ? Math.round((data.hours / totalHours) * 10000) / 100 : 0,
    });
  });

  // Sort by hours descending
  distribution.sort((a, b) => b.totalOnCallHours - a.totalOnCallHours);

  return distribution;
}

/**
 * Transforms on-call data and payment info into interruption correlation data
 * For MVP, we'll use on-call hours as a proxy for interruptions
 */
export function calculateInterruptionCorrelation(
  oncalls: OnCallEntry[],
  weekdayRate: number,
  weekendRate: number
): UserInterruptionData[] {
  const userDataMap = new Map<string, { name: string; hours: number; pay: number }>();

  oncalls.forEach((oncall) => {
    const start = DateTime.fromISO(oncall.start);
    const end = DateTime.fromISO(oncall.end);
    const hours = end.diff(start, 'hours').hours;

    // Simple pay calculation based on day of week
    // Weekend = Friday (5), Saturday (6), Sunday (0)
    const dayOfWeek = start.weekday % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const pay = isWeekend ? hours * weekendRate : hours * weekdayRate;

    const userId = oncall.user.id;
    const userName = oncall.user.summary || oncall.user.name || 'Unknown';

    const existing = userDataMap.get(userId);
    if (existing) {
      existing.hours += hours;
      existing.pay += pay;
    } else {
      userDataMap.set(userId, { name: userName, hours, pay });
    }
  });

  // Convert to array
  const correlation: UserInterruptionData[] = [];
  userDataMap.forEach((data, userId) => {
    correlation.push({
      userId,
      userName: data.name,
      totalInterruptions: Math.round(data.hours), // Using hours as proxy for now
      totalPay: Math.round(data.pay * 100) / 100,
    });
  });

  return correlation;
}

/**
 * Gets the day name for a day of week number
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek] || 'Unknown';
}

/**
 * Formats hour in 24h format to 12h format
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}
