/**
 * Payment calculator for on-call compensation
 * Based on the original CalOohPay implementation
 */

import { OnCallUser } from './OnCallUser';
import { PAYMENT_RATES } from '@/lib/constants';
import type { OnCallCompensation } from '@/lib/types';

export class PaymentCalculator {
  private readonly weekdayRate: number;
  private readonly weekendRate: number;

  constructor(
    weekdayRate: number = PAYMENT_RATES.WEEKDAY,
    weekendRate: number = PAYMENT_RATES.WEEKEND
  ) {
    this.weekdayRate = weekdayRate;
    this.weekendRate = weekendRate;
  }

  /**
   * Calculates the total compensation for a single user
   */
  calculateCompensation(user: OnCallUser): number {
    const weekdayDays = user.getTotalOohWeekdays();
    const weekendDays = user.getTotalOohWeekends();
    return weekdayDays * this.weekdayRate + weekendDays * this.weekendRate;
  }

  /**
   * Calculates compensation details for a single user
   */
  calculateCompensationDetails(user: OnCallUser): OnCallCompensation {
    const weekdayDays = user.getTotalOohWeekdays();
    const weekendDays = user.getTotalOohWeekends();
    const totalCompensation = weekdayDays * this.weekdayRate + weekendDays * this.weekendRate;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        periods: user.getOnCallPeriods().map((p) => ({
          start: p.start,
          end: p.end,
          timezone: p.timezone,
        })),
        totalOohWeekdays: weekdayDays,
        totalOohWeekends: weekendDays,
      },
      totalCompensation,
      weekdayDays,
      weekendDays,
    };
  }

  /**
   * Calculates compensation for multiple users
   */
  calculateBatchCompensation(users: OnCallUser[]): Map<string, number> {
    const results = new Map<string, number>();

    for (const user of users) {
      const compensation = this.calculateCompensation(user);
      results.set(user.id, compensation);
    }

    return results;
  }

  /**
   * Calculates detailed compensation for multiple users
   */
  calculateBatchCompensationDetails(users: OnCallUser[]): OnCallCompensation[] {
    return users.map((user) => this.calculateCompensationDetails(user));
  }

  /**
   * Calculates the total compensation for all users
   */
  calculateTotalCompensation(users: OnCallUser[]): number {
    return users.reduce((total, user) => total + this.calculateCompensation(user), 0);
  }

  /**
   * Gets the current payment rates
   */
  getRates() {
    return {
      weekday: this.weekdayRate,
      weekend: this.weekendRate,
      currency: PAYMENT_RATES.CURRENCY,
      currencySymbol: PAYMENT_RATES.CURRENCY_SYMBOL,
    };
  }
}
