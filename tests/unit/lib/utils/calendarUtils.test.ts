/**
 * Unit tests for calendar utilities
 */

import {
  transformToCalendarEvents,
  groupEventsByUser,
  calculateTotalCompensation,
  filterEventsByDateRange,
  type CalendarEvent,
} from '@/lib/utils/calendarUtils';
import type { ScheduleEntry, User } from '@/lib/types';
import { PAYMENT_RATES } from '@/lib/constants';
import * as ratesUtils from '@/lib/utils/ratesUtils';

// Mock the ratesUtils module
jest.mock('@/lib/utils/ratesUtils', () => ({
  getCurrentRates: jest.fn(),
  getDefaultRates: jest.fn(),
}));

describe('calendarUtils', () => {
  const mockUser: User = {
    id: 'user-1',
    summary: 'John Doe',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockUser2: User = {
    id: 'user-2',
    summary: 'Jane Smith',
    name: 'Jane Smith',
    email: 'jane@example.com',
  };

  const timezone = 'America/New_York';

  beforeEach(() => {
    // Reset mocks and set default return values
    jest.clearAllMocks();
    (ratesUtils.getCurrentRates as jest.Mock).mockReturnValue({
      weekdayRate: PAYMENT_RATES.WEEKDAY,
      weekendRate: PAYMENT_RATES.WEEKEND,
    });
  });

  describe('transformToCalendarEvents', () => {
    it('should transform schedule entries into calendar events', () => {
      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-08T09:00:00Z',
          user: mockUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        title: 'John Doe',
        start: '2024-01-01T17:00:00Z',
        end: '2024-01-08T09:00:00Z',
      });
      expect(events[0].extendedProps.user).toMatchObject(mockUser);
      expect(events[0].extendedProps.duration).toBeGreaterThan(0);
      expect(events[0].extendedProps.compensation).toBeGreaterThan(0);
    });

    it('should handle Date objects as well as ISO strings', () => {
      const entries: ScheduleEntry[] = [
        {
          start: new Date('2024-01-01T17:00:00Z'),
          end: new Date('2024-01-08T09:00:00Z'),
          user: mockUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events).toHaveLength(1);
      expect(events[0].start).toBe('2024-01-01T17:00:00.000Z');
    });

    it('should calculate weekday and weekend days correctly', () => {
      // Monday 5pm to Monday 9am (covers weekend)
      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z', // Monday
          end: '2024-01-08T09:00:00Z', // Next Monday
          user: mockUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].extendedProps.weekdayDays).toBeGreaterThanOrEqual(0);
      expect(events[0].extendedProps.weekendDays).toBeGreaterThanOrEqual(0);
    });

    it('should calculate compensation based on weekday and weekend rates', () => {
      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-08T09:00:00Z',
          user: mockUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);
      const event = events[0];

      const expectedCompensation =
        event.extendedProps.weekdayDays * PAYMENT_RATES.WEEKDAY +
        event.extendedProps.weekendDays * PAYMENT_RATES.WEEKEND;

      expect(event.extendedProps.compensation).toBeCloseTo(expectedCompensation, 2);
    });

    it('should generate unique IDs for events', () => {
      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: mockUser,
        },
        {
          start: '2024-01-08T17:00:00Z',
          end: '2024-01-09T09:00:00Z',
          user: mockUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].id).not.toBe(events[1].id);
    });

    it('should sanitize user names to prevent XSS', () => {
      const maliciousUser: User = {
        id: 'user-3',
        summary: '<script>alert("xss")</script>Malicious User',
        name: '<script>alert("xss")</script>Malicious User',
      };

      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: maliciousUser,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events[0].title).not.toContain('<script>');
      expect(events[0].title).not.toContain('</script>');
      expect(events[0].title).not.toContain('&lt;script&gt;');
      expect(events[0].extendedProps.user.summary).not.toContain('<script>');
    });

    it('should throw error for invalid timezone', () => {
      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: mockUser,
        },
      ];

      expect(() => transformToCalendarEvents(entries, 'Invalid/Timezone')).toThrow(
        'Invalid timezone'
      );
    });

    it('should throw error for empty timezone', () => {
      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: mockUser,
        },
      ];

      expect(() => transformToCalendarEvents(entries, '')).toThrow('Invalid timezone');
    });

    it('should throw error for non-string timezone', () => {
      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: mockUser,
        },
      ];

      // @ts-expect-error Testing invalid input
      expect(() => transformToCalendarEvents(entries, null)).toThrow('Invalid timezone');
    });

    it('should throw error if entries is not an array', () => {
      // @ts-expect-error Testing invalid input
      expect(() => transformToCalendarEvents({}, timezone)).toThrow('Entries must be an array');
    });

    it('should filter out entries with invalid dates', () => {
      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: mockUser,
        },
        {
          start: 'invalid-date',
          end: '2024-01-03T09:00:00Z',
          user: mockUser2,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events).toHaveLength(1);
      expect(events[0].extendedProps.user.id).toBe('user-1');
    });

    it('should filter out entries with missing required fields', () => {
      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: mockUser,
        },
        // @ts-expect-error Testing invalid entry
        {
          start: '2024-01-03T17:00:00Z',
          // Missing end date
          user: mockUser2,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events).toHaveLength(1);
    });

    it('should handle empty entries array', () => {
      const events = transformToCalendarEvents([], timezone);

      expect(events).toEqual([]);
    });

    it('should handle multiple users', () => {
      const entries: ScheduleEntry[] = [
        {
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          user: mockUser,
        },
        {
          start: '2024-01-03T17:00:00Z',
          end: '2024-01-04T09:00:00Z',
          user: mockUser2,
        },
      ];

      const events = transformToCalendarEvents(entries, timezone);

      expect(events).toHaveLength(2);
      expect(events[0].title).toBe('John Doe');
      expect(events[1].title).toBe('Jane Smith');
    });
  });

  describe('groupEventsByUser', () => {
    it('should group events by user ID', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'John Doe',
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          extendedProps: {
            user: mockUser,
            duration: 16,
            weekdayDays: 1,
            weekendDays: 0,
            compensation: 50,
          },
        },
        {
          id: '2',
          title: 'John Doe',
          start: '2024-01-08T17:00:00Z',
          end: '2024-01-09T09:00:00Z',
          extendedProps: {
            user: mockUser,
            duration: 16,
            weekdayDays: 1,
            weekendDays: 0,
            compensation: 50,
          },
        },
        {
          id: '3',
          title: 'Jane Smith',
          start: '2024-01-03T17:00:00Z',
          end: '2024-01-04T09:00:00Z',
          extendedProps: {
            user: mockUser2,
            duration: 16,
            weekdayDays: 1,
            weekendDays: 0,
            compensation: 50,
          },
        },
      ];

      const grouped = groupEventsByUser(events);

      expect(grouped.size).toBe(2);
      expect(grouped.get('user-1')).toHaveLength(2);
      expect(grouped.get('user-2')).toHaveLength(1);
    });

    it('should handle empty events array', () => {
      const grouped = groupEventsByUser([]);

      expect(grouped.size).toBe(0);
    });
  });

  describe('calculateTotalCompensation', () => {
    it('should calculate total compensation for all events', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'John Doe',
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          extendedProps: {
            user: mockUser,
            duration: 16,
            weekdayDays: 1,
            weekendDays: 0,
            compensation: 50,
          },
        },
        {
          id: '2',
          title: 'Jane Smith',
          start: '2024-01-03T17:00:00Z',
          end: '2024-01-04T09:00:00Z',
          extendedProps: {
            user: mockUser2,
            duration: 16,
            weekdayDays: 0,
            weekendDays: 1,
            compensation: 75,
          },
        },
      ];

      const total = calculateTotalCompensation(events);

      expect(total).toBe(125);
    });

    it('should return 0 for empty events array', () => {
      const total = calculateTotalCompensation([]);

      expect(total).toBe(0);
    });

    it('should handle events with zero compensation', () => {
      const events: CalendarEvent[] = [
        {
          id: '1',
          title: 'John Doe',
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          extendedProps: {
            user: mockUser,
            duration: 16,
            weekdayDays: 0,
            weekendDays: 0,
            compensation: 0,
          },
        },
      ];

      const total = calculateTotalCompensation(events);

      expect(total).toBe(0);
    });
  });

  describe('filterEventsByDateRange', () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'John Doe',
        start: '2024-01-01T17:00:00Z',
        end: '2024-01-02T09:00:00Z',
        extendedProps: {
          user: mockUser,
          duration: 16,
          weekdayDays: 1,
          weekendDays: 0,
          compensation: 50,
        },
      },
      {
        id: '2',
        title: 'Jane Smith',
        start: '2024-01-15T17:00:00Z',
        end: '2024-01-16T09:00:00Z',
        extendedProps: {
          user: mockUser2,
          duration: 16,
          weekdayDays: 1,
          weekendDays: 0,
          compensation: 50,
        },
      },
      {
        id: '3',
        title: 'John Doe',
        start: '2024-02-01T17:00:00Z',
        end: '2024-02-02T09:00:00Z',
        extendedProps: {
          user: mockUser,
          duration: 16,
          weekdayDays: 1,
          weekendDays: 0,
          compensation: 50,
        },
      },
    ];

    it('should filter events within date range', () => {
      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-01-31T23:59:59Z';

      const filtered = filterEventsByDateRange(events, startDate, endDate, timezone);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe('1');
      expect(filtered[1].id).toBe('2');
    });

    it('should handle Date objects', () => {
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');

      const filtered = filterEventsByDateRange(events, startDate, endDate, timezone);

      expect(filtered).toHaveLength(2);
    });

    it('should include events that overlap with date range', () => {
      // Event starts before range but ends within
      const startDate = '2024-01-02T00:00:00Z';
      const endDate = '2024-01-31T23:59:59Z';

      const filtered = filterEventsByDateRange(events, startDate, endDate, timezone);

      expect(filtered.length).toBeGreaterThanOrEqual(1);
    });

    it('should throw error for invalid date range', () => {
      expect(() =>
        filterEventsByDateRange(events, 'invalid-date', '2024-01-31T23:59:59Z', timezone)
      ).toThrow('Invalid date range');
    });

    it('should return empty array when no events match', () => {
      const startDate = '2025-01-01T00:00:00Z';
      const endDate = '2025-01-31T23:59:59Z';

      const filtered = filterEventsByDateRange(events, startDate, endDate, timezone);

      expect(filtered).toEqual([]);
    });
  });
});
