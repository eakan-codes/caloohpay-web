/**
 * API route for fetching on-call data from PagerDuty
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
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

    // Create PagerDuty client
    const client = createPagerDutyClient(session.accessToken, session.authMethod);

    // Fetch on-call data
    const oncalls = await client.getOnCalls(scheduleId, since, until);

    return NextResponse.json({ oncalls });
  } catch (error) {
    console.error('Error fetching on-call data:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
