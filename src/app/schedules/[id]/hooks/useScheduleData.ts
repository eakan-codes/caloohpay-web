'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { DateTime } from 'luxon';
import { OnCallPeriod, OnCallUser, OnCallPaymentsCalculator } from '@/lib/caloohpay';
import { scheduleDetailFetcher, type ScheduleResponse } from '@/lib/api/fetchers';
import type { User, ScheduleEntry } from '@/lib/types';
import type { UserSchedule } from '@/app/schedules/[id]/components/OnCallSchedule.types';

/**
 * Hook for fetching and processing schedule data from the API
 *
 * @remarks
 * - Handles API fetching using SWR with proper error handling
 * - Transforms raw PagerDuty schedule entries into UserSchedule format
 * - Calculates compensation using OnCallPaymentsCalculator
 * - Processes date ranges for month navigation
 * - Memoizes expensive transformations to prevent unnecessary recalculations
 *
 * @param scheduleId - The PagerDuty schedule ID
 * @param accessToken - The authentication token from the session
 * @param authMethod - The authentication method ('oauth' or 'api-token')
 * @param dateRange - Object with 'since' and 'until' ISO date strings
 *
 * @returns Object with {
 *   data: Raw schedule response data,
 *   userSchedules: Processed schedule data grouped by user,
 *   isLoading: Whether data is being fetched,
 *   error: Any error that occurred during fetching
 * }
 *
 * @example
 * ```tsx
 * const { userSchedules, isLoading, error } = useScheduleData(
 *   scheduleId,
 *   session.accessToken,
 *   session.authMethod,
 *   { since: '2025-01-01T00:00:00', until: '2025-01-31T23:59:59' }
 * );
 * ```
 */
export const useScheduleData = (
  scheduleId: string,
  accessToken: string | undefined,
  authMethod: string | undefined,
  dateRange: { since: string; until: string }
) => {
  // Construct API URL with date range
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (dateRange.since) params.append('since', dateRange.since);
    if (dateRange.until) params.append('until', dateRange.until);
    return `/api/schedules/${scheduleId}?${params.toString()}`;
  }, [scheduleId, dateRange]);

  // Fetch schedule data from API
  const { data, error, isLoading } = useSWR<ScheduleResponse>(
    accessToken ? [apiUrl, accessToken, authMethod] : null,
    scheduleDetailFetcher
  );

  // Group schedule entries by user and calculate compensation
  const userSchedules = useMemo(() => {
    if (!data?.schedule?.final_schedule?.rendered_schedule_entries) {
      return [];
    }

    const userMap = new Map<string, { user: User; entries: ScheduleEntry[] }>();

    data.schedule.final_schedule.rendered_schedule_entries.forEach((entry) => {
      const userId = entry.user.id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: entry.user,
          entries: [],
        });
      }
      userMap.get(userId)!.entries.push(entry);
    });

    return Array.from(userMap.values()).map((item) => {
      const sortedEntries = item.entries.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );

      // Create OnCallPeriod instances for all entries
      const onCallPeriods = sortedEntries.map(
        (entry) =>
          new OnCallPeriod(new Date(entry.start), new Date(entry.end), data.schedule.time_zone)
      );

      // Calculate details for each entry
      const calculator = new OnCallPaymentsCalculator();
      const entriesWithCompensation = sortedEntries.map((entry, index) => {
        const start = DateTime.fromISO(
          typeof entry.start === 'string' ? entry.start : entry.start.toISOString()
        );
        const end = DateTime.fromISO(
          typeof entry.end === 'string' ? entry.end : entry.end.toISOString()
        );
        const duration = end.diff(start, 'hours').hours;

        const period = onCallPeriods[index];
        const weekdayDays = period.numberOfOohWeekDays;
        const weekendDays = period.numberOfOohWeekends;

        // Calculate compensation using OnCallPaymentsCalculator
        const onCallUser = new OnCallUser(entry.user.id, entry.user.name || entry.user.summary, [
          period,
        ]);
        const compensation = calculator.calculateOnCallPayment(onCallUser);

        return {
          ...entry,
          duration,
          weekdayDays,
          weekendDays,
          compensation,
        };
      });

      const totalHours = entriesWithCompensation.reduce((sum, e) => sum + e.duration, 0);
      const totalWeekdays = entriesWithCompensation.reduce((sum, e) => sum + e.weekdayDays, 0);
      const totalWeekends = entriesWithCompensation.reduce((sum, e) => sum + e.weekendDays, 0);
      const totalCompensation = entriesWithCompensation.reduce((sum, e) => sum + e.compensation, 0);

      return {
        user: item.user,
        entries: entriesWithCompensation,
        totalHours,
        totalWeekdays,
        totalWeekends,
        totalCompensation,
      };
    });
  }, [data]);

  return {
    data,
    userSchedules,
    isLoading,
    error,
  };
};
