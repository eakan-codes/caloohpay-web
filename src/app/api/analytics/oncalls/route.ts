/**
 * API route for fetching on-call data from PagerDuty
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { DateTime } from 'luxon';
import { createPagerDutyClient } from '@/lib/api/pagerduty';
import type { OnCallEntry } from '@/lib/types';

export async function GET(request: Request) {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('schedule_id');
    const since = searchParams.get('since');
    const until = searchParams.get('until');

    if (!scheduleId || !since || !until) {
      return NextResponse.json(
        { error: 'Missing required parameters: schedule_id, since, until' },
        { status: 400 }
      );
    }

    // Handle potential URL decoding issues where '+' for timezone offsets becomes ' '
    const cleanSince = since.replace(/ /g, '+');
    const cleanUntil = until.replace(/ /g, '+');

    const start = DateTime.fromISO(cleanSince, { setZone: true });
    const end = DateTime.fromISO(cleanUntil, { setZone: true });

    if (!start.isValid || !end.isValid) {
      return NextResponse.json({ error: 'Invalid date format. Use ISO-8601.' }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json({ error: 'until must be after since' }, { status: 400 });
    }

    const MAX_RANGE_DAYS = 90;
    const MAX_SEGMENTS = 5; // allow up to ~1 year (cover 366 days comfortably)
    const totalDays = end.diff(start, 'days').days;

    if (totalDays > MAX_RANGE_DAYS * MAX_SEGMENTS) {
      return NextResponse.json(
        { error: 'Date range too large. Limit to ~1 year (4 x 90-day windows).' },
        { status: 400 }
      );
    }

    // Create PagerDuty client
    const client = createPagerDutyClient(session.accessToken, session.authMethod);

    // PagerDuty caps on-call queries to ~3 months; chunk requests to cover longer ranges (e.g., full year)
    const oncalls: OnCallEntry[] = [];
    let cursor = start;

    while (cursor < end) {
      const segmentEnd = cursor.plus({ days: MAX_RANGE_DAYS });
      const windowEnd = segmentEnd < end ? segmentEnd : end;

      const cursorIso = cursor.toISO();
      const windowEndIso = windowEnd.toISO();

      if (!cursorIso || !windowEndIso) {
        throw new Error('Failed to generate ISO date string for pagination');
      }

      const chunk = await client.getOnCalls(scheduleId, cursorIso, windowEndIso);
      oncalls.push(...chunk);

      // Advance cursor to next segment without overlap
      cursor = windowEnd;
    }

    return NextResponse.json({ oncalls });
  } catch (error) {
    console.error('Error fetching on-call data:', error);

    // Log additional details for debugging
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number; data: unknown } };
      console.error('PagerDuty API error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
