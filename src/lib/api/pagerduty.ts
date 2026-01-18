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
   */
  async getOnCalls(
    scheduleId: string,
    since: string,
    until: string
  ): Promise<import('@/lib/types').OnCallEntry[]> {
    const params: Record<string, string> = {
      schedule_ids: scheduleId,
      since,
      until,
    };

    const response = await this.client.get('/oncalls', { params });

    if (!response.data || !response.data.oncalls) {
      throw new Error('Invalid API response: Missing oncalls data');
    }

    return response.data.oncalls;
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
