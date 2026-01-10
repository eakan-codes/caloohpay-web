import { createPagerDutyClient } from '@/lib/api/pagerduty';
import type { NextRequest } from 'next/server';
import { ScheduleCompensationReport } from '@/lib/types/multi-schedule';

// Mock dependencies
jest.mock('@/lib/api/pagerduty');
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({ accessToken: 'fake-token' }),
}));
// Mock NextResponse to avoid environment issues in test
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status || 200,
      ...(body as object),
    }),
  },
}));

// Import after mocks
import { POST } from '../route';

describe('Multi-Schedule Report API', () => {
  const mockGetMultipleSchedules = jest.fn();

  beforeEach(() => {
    (createPagerDutyClient as jest.Mock).mockReturnValue({
      getMultipleSchedules: mockGetMultipleSchedules,
    });
    mockGetMultipleSchedules.mockClear();
  });

  it('should split overlapping hours between schedules', async () => {
    // Setup Overlapping Schedules
    // User 'U1' is in S1 and S2 from 10:00 to 11:00 (1 hour)
    // Rate is 50. Total Pay for 1 hour = 1 * (50/24? No Rate is per day? No Rate is Flat?
    // Wait, Rate is "Weekday Rate" £50. Usually implies Per Day or Per Shift?
    // The project docs say "£50/weekday".
    // And "Minimum 6 hours OOH to qualify".
    // Caloohpay calculation: `calculateOnCallPayment(user)`.
    // If I manually calculate in the API using `hours * Rate`, I might be wrong about "Rate is per hour".
    // The Constants say "£50 per weekday". This implies a flat rate? Or per day?
    // `src/lib/constants.ts`: "£50 per weekday".
    // If it's Per Day, then 1 hour might be 0? Or 1/24?
    // Let's check `src/lib/utils/calendarUtils.ts` again.
    // It calls `calculator.calculateOnCallPayment(onCallUser)`.
    // I mimicked `(weekdays * Rate) + (weekends * Rate)` in the API route.
    // This implies `weekdays` is a "Count of Days" (float).
    // Let's verify my API logic: `const total = (data.weekday * activeRates.weekdayRate) + ...`
    // If `OnCallPeriod.numberOfOohWeekDays` returns 0.04 (1 hour), then 0.04 * 50 = £2.
    // This seems correct for "Pro-rated" calculation.

    // Test Data:
    // Schedule S1: User U1, 10:00-11:00 (1 hour).
    // Schedule S2: User U1, 10:00-11:00 (1 hour).
    // PagerDuty Returns:
    const schedules = [
      {
        id: 'S1',
        name: 'S1',
        html_url: '',
        time_zone: 'UTC',
        final_schedule: {
          rendered_schedule_entries: [
            {
              start: '2026-01-03T00:00:00Z',
              end: '2026-01-04T00:00:00Z',
              user: { id: 'U1', summary: 'User 1' },
            },
          ],
        },
      },
      {
        id: 'S2',
        name: 'S2',
        html_url: '',
        time_zone: 'UTC',
        final_schedule: {
          rendered_schedule_entries: [
            {
              start: '2026-01-03T00:00:00Z',
              end: '2026-01-04T00:00:00Z',
              user: { id: 'U1', summary: 'User 1' },
            },
          ],
        },
      },
    ];

    mockGetMultipleSchedules.mockResolvedValue(schedules);

    const req = {
      json: async () => ({
        scheduleIds: ['S1', 'S2'],
        startDate: '2026-01-03T00:00:00Z',
        endDate: '2026-01-05T00:00:00Z',
        rates: { weekdayRate: 100, weekendRate: 200 },
      }),
    } as unknown as NextRequest;

    const res = await POST(req);
    const data = await res.json();
    // console.log(JSON.stringify(data, null, 2));

    expect(res.status).toBe(200);
    expect(data.reports).toHaveLength(2);

    const reportS1 = data.reports.find((r: ScheduleCompensationReport) => r.metadata.id === 'S1');
    const reportS2 = data.reports.find((r: ScheduleCompensationReport) => r.metadata.id === 'S2');

    expect(reportS1.employees).toHaveLength(1);
    expect(reportS2.employees).toHaveLength(1);

    // 1 hour overlapping.
    // OnCallPeriod Logic (mocked/real):
    // 1 hour overlap on Thursday (Jan 1 2026). Weekday.
    // `numberOfOohWeekDays` for 1 hour approx 1/24? Or usage of "OOH hours".
    // The API uses `period.numberOfOohWeekDays`.
    // If `OnCallPeriod` correctly calculates "0.0416" days.
    // Then `weekdayContrib` = 0.0416 / 2 = 0.0208.
    // Pay S1 = 0.0208 * 100 = 2.08.

    const emp1 = reportS1.employees[0];
    const emp2 = reportS2.employees[0];

    expect(emp1.isOverlapping).toBe(true);
    expect(emp2.isOverlapping).toBe(true);

    // Sum should equal paying for 1 hour once.
    // 1 hour approx = 0.041666 days.
    // Pay = 4.16.
    // Sum(S1+S2) should be 4.16.
    // S1 should be ~2.08.

    expect(emp1.totalCompensation).toBeGreaterThan(0);
    expect(emp1.weekendHours).toBeGreaterThan(0);

    // Verify split roughly equal
    expect(emp1.weekendHours).toBeCloseTo(emp2.weekendHours, 5);
  });
});
