import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { getPagerDutyHeaders } from '@/lib/utils/pagerdutyAuth';

/**
 * GET /api/schedules/[id]
 * Fetch a single schedule with detailed information including on-call periods
 *
 * Query Parameters:
 * - since: ISO date string for start of time range
 * - until: ISO date string for end of time range
 *
 * Returns: PagerDuty schedule with rendered_schedule_entries
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for token expiration
    if (session.error === 'RefreshAccessTokenError') {
      return NextResponse.json(
        {
          error: 'Token expired',
          message: 'Please sign in again',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    const until = searchParams.get('until');

    // Await params in Next.js 15+
    const { id } = await params;

    // Build PagerDuty API URL with time range if provided
    let apiUrl = `https://api.pagerduty.com/schedules/${id}`;
    const queryParams = new URLSearchParams();

    if (since) {
      queryParams.append('since', since);
    }
    if (until) {
      queryParams.append('until', until);
    }

    if (queryParams.toString()) {
      apiUrl += `?${queryParams.toString()}`;
    }

    // Fetch from PagerDuty API
    const response = await fetch(apiUrl, {
      headers: getPagerDutyHeaders(session.accessToken, session.authMethod),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Invalid or expired PagerDuty token',
          },
          { status: 401 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: 'Schedule not found',
            message: 'The requested schedule does not exist',
          },
          { status: 404 }
        );
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'Failed to fetch schedule',
          message: errorData.error?.message || response.statusText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      schedule: data.schedule,
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
