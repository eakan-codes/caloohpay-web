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
  // Map of "day-hour" -> Map<userId, { name: string, count: number }>
  const frequencyMap = new Map<string, Map<string, { name: string; count: number }>>();

  // Filter by user if specified
  const filteredOncalls = userId ? oncalls.filter((oncall) => oncall.user.id === userId) : oncalls;

  filteredOncalls.forEach((oncall) => {
    const start = DateTime.fromISO(oncall.start);
    const end = DateTime.fromISO(oncall.end);
    const userName = oncall.user.summary || oncall.user.name || 'Unknown';
    const uid = oncall.user.id;

    // Iterate through each hour in the on-call period
    let current = start;
    while (current < end) {
      const dayOfWeek = current.weekday % 7; // Convert to 0-6 (Sunday-Saturday)
      // Luxon's weekday: 1=Mon...7=Sun. %7 gives 1=Mon...0=Sun.
      // The current code assumes 0-6 is Sun-Sat based on getDayName implementation which usually expects 0=Sun.
      // Let's stick to existing logic for dayOfWeek to avoid regression, assumming getDayName handles it.

      const hour = current.hour;
      const key = `${dayOfWeek}-${hour}`;

      if (!frequencyMap.has(key)) {
        frequencyMap.set(key, new Map());
      }
      const slotMap = frequencyMap.get(key)!;

      const userData = slotMap.get(uid) || { name: userName, count: 0 };
      userData.count++;
      slotMap.set(uid, userData);

      current = current.plus({ hours: 1 });
    }
  });

  // Convert map to array of cells
  const cells: FrequencyMatrixCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      const slotMap = frequencyMap.get(key);

      let totalCount = 0;
      const usersList: { name: string; count: number }[] = [];

      if (slotMap) {
        slotMap.forEach((data) => {
          totalCount += data.count;
          usersList.push(data);
        });
        // Sort users by count descending
        usersList.sort((a, b) => b.count - a.count);
      }

      cells.push({
        dayOfWeek: day,
        hour,
        count: totalCount,
        users: usersList.length > 0 ? usersList : undefined,
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
 * Uses incident data from PagerDuty with time-to-resolve as interruption factor
 */
export function calculateInterruptionCorrelation(
  oncalls: OnCallEntry[],
  weekdayRate: number,
  weekendRate: number,
  incidents?: import('@/lib/types').Incident[]
): UserInterruptionData[] {
  const userDataMap = new Map<
    string,
    {
      name: string;
      hours: number;
      weekdayNights: number;
      weekendNights: number;
      interruptionScore: number;
    }
  >();

  // Constants for OOH qualification (matching caloohpay package)
  const END_OF_WORK_HOUR = 17.5; // 17:30
  const MIN_SHIFT_HOURS = 6;

  oncalls.forEach((oncall) => {
    const start = DateTime.fromISO(oncall.start);
    const end = DateTime.fromISO(oncall.end);
    const hours = end.diff(start, 'hours').hours;

    const userId = oncall.user.id;
    const userName = oncall.user.summary || oncall.user.name || 'Unknown';

    // Count qualifying OOH nights (days that qualify for payment)
    let weekdayNights = 0;
    let weekendNights = 0;

    // Check if shift qualifies as OOH (at least 6 hours and spans multiple days or extends past work hours)
    if (hours >= MIN_SHIFT_HOURS) {
      // Iterate through each day in the on-call period
      let current = start.startOf('day');
      const endDay = end.startOf('day');

      while (current <= endDay) {
        const dayStart = current;
        const dayEnd = current.set({ hour: 23, minute: 59, second: 59 });
        const endOfWorkDay = current.set({
          hour: Math.floor(END_OF_WORK_HOUR),
          minute: (END_OF_WORK_HOUR % 1) * 60,
        });

        // Check if on-call period covers any time after work hours on this day
        const shiftStart = start > dayStart ? start : dayStart;
        const shiftEnd = end < dayEnd ? end : dayEnd;

        // Day qualifies if the shift extends past end of work day (17:30)
        if (shiftEnd > endOfWorkDay && shiftStart < dayEnd) {
          // Luxon weekday: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
          const weekday = current.weekday;
          // Weekend = Friday (5), Saturday (6), Sunday (7)
          const isWeekend = weekday === 5 || weekday === 6 || weekday === 7;

          if (isWeekend) {
            weekendNights++;
          } else {
            weekdayNights++;
          }
        }

        current = current.plus({ days: 1 });
      }
    }

    const existing = userDataMap.get(userId);
    if (existing) {
      existing.hours += hours;
      existing.weekdayNights += weekdayNights;
      existing.weekendNights += weekendNights;
    } else {
      userDataMap.set(userId, {
        name: userName,
        hours,
        weekdayNights,
        weekendNights,
        interruptionScore: 0,
      });
    }
  });

  // Calculate interruption scores from incidents if provided
  if (incidents && incidents.length > 0) {
    incidents.forEach((incident) => {
      // Find the user this incident was assigned to
      const assignment = incident.assignments?.[0];
      if (!assignment) return;

      const userId = assignment.assignee.id;
      const userData = userDataMap.get(userId);
      if (!userData) return;

      // Calculate time to resolve in hours
      if (incident.resolved_at && incident.created_at) {
        const created = DateTime.fromISO(incident.created_at);
        const resolved = DateTime.fromISO(incident.resolved_at);
        const hoursToResolve = resolved.diff(created, 'hours').hours;

        // Apply interruption factor based on time to resolve
        // Short incident (< 12 hours): factor 0.5 (half day interruption)
        // Medium incident (12-24 hours): factor 1.0 (full day interruption)
        // Long incident (24-72 hours): factor 2.0 (multiple day interruption)
        // Very long incident (> 72 hours): factor 3.0 (severe interruption)
        let interruptionFactor = 1.0;
        if (hoursToResolve < 12) {
          interruptionFactor = 0.5;
        } else if (hoursToResolve <= 24) {
          interruptionFactor = 1.0;
        } else if (hoursToResolve <= 72) {
          interruptionFactor = 2.0;
        } else {
          interruptionFactor = 3.0;
        }

        userData.interruptionScore += interruptionFactor;
      } else {
        // If no resolved_at, count as 1 interruption
        userData.interruptionScore += 1;
      }
    });
  }

  // Convert to array with payment calculated per night
  const correlation: UserInterruptionData[] = [];
  userDataMap.forEach((data, userId) => {
    const pay = data.weekdayNights * weekdayRate + data.weekendNights * weekendRate;

    // Use interruption score if available, otherwise use hours as proxy
    const interruptions =
      data.interruptionScore > 0 ? Math.round(data.interruptionScore * 10) / 10 : data.hours;

    correlation.push({
      userId,
      userName: data.name,
      totalInterruptions: interruptions,
      totalPay: Math.round(pay * 100) / 100,
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
