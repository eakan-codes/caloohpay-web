/**
 * On-call user class representing a user with multiple on-call periods
 * Based on the original CalOohPay implementation
 */

import { OnCallPeriod } from './OnCallPeriod';

export class OnCallUser {
  public readonly id: string;
  public readonly name: string;
  public readonly email?: string;
  public readonly periods: OnCallPeriod[];

  constructor(id: string, name: string, periods: OnCallPeriod[], email?: string) {
    this.id = id;
    this.name = name;
    this.periods = periods;
    this.email = email;
  }

  /**
   * Gets the total number of OOH weekday days across all periods
   */
  getTotalOohWeekdays(): number {
    return this.periods.reduce((total, period) => total + period.getOohWeekdayCount(), 0);
  }

  /**
   * Gets the total number of OOH weekend days across all periods
   */
  getTotalOohWeekends(): number {
    return this.periods.reduce((total, period) => total + period.getOohWeekendCount(), 0);
  }

  /**
   * Gets all on-call periods for this user
   */
  getOnCallPeriods(): OnCallPeriod[] {
    return this.periods;
  }

  /**
   * Gets only the OOH periods (filters out non-OOH periods)
   */
  getOohPeriods(): OnCallPeriod[] {
    return this.periods.filter((period) => period.isOutOfHours());
  }

  /**
   * Gets the total duration of all on-call periods in hours
   */
  getTotalDurationHours(): number {
    return this.periods.reduce((total, period) => total + period.getDurationHours(), 0);
  }

  /**
   * Converts the user to a plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      totalOohWeekdays: this.getTotalOohWeekdays(),
      totalOohWeekends: this.getTotalOohWeekends(),
      periods: this.periods.map((p) => ({
        start: p.start.toISOString(),
        end: p.end.toISOString(),
        timezone: p.timezone,
        isOoh: p.isOutOfHours(),
        weekdayCount: p.getOohWeekdayCount(),
        weekendCount: p.getOohWeekendCount(),
      })),
    };
  }
}
