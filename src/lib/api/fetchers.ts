import { getPagerDutyHeaders } from '@/lib/utils/pagerdutyAuth';
import type { PagerDutySchedule } from '@/lib/types';

/**
 * Response structure for schedule API calls
 */
export interface ScheduleResponse {
  schedule: PagerDutySchedule;
}

/**
 * Fetcher function for SWR - handles PagerDuty API calls with authentication
 *
 * @remarks
 * - Used with SWR for data fetching and automatic revalidation
 * - Handles both OAuth and API token authentication
 * - Throws errors for non-OK responses to trigger SWR error state
 * - Compatible with SWR's key/fetcher pattern
 *
 * @example
 * ```tsx
 * const { data, error } = useSWR(
 *   ['/api/schedules/ABC123', accessToken, authMethod],
 *   scheduleDetailFetcher
 * );
 * ```
 *
 * @param args - SWR key array with [url, token, authMethod]
 * @returns The parsed JSON response from the API
 * @throws Error if the response is not OK
 */
export const scheduleDetailFetcher = async ([url, token, authMethod]: [
  string,
  string,
  string | undefined,
]): Promise<ScheduleResponse> => {
  const response = await fetch(url, {
    headers: getPagerDutyHeaders(token, authMethod as 'oauth' | 'api-token'),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch schedule');
  }

  return response.json();
};
