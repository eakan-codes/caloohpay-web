'use client';

import { useState, useCallback, useMemo } from 'react';
import { DateTime } from 'luxon';

/**
 * Hook for managing date range state and month navigation
 *
 * @remarks
 * - Provides state management for date range (since/until)
 * - Handles month navigation with callback functions
 * - Memoizes current month display string for UI rendering
 * - Initializes to current month on first render
 *
 * @returns Object with {
 *   dateRange: { since: ISO string, until: ISO string },
 *   currentMonthDisplay: Formatted month string (e.g. "January 2025"),
 *   handlePreviousMonth: Callback to navigate to previous month,
 *   handleNextMonth: Callback to navigate to next month
 * }
 *
 * @example
 * ```tsx
 * const { dateRange, currentMonthDisplay, handlePreviousMonth, handleNextMonth } = useDateRangeNavigation();
 * ```
 */
export const useDateRangeNavigation = () => {
  // Date range state - default to current month
  const [dateRange, setDateRange] = useState(() => {
    const now = DateTime.now();
    return {
      since: now.startOf('month').toISO(),
      until: now.endOf('month').toISO(),
    };
  });

  // Get current month display
  const currentMonthDisplay = useMemo(() => {
    const since = DateTime.fromISO(dateRange.since);
    return since.toFormat('MMMM yyyy');
  }, [dateRange.since]);

  // Navigate to previous month - wrapped in useCallback for stable reference
  const handlePreviousMonth = useCallback(() => {
    setDateRange((prev) => {
      const since = DateTime.fromISO(prev.since);
      const newSince = since.minus({ months: 1 });
      return {
        since: newSince.startOf('month').toISO() || '',
        until: newSince.endOf('month').toISO() || '',
      };
    });
  }, []);

  // Navigate to next month - wrapped in useCallback for stable reference
  const handleNextMonth = useCallback(() => {
    setDateRange((prev) => {
      const since = DateTime.fromISO(prev.since);
      const newSince = since.plus({ months: 1 });
      return {
        since: newSince.startOf('month').toISO() || '',
        until: newSince.endOf('month').toISO() || '',
      };
    });
  }, []);

  return {
    dateRange,
    currentMonthDisplay,
    handlePreviousMonth,
    handleNextMonth,
  };
};
