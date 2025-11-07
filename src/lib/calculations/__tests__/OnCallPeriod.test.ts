import { OnCallPeriod } from '../OnCallPeriod';

describe('OnCallPeriod', () => {
  describe('constructor', () => {
    it('should create a period with valid dates', () => {
      const start = new Date('2024-01-15T00:00:00Z');
      const end = new Date('2024-01-16T00:00:00Z');

      const period = new OnCallPeriod(start, end, 'UTC');

      expect(period.start).toEqual(start);
      expect(period.end).toEqual(end);
      expect(period.timezone).toBe('UTC');
    });

    it('should accept different timezones', () => {
      const start = new Date('2024-01-15T00:00:00Z');
      const end = new Date('2024-01-16T00:00:00Z');

      const period = new OnCallPeriod(start, end, 'America/New_York');

      expect(period.timezone).toBe('America/New_York');
    });
  });

  describe('isOutOfHours', () => {
    it('should return true for period spanning multiple days', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T00:00:00Z'), // Monday
        new Date('2024-01-16T23:59:59Z'), // Tuesday
        'UTC'
      );

      expect(period.isOutOfHours()).toBe(true);
    });

    it('should return true for period extending past 17:30', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T09:00:00Z'), // Monday 9 AM
        new Date('2024-01-15T18:00:00Z'), // Monday 6 PM (past 17:30)
        'UTC'
      );

      expect(period.isOutOfHours()).toBe(true);
    });

    it('should return true for period longer than 6 hours', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T09:00:00Z'), // Monday 9 AM
        new Date('2024-01-15T16:00:00Z'), // Monday 4 PM (7 hours)
        'UTC'
      );

      expect(period.isOutOfHours()).toBe(true);
    });

    it('should return false for short daytime period', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T09:00:00Z'), // Monday 9 AM
        new Date('2024-01-15T10:00:00Z'), // Monday 10 AM (1 hour)
        'UTC'
      );

      expect(period.isOutOfHours()).toBe(false);
    });

    it('should return false for 5-hour daytime period within hours', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T10:00:00Z'), // Monday 10 AM
        new Date('2024-01-15T15:00:00Z'), // Monday 3 PM (5 hours, before 17:30)
        'UTC'
      );

      expect(period.isOutOfHours()).toBe(false);
    });

    it('should handle timezone-aware OOH detection', () => {
      // 9 AM to 6 PM EST (crosses 17:30)
      const period = new OnCallPeriod(
        new Date('2024-01-15T14:00:00Z'), // 9 AM EST
        new Date('2024-01-15T23:00:00Z'), // 6 PM EST
        'America/New_York'
      );

      expect(period.isOutOfHours()).toBe(true);
    });
  });

  describe('getOohWeekdayCount', () => {
    it('should count Monday-Thursday as weekdays', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T00:00:00Z'), // Monday
        new Date('2024-01-18T23:59:59Z'), // Thursday
        'UTC'
      );

      expect(period.getOohWeekdayCount()).toBe(4);
    });

    it('should not count Friday-Sunday as weekdays', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-19T00:00:00Z'), // Friday
        new Date('2024-01-21T23:59:59Z'), // Sunday
        'UTC'
      );

      expect(period.getOohWeekdayCount()).toBe(0);
    });

    it('should count only weekdays in mixed period', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T00:00:00Z'), // Monday
        new Date('2024-01-21T23:59:59Z'), // Sunday
        'UTC'
      );

      expect(period.getOohWeekdayCount()).toBe(4); // Mon, Tue, Wed, Thu
    });

    it('should return 0 for non-OOH periods', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T09:00:00Z'), // Monday 9 AM
        new Date('2024-01-15T10:00:00Z'), // Monday 10 AM (not OOH)
        'UTC'
      );

      expect(period.getOohWeekdayCount()).toBe(0);
    });

    it('should handle single day periods', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T00:00:00Z'), // Monday
        new Date('2024-01-15T23:59:59Z'), // Monday
        'UTC'
      );

      expect(period.getOohWeekdayCount()).toBe(1);
    });
  });

  describe('getOohWeekendCount', () => {
    it('should count Friday-Sunday as weekend days', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-19T00:00:00Z'), // Friday
        new Date('2024-01-21T23:59:59Z'), // Sunday
        'UTC'
      );

      expect(period.getOohWeekendCount()).toBe(3);
    });

    it('should not count Monday-Thursday as weekend days', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T00:00:00Z'), // Monday
        new Date('2024-01-18T23:59:59Z'), // Thursday
        'UTC'
      );

      expect(period.getOohWeekendCount()).toBe(0);
    });

    it('should count only weekend days in mixed period', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T00:00:00Z'), // Monday
        new Date('2024-01-21T23:59:59Z'), // Sunday
        'UTC'
      );

      expect(period.getOohWeekendCount()).toBe(3); // Fri, Sat, Sun
    });

    it('should return 0 for non-OOH periods', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-19T09:00:00Z'), // Friday 9 AM
        new Date('2024-01-19T10:00:00Z'), // Friday 10 AM (not OOH)
        'UTC'
      );

      expect(period.getOohWeekendCount()).toBe(0);
    });

    it('should handle single weekend day periods', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-20T00:00:00Z'), // Saturday
        new Date('2024-01-20T23:59:59Z'), // Saturday
        'UTC'
      );

      expect(period.getOohWeekendCount()).toBe(1);
    });
  });

  describe('getDurationHours', () => {
    it('should calculate duration in hours', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T09:00:00Z'),
        new Date('2024-01-15T17:00:00Z'),
        'UTC'
      );

      expect(period.getDurationHours()).toBe(8);
    });

    it('should calculate fractional hours', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T09:00:00Z'),
        new Date('2024-01-15T09:30:00Z'),
        'UTC'
      );

      expect(period.getDurationHours()).toBe(0.5);
    });

    it('should calculate multi-day durations', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T00:00:00Z'),
        new Date('2024-01-16T00:00:00Z'),
        'UTC'
      );

      expect(period.getDurationHours()).toBe(24);
    });

    it('should handle timezone differences', () => {
      // 9 AM to 5 PM EST (8 hours)
      const period = new OnCallPeriod(
        new Date('2024-01-15T14:00:00Z'), // 9 AM EST
        new Date('2024-01-15T22:00:00Z'), // 5 PM EST
        'America/New_York'
      );

      expect(period.getDurationHours()).toBe(8);
    });
  });

  describe('edge cases', () => {
    it('should handle periods ending exactly at 17:30', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T09:00:00Z'),
        new Date('2024-01-15T17:30:00Z'),
        'UTC'
      );

      // 8.5 hours should be > 6 hours, so it's OOH
      expect(period.isOutOfHours()).toBe(true);
    });

    it('should handle midnight crossing periods', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T22:00:00Z'), // Monday 10 PM
        new Date('2024-01-16T02:00:00Z'), // Tuesday 2 AM
        'UTC'
      );

      expect(period.isOutOfHours()).toBe(true); // Spans multiple days
      expect(period.getDurationHours()).toBe(4);
    });

    it('should handle week boundary crossing', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-18T00:00:00Z'), // Thursday
        new Date('2024-01-22T23:59:59Z'), // Monday (next week)
        'UTC'
      );

      expect(period.getOohWeekdayCount()).toBe(2); // Thu, Mon
      expect(period.getOohWeekendCount()).toBe(3); // Fri, Sat, Sun
    });

    it('should handle very short periods', () => {
      const period = new OnCallPeriod(
        new Date('2024-01-15T09:00:00Z'),
        new Date('2024-01-15T09:00:01Z'), // 1 second
        'UTC'
      );

      expect(period.isOutOfHours()).toBe(false);
      expect(period.getDurationHours()).toBeCloseTo(0.000278, 6); // ~1/3600
    });

    it('should handle leap year dates', () => {
      const period = new OnCallPeriod(
        new Date('2024-02-28T00:00:00Z'),
        new Date('2024-03-01T23:59:59Z'), // Includes Feb 29
        'UTC'
      );

      expect(period.isOutOfHours()).toBe(true);
      expect(period.getDurationHours()).toBeGreaterThan(48);
    });
  });
});
