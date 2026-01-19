/**
 * API route for fetching incidents data from PagerDuty
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { DateTime } from 'luxon';
import { createPagerDutyClient } from '@/lib/api/pagerduty';

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

    // Create PagerDuty client
    const client = createPagerDutyClient(session.accessToken, session.authMethod);

    // Fetch incidents for the schedule
    const incidents = await client.getIncidents(scheduleId, cleanSince, cleanUntil);

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error('Error fetching incidents data:', error);

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
