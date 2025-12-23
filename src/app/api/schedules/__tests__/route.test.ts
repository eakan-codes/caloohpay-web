import { jest, describe, beforeAll, beforeEach, it, expect } from '@jest/globals';

// Mock next-auth before any imports that use it
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth/options', () => ({
  authOptions: {},
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => {
      const response = {
        status: init?.status || 200,
        json: async () => data,
        data,
      };
      return response;
    },
  },
}));

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Helper to create a mock NextRequest
interface MockNextRequest {
  url: string;
  nextUrl: URL;
  method: string;
  headers: Map<string, string>;
}

function createMockRequest(url: string): MockNextRequest {
  return {
    url,
    nextUrl: new URL(url),
    method: 'GET',
    headers: new Map(),
  };
}

describe('/api/schedules', () => {
  // Dynamically import after mocks are set up
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let GET: any;
  let getServerSession: jest.MockedFunction<typeof import('next-auth').getServerSession>;

  beforeAll(async () => {
    const routeModule = await import('../route');
    GET = routeModule.GET;
    getServerSession = (await import('next-auth')).getServerSession as jest.MockedFunction<
      typeof import('next-auth').getServerSession
    >;
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const request = createMockRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when session has no access token', async () => {
      getServerSession.mockResolvedValue({
        user: { id: '123', email: 'test@example.com' },
      });

      const request = createMockRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should fetch schedules from PagerDuty successfully with OAuth and pagination', async () => {
      const mockSchedules = [
        {
          id: 'SCHEDULE1',
          name: 'Engineering On-Call',
          description: 'Main engineering rotation',
          time_zone: 'America/New_York',
        },
        {
          id: 'SCHEDULE2',
          name: 'Support Team',
          description: 'Customer support rotation',
          time_zone: 'UTC',
        },
      ];

      getServerSession.mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_oauth_token',
        authMethod: 'oauth',
      });

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => ({ schedules: mockSchedules, more: false }),
      } as Response);

      const request = createMockRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schedules).toEqual(mockSchedules);
      expect(data.total).toBe(2);
      expect(data.limit).toBe(16);
      expect(data.offset).toBe(0);
      expect(data.more).toBe(false);

      // Verify PagerDuty API was called with Bearer token for OAuth
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.pagerduty.com/schedules'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock_oauth_token',
            Accept: 'application/vnd.pagerduty+json;version=2',
          }),
        })
      );
    });

    it('should fetch schedules from PagerDuty successfully with API Token', async () => {
      const mockSchedules = [
        {
          id: 'SCHEDULE1',
          name: 'Engineering On-Call',
          description: 'Main engineering rotation',
          time_zone: 'America/New_York',
        },
      ];

      getServerSession.mockResolvedValue({
        user: { id: '456' },
        accessToken: 'mock_api_token',
        authMethod: 'api-token',
      });

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => ({ schedules: mockSchedules, more: false }),
      } as Response);

      const request = createMockRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schedules).toEqual(mockSchedules);
      expect(data.total).toBe(1);
      expect(data.limit).toBe(16);
      expect(data.offset).toBe(0);

      // Verify PagerDuty API was called with Token format for API Token
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.pagerduty.com/schedules'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Token token=mock_api_token',
            Accept: 'application/vnd.pagerduty+json;version=2',
          }),
        })
      );
    });

    it('should handle PagerDuty API errors with OAuth', async () => {
      getServerSession.mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_oauth_token',
        authMethod: 'oauth',
      });

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: { message: 'PagerDuty service unavailable' },
        }),
      } as Response);

      const request = createMockRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch schedules');
      expect(data.message).toBe('PagerDuty service unavailable');
    });

    it('should handle PagerDuty API errors with API Token', async () => {
      getServerSession.mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_api_token',
        authMethod: 'api-token',
      });

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: { message: 'PagerDuty service unavailable' },
        }),
      } as Response);

      const request = createMockRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch schedules');
      expect(data.message).toBe('PagerDuty service unavailable');
    });

    it('should handle 401 from PagerDuty (expired token)', async () => {
      getServerSession.mockResolvedValue({
        user: { id: '123' },
        accessToken: 'expired_token',
      });

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } }),
      } as Response);

      const request = createMockRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(data.message).toBe('Invalid or expired PagerDuty token');
    });

    it('should pass query parameter to PagerDuty API', async () => {
      getServerSession.mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_access_token',
      });

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => ({ schedules: [], more: false }),
      } as Response);

      const request = createMockRequest('http://localhost:3000/api/schedules?query=engineering');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('query=engineering'),
        expect.any(Object)
      );
    });

    it('should pass pagination parameters to PagerDuty API', async () => {
      getServerSession.mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_access_token',
      });

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => ({ schedules: [], more: false }),
      } as Response);

      const request = createMockRequest('http://localhost:3000/api/schedules?limit=16&offset=16');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.limit).toBe(16);
      expect(data.offset).toBe(16);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/limit=16.*offset=16|offset=16.*limit=16/),
        expect.any(Object)
      );
    });

    it('should handle network errors', async () => {
      getServerSession.mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_access_token',
      });

      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
        new Error('Network error')
      );

      const request = createMockRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(data.message).toBe('Network error');
    });

    it('should return empty array when no schedules exist', async () => {
      getServerSession.mockResolvedValue({
        user: { id: '123' },
        accessToken: 'mock_access_token',
      });

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => ({ schedules: [], more: false }),
      } as Response);

      const request = createMockRequest('http://localhost:3000/api/schedules');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schedules).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.limit).toBe(16);
      expect(data.offset).toBe(0);
    });
  });
});
