import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { getPagerDutyHeaders } from '@/lib/utils/pagerdutyAuth';

/**
 * GET /api/schedules
 * Fetch all schedules from PagerDuty
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = searchParams.get('limit') || '16';
    const offset = searchParams.get('offset') || '0';

    // Build PagerDuty API URL
    const baseUrl = 'https://api.pagerduty.com/schedules';
    const params = new URLSearchParams({
      limit,
      offset,
      ...(query && { query }),
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      headers: getPagerDutyHeaders(session.accessToken, session.authMethod),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('PagerDuty API error:', errorData);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid or expired PagerDuty token' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to fetch schedules',
          message: errorData.error?.message || 'Unknown error occurred',
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      schedules: data.schedules || [],
      total: data.schedules?.length || 0,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      more: data.more || false,
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
