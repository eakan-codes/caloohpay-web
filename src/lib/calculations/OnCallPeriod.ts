/**
 * On-call period class representing a single on-call shift
 * Based on the original CalOohPay implementation
 */

import { DateTime } from 'luxon';
import { WORKING_HOURS, WEEKEND_DAYS, WEEKDAY_DAYS } from '@/lib/constants';

export class OnCallPeriod {
  public readonly start: Date;
  public readonly end: Date;
  public readonly timezone: string;

  constructor(start: Date, end: Date, timezone: string) {
    this.start = start;
    this.end = end;
    this.timezone = timezone;
  }

  /**
   * Determines if this period qualifies as out-of-hours (OOH)
   * A period is OOH if:
   * 1. It spans multiple days, OR
   * 2. It extends past 17:30 (5:30 PM), OR
   * 3. It's longer than 6 hours
   */
  isOutOfHours(): boolean {
    const startDateTime = DateTime.fromJSDate(this.start, { zone: this.timezone });
    const endDateTime = DateTime.fromJSDate(this.end, { zone: this.timezone });

    // Check if spans multiple days
    const spansMultipleDays = startDateTime.day !== endDateTime.day;
    if (spansMultipleDays) {
      return true;
    }

    // Check if extends past 17:30
    const endHourDecimal = endDateTime.hour + endDateTime.minute / 60;
    if (endHourDecimal > WORKING_HOURS.END) {
      return true;
    }

    // Check if longer than minimum duration
    const durationHours = endDateTime.diff(startDateTime, 'hours').hours;
    if (durationHours > WORKING_HOURS.MINIMUM_OOH_DURATION_HOURS) {
      return true;
    }

    return false;
  }

  /**
   * Gets the number of OOH weekday days (Monday-Thursday) in this period
   */
  getOohWeekdayCount(): number {
    if (!this.isOutOfHours()) {
      return 0;
    }

    const startDateTime = DateTime.fromJSDate(this.start, { zone: this.timezone });
    const endDateTime = DateTime.fromJSDate(this.end, { zone: this.timezone });

    let count = 0;
    let current = startDateTime.startOf('day');

    // Iterate through each day in the period
    while (current <= endDateTime) {
      const dayOfWeek = current.weekday % 7; // Convert to 0-6 (Sunday = 0)
      if ((WEEKDAY_DAYS as readonly number[]).includes(dayOfWeek)) {
        count++;
      }
      current = current.plus({ days: 1 });
    }

    return count;
  }

  /**
   * Gets the number of OOH weekend days (Friday-Sunday) in this period
   */
  getOohWeekendCount(): number {
    if (!this.isOutOfHours()) {
      return 0;
    }

    const startDateTime = DateTime.fromJSDate(this.start, { zone: this.timezone });
    const endDateTime = DateTime.fromJSDate(this.end, { zone: this.timezone });

    let count = 0;
    let current = startDateTime.startOf('day');

    // Iterate through each day in the period
    while (current <= endDateTime) {
      const dayOfWeek = current.weekday % 7; // Convert to 0-6 (Sunday = 0)
      if ((WEEKEND_DAYS as readonly number[]).includes(dayOfWeek)) {
        count++;
      }
      current = current.plus({ days: 1 });
    }

    return count;
  }

  /**
   * Gets the duration of this period in hours
   */
  getDurationHours(): number {
    const startDateTime = DateTime.fromJSDate(this.start, { zone: this.timezone });
    const endDateTime = DateTime.fromJSDate(this.end, { zone: this.timezone });
    return endDateTime.diff(startDateTime, 'hours').hours;
  }

  /**
   * Formats the period as a human-readable string
   */
  toString(): string {
    const startDateTime = DateTime.fromJSDate(this.start, { zone: this.timezone });
    const endDateTime = DateTime.fromJSDate(this.end, { zone: this.timezone });
    return `${startDateTime.toFormat('MMM dd HH:mm')} - ${endDateTime.toFormat('MMM dd HH:mm')} (${this.timezone})`;
  }
}
