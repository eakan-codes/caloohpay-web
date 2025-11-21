/**
 * Utilities for processing PagerDuty schedule data
 */

import { OnCallPeriod, OnCallUser } from 'caloohpay/core';
import type { PagerDutySchedule, ScheduleEntry } from '@/lib/types';

/**
 * Extracts OnCallUser objects from a PagerDuty schedule
 */
export function extractOnCallUsers(schedule: PagerDutySchedule): OnCallUser[] {
  const userMap = new Map<string, { name: string; periods: OnCallPeriod[] }>();

  // Process each schedule entry
  for (const entry of schedule.final_schedule.rendered_schedule_entries) {
    const userId = entry.user.id;
    const userName = entry.user.summary || entry.user.name || 'Unknown User';

    // Create OnCallPeriod
    const start = typeof entry.start === 'string' ? new Date(entry.start) : entry.start;
    const end = typeof entry.end === 'string' ? new Date(entry.end) : entry.end;
    const period = new OnCallPeriod(start, end, schedule.time_zone);

    // Add to user's periods
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        name: userName,
        periods: [],
      });
    }

    userMap.get(userId)!.periods.push(period);
  }

  // Convert map to array of OnCallUser objects
  const users: OnCallUser[] = [];
  for (const [userId, userData] of userMap.entries()) {
    users.push(new OnCallUser(userId, userData.name, userData.periods));
  }

  return users;
}

/**
 * Consolidates multiple schedule entries for the same user
 */
export function consolidateUserPeriods(
  entries: ScheduleEntry[],
  timezone: string
): Map<string, OnCallPeriod[]> {
  const userPeriods = new Map<string, OnCallPeriod[]>();

  for (const entry of entries) {
    const userId = entry.user.id;
    const start = typeof entry.start === 'string' ? new Date(entry.start) : entry.start;
    const end = typeof entry.end === 'string' ? new Date(entry.end) : entry.end;
    const period = new OnCallPeriod(start, end, timezone);

    if (!userPeriods.has(userId)) {
      userPeriods.set(userId, []);
    }

    userPeriods.get(userId)!.push(period);
  }

  return userPeriods;
}

/**
 * Merges on-call users from multiple schedules
 */
export function mergeOnCallUsers(users: OnCallUser[]): OnCallUser[] {
  const userMap = new Map<string, { name: string; periods: OnCallPeriod[] }>();

  for (const user of users) {
    if (!userMap.has(user.id)) {
      userMap.set(user.id, {
        name: user.name,
        periods: [...user.onCallPeriods],
      });
    } else {
      // Merge periods
      const existing = userMap.get(user.id)!;
      existing.periods.push(...user.onCallPeriods);
    }
  }

  // Convert back to OnCallUser objects
  const merged: OnCallUser[] = [];
  for (const [userId, userData] of userMap.entries()) {
    merged.push(new OnCallUser(userId, userData.name, userData.periods));
  }

  return merged;
}

/**
 * Filters schedule entries by date range
 */
export function filterScheduleEntriesByDateRange(
  entries: ScheduleEntry[],
  since: Date,
  until: Date
): ScheduleEntry[] {
  return entries.filter((entry) => {
    const start = typeof entry.start === 'string' ? new Date(entry.start) : entry.start;
    const end = typeof entry.end === 'string' ? new Date(entry.end) : entry.end;

    // Entry overlaps with the date range
    return start < until && end > since;
  });
}

/**
 * Sorts schedule entries by start time
 */
export function sortScheduleEntries(entries: ScheduleEntry[]): ScheduleEntry[] {
  return [...entries].sort((a, b) => {
    const aStart = typeof a.start === 'string' ? new Date(a.start) : a.start;
    const bStart = typeof b.start === 'string' ? new Date(b.start) : b.start;
    return aStart.getTime() - bStart.getTime();
  });
}
