import { scheduleDetailFetcher } from '../fetchers';
import * as pagerdutyAuth from '@/lib/utils/pagerdutyAuth';

jest.mock('@/lib/utils/pagerdutyAuth');

describe('scheduleDetailFetcher', () => {
  const mockScheduleData = {
    schedule: {
      id: 'schedule-1',
      name: 'Engineering On-Call',
      time_zone: 'America/New_York',
      description: 'Primary engineering schedule',
      html_url: 'https://company.pagerduty.com/schedules/schedule-1',
      final_schedule: {
        rendered_schedule_entries: [],
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (pagerdutyAuth.getPagerDutyHeaders as jest.Mock).mockReturnValue({
      Authorization: 'Bearer test-token',
    });
  });

  it('fetches and returns schedule data on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockScheduleData,
    });

    const result = await scheduleDetailFetcher([
      'https://api.pagerduty.com/schedules/schedule-1',
      'test-token',
      'oauth',
    ]);

    expect(result).toEqual(mockScheduleData);
    expect(global.fetch).toHaveBeenCalledWith('https://api.pagerduty.com/schedules/schedule-1', {
      headers: { Authorization: 'Bearer test-token' },
    });
  });

  it('calls getPagerDutyHeaders with correct authentication method', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockScheduleData,
    });

    await scheduleDetailFetcher([
      'https://api.pagerduty.com/schedules/schedule-1',
      'api-token-value',
      'api-token',
    ]);

    expect(pagerdutyAuth.getPagerDutyHeaders).toHaveBeenCalledWith('api-token-value', 'api-token');
  });

  it('throws error with custom message on API error', async () => {
    const errorMessage = 'Invalid authentication';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: errorMessage }),
    });

    await expect(
      scheduleDetailFetcher([
        'https://api.pagerduty.com/schedules/schedule-1',
        'bad-token',
        'oauth',
      ])
    ).rejects.toThrow(errorMessage);
  });

  it('throws default error message when no message in response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(
      scheduleDetailFetcher([
        'https://api.pagerduty.com/schedules/schedule-1',
        'bad-token',
        'oauth',
      ])
    ).rejects.toThrow('Failed to fetch schedule');
  });

  it('handles undefined authMethod', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockScheduleData,
    });

    await scheduleDetailFetcher([
      'https://api.pagerduty.com/schedules/schedule-1',
      'token',
      undefined,
    ]);

    expect(pagerdutyAuth.getPagerDutyHeaders).toHaveBeenCalledWith('token', undefined);
  });

  it('throws error on network failure', async () => {
    const networkError = new Error('Network timeout');
    global.fetch = jest.fn().mockRejectedValue(networkError);

    await expect(
      scheduleDetailFetcher(['https://api.pagerduty.com/schedules/schedule-1', 'token', 'oauth'])
    ).rejects.toThrow('Network timeout');
  });
});
