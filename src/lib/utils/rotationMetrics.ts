/**
 * Utility function to calculate rotation metrics for visualizing on-call cadence
 * Transforms PagerDuty on-call shifts into intervals of rest and shift patterns
 */

import { DateTime } from 'luxon';
import type { OnCallEntry } from '@/lib/types';

export interface ShiftInterval {
  start: string;
  end: string;
  durationWeeks: number;
}

export interface GapInterval {
  gapDurationWeeks: number;
}

export interface UserRotationMetrics {
  userId: string;
  userName: string;
  shiftHistory: ShiftInterval[];
  gapHistory: GapInterval[];
  averageRest: number;
}

export interface RotationMetrics {
  [userId: string]: UserRotationMetrics;
}

/**
 * Calculates rotation metrics for each user from their on-call shifts
 *
 * @param oncalls - Array of on-call entries from PagerDuty
 * @returns Object mapping user IDs to their rotation metrics
 */
export function getRotationMetrics(oncalls: OnCallEntry[]): RotationMetrics {
  // Group on-calls by user
  const userOncalls = new Map<string, OnCallEntry[]>();

  oncalls.forEach((oncall) => {
    const userId = oncall.user.id;
    if (!userOncalls.has(userId)) {
      userOncalls.set(userId, []);
    }
    userOncalls.get(userId)!.push(oncall);
  });

  const metrics: RotationMetrics = {};

  // Process each user's shifts
  userOncalls.forEach((shifts, userId) => {
    // Sort shifts by start time
    const sortedShifts = [...shifts].sort((a, b) => {
      const aStart = DateTime.fromISO(a.start);
      const bStart = DateTime.fromISO(b.start);
      return aStart.toMillis() - bStart.toMillis();
    });

    const userName = sortedShifts[0]?.user.summary || sortedShifts[0]?.user.name || 'Unknown';
    const shiftHistory: ShiftInterval[] = [];
    const gapHistory: GapInterval[] = [];

    // Calculate shift durations and gaps
    sortedShifts.forEach((shift, index) => {
      const start = DateTime.fromISO(shift.start);
      const end = DateTime.fromISO(shift.end);
      const durationDays = end.diff(start, 'days').days;
      const durationWeeks = durationDays / 7;

      shiftHistory.push({
        start: shift.start,
        end: shift.end,
        durationWeeks,
      });

      // Calculate gap to next shift (rest interval)
      if (index < sortedShifts.length - 1) {
        const nextShift = sortedShifts[index + 1];
        const nextStart = DateTime.fromISO(nextShift.start);
        const gapDays = nextStart.diff(end, 'days').days;
        const gapWeeks = gapDays / 7;

        gapHistory.push({
          gapDurationWeeks: gapWeeks,
        });
      }
    });

    // Calculate average rest
    const averageRest =
      gapHistory.length > 0
        ? gapHistory.reduce((sum, gap) => sum + gap.gapDurationWeeks, 0) / gapHistory.length
        : 0;

    metrics[userId] = {
      userId,
      userName,
      shiftHistory,
      gapHistory,
      averageRest,
    };
  });

  return metrics;
}
