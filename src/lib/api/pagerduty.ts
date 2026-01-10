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
    const promises = scheduleIds.map((scheduleId) =>
      this.getSchedule(scheduleId, since, until, timezone)
        .then((schedule) => ({ status: 'fulfilled' as const, value: schedule }))
        .catch((error) => {
          console.error(`Failed to fetch schedule ${scheduleId}:`, error);
          return { status: 'rejected' as const, reason: error };
        })
    );

    const results = await Promise.all(promises);

    return results
      .filter(
        (result): result is { status: 'fulfilled'; value: PagerDutySchedule } =>
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
