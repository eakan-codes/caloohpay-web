/**
 * Calendar utilities for transforming PagerDuty schedule data into calendar events
 */

import { DateTime } from 'luxon';
import { OnCallPeriod, OnCallUser, OnCallPaymentsCalculator } from '@/lib/caloohpay';
import type { ScheduleEntry, User } from '@/lib/types';
import he from 'he';
import { sanitizeUrl } from './urlSanitization';
import { getCurrentRates } from './ratesUtils';

/**
 * Extended calendar event with payment details
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO8601 string
  end: string; // ISO8601 string
  extendedProps: {
    user: User;
    duration: number;
    weekdayDays: number;
    weekendDays: number;
    compensation: number;
  };
}

/**
 * Validates that a date string or Date object is valid
 * @param date - Date to validate
 * @returns true if valid, false otherwise
 */
function isValidDate(date: string | Date): boolean {
  if (typeof date === 'string') {
    const dt = DateTime.fromISO(date);
    return dt.isValid;
  }
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - User input string
 * @returns Sanitized string
 */
function sanitizeUserInput(input: string | undefined): string {
  if (!input || input.trim() === '') return 'Unknown';
  // Encode HTML entities and trim whitespace to prevent HTML injection
  return he.encode(input).trim();
}

/**
 * Transforms PagerDuty schedule entries into FullCalendar events
 * Includes payment calculation for each event
 *
 * @param entries - Array of PagerDuty schedule entries
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns Array of calendar events with extended payment props
 *
 * @throws {Error} If timezone is invalid or entries contain invalid dates
 */
export function transformToCalendarEvents(
  entries: ScheduleEntry[],
  timezone: string
): CalendarEvent[] {
  // Validate timezone
  if (!timezone || typeof timezone !== 'string') {
    throw new Error(`Invalid timezone provided: ${timezone}`);
  }

  // Test timezone validity with Luxon
  const testDate = DateTime.now().setZone(timezone);
  if (!testDate.isValid) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }

  // Validate entries is an array
  if (!Array.isArray(entries)) {
    throw new Error('Entries must be an array');
  }
  // Calculate payments using caloohpay with user-customized rates
  const rates = getCurrentRates();
  const calculator = new OnCallPaymentsCalculator(rates.weekdayRate, rates.weekendRate);

  return entries
    .filter((entry) => {
      // Filter out invalid entries
      if (!entry || typeof entry !== 'object') return false;
      if (!entry.start || !entry.end || !entry.user) return false;
      if (!isValidDate(entry.start) || !isValidDate(entry.end)) return false;
      return true;
    })
    .map((entry, index) => {
      // Normalize dates to ISO strings
      const startISO = typeof entry.start === 'string' ? entry.start : entry.start.toISOString();
      const endISO = typeof entry.end === 'string' ? entry.end : entry.end.toISOString();

      // Calculate payment details using caloohpay package
      const startDate = new Date(startISO);
      const endDate = new Date(endISO);

      // Create OnCallPeriod for accurate calculations
      const period = new OnCallPeriod(startDate, endDate, timezone);

      const weekdayDays = period.numberOfOohWeekDays;
      const weekendDays = period.numberOfOohWeekends;

      // Calculate duration using Luxon
      const startDT = DateTime.fromISO(startISO, { zone: timezone });
      const endDT = DateTime.fromISO(endISO, { zone: timezone });
      const duration = endDT.diff(startDT, 'hours').hours;

      // Calculate compensation using OnCallPaymentsCalculator
      const onCallUser = new OnCallUser(entry.user.id, entry.user.name || entry.user.summary, [
        period,
      ]);
      const compensation = calculator.calculateOnCallPayment(onCallUser);

      // Sanitize user data to prevent XSS
      const userName = sanitizeUserInput(entry.user.name || entry.user.summary);
      const userSummary = sanitizeUserInput(entry.user.summary);
      const userEmail = sanitizeUserInput(entry.user.email);
      const userId = sanitizeUserInput(entry.user.id);
      const userHtmlUrl = sanitizeUrl(entry.user.html_url);

      return {
        // Generate unique ID combining user ID and index to prevent collisions
        id: `${userId}-${index}-${startDate.getTime()}`,
        title: userName,
        start: startISO,
        end: endISO,
        extendedProps: {
          user: {
            id: userId,
            summary: userSummary,
            name: userName,
            email: userEmail && userEmail !== 'Unknown' ? userEmail : undefined,
            html_url: userHtmlUrl,
          },
          duration,
          weekdayDays,
          weekendDays,
          compensation,
        },
      };
    });
}

/**
 * Groups calendar events by user ID
 * Useful for filtering calendar view by specific users
 *
 * @param events - Array of calendar events
 * @returns Map of user ID to their events
 */
export function groupEventsByUser(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const userId = event.extendedProps.user.id;
    if (!grouped.has(userId)) {
      grouped.set(userId, []);
    }
    grouped.get(userId)!.push(event);
  }

  return grouped;
}

/**
 * Calculates total compensation for all events
 *
 * @param events - Array of calendar events
 * @returns Total compensation amount
 */
export function calculateTotalCompensation(events: CalendarEvent[]): number {
  return events.reduce((total, event) => {
    return total + (event.extendedProps.compensation || 0);
  }, 0);
}

/**
 * Filters events within a specific date range
 *
 * @param events - Array of calendar events
 * @param startDate - Start date (ISO string or Date)
 * @param endDate - End date (ISO string or Date)
 * @param timezone - IANA timezone string
 * @returns Filtered events within the date range
 */
export function filterEventsByDateRange(
  events: CalendarEvent[],
  startDate: string | Date,
  endDate: string | Date,
  timezone: string
): CalendarEvent[] {
  const start = DateTime.fromISO(
    typeof startDate === 'string' ? startDate : startDate.toISOString(),
    { zone: timezone }
  );
  const end = DateTime.fromISO(typeof endDate === 'string' ? endDate : endDate.toISOString(), {
    zone: timezone,
  });

  if (!start.isValid || !end.isValid) {
    throw new Error('Invalid date range provided');
  }

  return events.filter((event) => {
    const eventStart = DateTime.fromISO(event.start, { zone: timezone });
    const eventEnd = DateTime.fromISO(event.end, { zone: timezone });

    // Event overlaps with date range if:
    // - Event starts before range ends AND
    // - Event ends after range starts
    return eventStart < end && eventEnd > start;
  });
}
