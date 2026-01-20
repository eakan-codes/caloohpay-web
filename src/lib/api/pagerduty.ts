/**
 * PagerDuty API client
 */

import axios, { AxiosInstance } from 'axios';
import type { PagerDutySchedule } from '@/lib/types';
import { getPagerDutyAuthHeader } from '@/lib/utils/pagerdutyAuth';

export class PagerDutyClient {
  private client: AxiosInstance;

  constructor(apiToken: string, authMethod?: 'oauth' | 'api-token') {
    // Use environment variable for timeout, default to 30 seconds
    const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10) || 30000;

    this.client = axios.create({
      baseURL: 'https://api.pagerduty.com',
      headers: {
        Accept: 'application/vnd.pagerduty+json;version=2',
        Authorization: getPagerDutyAuthHeader(apiToken, authMethod),
        'Content-Type': 'application/json',
      },
      timeout,
    });
  }

  /**
   * Fetches a schedule by ID with date range
   */
  async getSchedule(
    scheduleId: string,
    since: string,
    until: string,
    timezone?: string
  ): Promise<PagerDutySchedule> {
    const params: Record<string, string> = {
      since,
      until,
      overflow: 'false',
    };

    // Only include timezone if explicitly provided
    if (timezone) {
      params.time_zone = timezone;
    }

    const response = await this.client.get(`/schedules/${scheduleId}`, { params });

    if (!response.data || !response.data.schedule) {
      throw new Error('Invalid API response: Missing schedule data');
    }

    return response.data.schedule;
  }

  /**
   * Lists all schedules accessible to the API token
   */
  async listSchedules(query?: string, limit: number = 100): Promise<PagerDutySchedule[]> {
    const params: Record<string, string | number> = {
      limit,
    };

    if (query) {
      params.query = query;
    }

    const response = await this.client.get('/schedules', { params });

    if (!response.data || !response.data.schedules) {
      throw new Error('Invalid API response: Missing schedules data');
    }

    return response.data.schedules;
  }

  /**
   * Searches for schedules by name
   */
  async searchSchedules(searchTerm: string): Promise<PagerDutySchedule[]> {
    return this.listSchedules(searchTerm);
  }

  /**
   * Fetches multiple schedules by IDs
   */
  async getMultipleSchedules(
    scheduleIds: string[],
    since: string,
    until: string,
    timezone?: string
  ): Promise<PagerDutySchedule[]> {
    const results = await Promise.allSettled(
      scheduleIds.map((scheduleId) => this.getSchedule(scheduleId, since, until, timezone))
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to fetch schedule ${scheduleIds[index]}:`, result.reason);
      }
    });

    return results
      .filter(
        (result): result is PromiseFulfilledResult<PagerDutySchedule> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value);
  }

  /**
   * Validates the API token by making a test request
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await this.client.get('/abilities');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Fetches on-call entries for a schedule within a date range
   * Used for frequency matrix and burden distribution analytics
   * Handles pagination automatically to ensure all results are returned
   * Also handles chunking for large date ranges (PagerDuty limits queries to ~90 days)
   */
  async getOnCalls(
    scheduleId: string,
    since: string,
    until: string
  ): Promise<import('@/lib/types').OnCallEntry[]> {
    const { DateTime } = await import('luxon');
    const allOncalls: import('@/lib/types').OnCallEntry[] = [];

    const start = DateTime.fromISO(since, { setZone: true });
    const end = DateTime.fromISO(until, { setZone: true });

    if (!start.isValid || !end.isValid) {
      throw new Error('Invalid date format for oncalls request');
    }

    // PagerDuty limits oncalls queries to ~90 days, so we need to chunk large date ranges
    const MAX_RANGE_DAYS = 90;
    let cursor = start;

    while (cursor < end) {
      const segmentEnd = cursor.plus({ days: MAX_RANGE_DAYS });
      const windowEnd = segmentEnd < end ? segmentEnd : end;

      const cursorIso = cursor.toISO();
      const windowEndIso = windowEnd.toISO();

      if (!cursorIso || !windowEndIso) {
        throw new Error('Failed to generate ISO date string for pagination');
      }

      // Fetch this chunk with pagination
      let offset = 0;
      const limit = 100; // PagerDuty max limit per page
      let hasMore = true;

      while (hasMore) {
        const response = await this.client.get('/oncalls', {
          params: {
            schedule_ids: [scheduleId],
            since: cursorIso,
            until: windowEndIso,
            limit,
            offset,
          },
        });

        if (!response.data || !response.data.oncalls) {
          throw new Error('Invalid API response: Missing oncalls data');
        }

        allOncalls.push(...response.data.oncalls);

        // Check if there are more results in this chunk
        hasMore = response.data.more === true;
        if (hasMore) {
          offset += limit;
        }
      }

      // Move to next chunk
      cursor = windowEnd;
    }

    return allOncalls;
  }

  /**
   * Fetches incidents for a schedule within a date range
   * Used for interruption correlation with time-to-resolve data
   */
  async getIncidents(
    scheduleId: string,
    since: string,
    until: string
  ): Promise<import('@/lib/types').Incident[]> {
    // First, get all users who were on-call during this period
    const oncalls = await this.getOnCalls(scheduleId, since, until);
    const userIds = [...new Set(oncalls.map((oncall) => oncall.user.id))];

    if (userIds.length === 0) {
      return [];
    }

    const allIncidents: import('@/lib/types').Incident[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    // Paginate through all incidents for these users
    while (hasMore) {
      const response = await this.client.get('/incidents', {
        params: {
          user_ids: userIds,
          since,
          until,
          limit,
          offset,
          statuses: ['resolved'], // Only get resolved incidents for time-to-resolve calculation
        },
      });

      if (!response.data || !response.data.incidents) {
        throw new Error('Invalid API response: Missing incidents data');
      }

      allIncidents.push(...response.data.incidents);

      hasMore = response.data.more === true;
      if (hasMore) {
        offset += limit;
      }
    }

    return allIncidents;
  }

  /**
   * Fetches aggregated user analytics for burden distribution
   * Note: This endpoint may require additional permissions
   */
  async getUserMetrics(since: string, until: string): Promise<unknown> {
    const params: Record<string, string> = {
      since,
      until,
    };

    const response = await this.client.post('/analytics/metrics/users/all', params);

    if (!response.data) {
      throw new Error('Invalid API response: Missing user metrics data');
    }

    return response.data;
  }

  /**
   * Fetches responder analytics including interruption data
   * Note: This endpoint may require additional permissions
   */
  async getResponderMetrics(userId: string, since: string, until: string): Promise<unknown> {
    const params: Record<string, string> = {
      since,
      until,
    };

    const response = await this.client.get(`/analytics/raw/responders/${userId}/incidents`, {
      params,
    });

    if (!response.data) {
      throw new Error('Invalid API response: Missing responder metrics data');
    }

    return response.data;
  }
}

/**
 * Creates a PagerDuty client instance
 */
export function createPagerDutyClient(
  apiToken: string,
  authMethod?: 'oauth' | 'api-token'
): PagerDutyClient {
  return new PagerDutyClient(apiToken, authMethod);
}
