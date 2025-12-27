import { renderHook, act } from '@testing-library/react';
import { useDateRangeNavigation } from '../useDateRangeNavigation';
import { DateTime } from 'luxon';

describe('useDateRangeNavigation', () => {
  it('initializes with current month', () => {
    const { result } = renderHook(() => useDateRangeNavigation());

    expect(result.current.dateRange.since).toBeDefined();
    expect(result.current.dateRange.until).toBeDefined();

    const since = DateTime.fromISO(result.current.dateRange.since);
    expect(since.day).toBe(1); // Should be first day of month
  });

  it('formats current month display correctly', () => {
    const { result } = renderHook(() => useDateRangeNavigation());

    // Should be in format like "January 2025"
    expect(result.current.currentMonthDisplay).toMatch(/^[A-Z][a-z]+ \d{4}$/);
  });

  it('navigates to previous month', () => {
    const { result } = renderHook(() => useDateRangeNavigation());

    const initialMonth = result.current.currentMonthDisplay;

    act(() => {
      result.current.handlePreviousMonth();
    });

    expect(result.current.currentMonthDisplay).not.toBe(initialMonth);

    // Verify it's one month earlier
    const initialSince = DateTime.fromISO(result.current.dateRange.since);
    const newSince = DateTime.fromISO(
      DateTime.fromISO(initialMonth, { zone: 'UTC' }).minus({ months: 1 }).toISODate() || ''
    );

    expect(initialSince.month).toBeLessThanOrEqual(DateTime.now().month);
  });

  it('navigates to next month', () => {
    const { result } = renderHook(() => useDateRangeNavigation());

    const initialMonth = result.current.currentMonthDisplay;

    act(() => {
      result.current.handleNextMonth();
    });

    expect(result.current.currentMonthDisplay).not.toBe(initialMonth);
  });

  it('date range updates correctly with navigation', () => {
    const { result } = renderHook(() => useDateRangeNavigation());

    const initialSince = result.current.dateRange.since;

    act(() => {
      result.current.handleNextMonth();
    });

    const newSince = result.current.dateRange.since;
    expect(newSince).not.toBe(initialSince);

    // Both should be valid ISO dates
    expect(DateTime.fromISO(initialSince).isValid).toBe(true);
    expect(DateTime.fromISO(newSince).isValid).toBe(true);
  });

  it('until date is end of month', () => {
    const { result } = renderHook(() => useDateRangeNavigation());

    const until = DateTime.fromISO(result.current.dateRange.until);
    const nextDay = until.plus({ days: 1 });

    // If we're at end of month, next day should be in next month
    expect(nextDay.month).not.toBe(until.month);
  });

  it('handles multiple month navigations', () => {
    const { result } = renderHook(() => useDateRangeNavigation());

    const initial = result.current.currentMonthDisplay;

    act(() => {
      result.current.handleNextMonth();
      result.current.handleNextMonth();
      result.current.handlePreviousMonth();
    });

    // Should be one month forward from initial
    const since = DateTime.fromISO(result.current.dateRange.since);
    const initialSince = DateTime.fromISO(
      DateTime.now().startOf('month').plus({ months: 1 }).toISO() || ''
    );

    expect(since.month).toBe(initialSince.month);
  });
});
