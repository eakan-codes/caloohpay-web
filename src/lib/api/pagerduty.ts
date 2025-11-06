/**
 * PagerDuty API client
 */

import axios, { AxiosInstance } from 'axios';
import type { PagerDutySchedule } from '@/lib/types';

export class PagerDutyClient {
  private client: AxiosInstance;

  constructor(apiToken: string) {
    this.client = axios.create({
      baseURL: 'https://api.pagerduty.com',
      headers: {
        Accept: 'application/vnd.pagerduty+json;version=2',
        Authorization: `Token token=${apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
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
    const schedules: PagerDutySchedule[] = [];

    for (const scheduleId of scheduleIds) {
      try {
        const schedule = await this.getSchedule(scheduleId, since, until, timezone);
        schedules.push(schedule);
      } catch (error) {
        console.error(`Failed to fetch schedule ${scheduleId}:`, error);
        // Continue with other schedules
      }
    }

    return schedules;
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
export function createPagerDutyClient(apiToken: string): PagerDutyClient {
  return new PagerDutyClient(apiToken);
}
