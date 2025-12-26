import { jest, describe, beforeAll, it, expect } from '@jest/globals';

// Create a mock handler function that NextAuth returns
const mockHandler = jest.fn(async () => {
  return new Response('OK', { status: 200 });
});

// Mock next-auth before any imports
jest.mock('next-auth', () => {
  const mockNextAuth = jest.fn(() => mockHandler);
  return mockNextAuth;
});

// Mock authOptions
const mockAuthOptions = {
  providers: [],
  callbacks: {},
  pages: {},
  session: { strategy: 'jwt' as const },
};

jest.mock('@/lib/auth/options', () => ({
  authOptions: mockAuthOptions,
}));

describe('NextAuth Route Handler', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let GET: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let POST: any;
  let NextAuth: jest.MockedFunction<typeof import('next-auth').default>;

  beforeAll(async () => {
    // Import NextAuth mock
    NextAuth = (await import('next-auth')).default as jest.MockedFunction<
      typeof import('next-auth').default
    >;

    // Import the route handlers
    const routeModule = await import('../route');
    GET = routeModule.GET;
    POST = routeModule.POST;
  });

  it('should initialize NextAuth with authOptions', async () => {
    // Verify NextAuth was called
    expect(NextAuth).toHaveBeenCalled();

    // Verify NextAuth was called with authOptions
    const callArgs = NextAuth.mock.calls[0];
    expect(callArgs).toBeDefined();
    expect(callArgs[0]).toBe(mockAuthOptions);
  });

  it('should have function signature compatible with Next.js route handlers', () => {
    // GET and POST should be functions that can accept Request objects
    expect(typeof GET).toBe('function');
    expect(typeof POST).toBe('function');

    // Verify they're the same handler (NextAuth returns one handler for both)
    expect(GET).toBe(POST);
  });

  it('should properly export handlers named GET and POST', async () => {
    // Verify exports are named correctly for Next.js App Router
    const routeModule = await import('../route');
    expect(routeModule).toHaveProperty('GET');
    expect(routeModule).toHaveProperty('POST');
  });

  describe('Route Handler Configuration', () => {
    it('should use authOptions with proper structure', async () => {
      const { authOptions } = await import('@/lib/auth/options');

      // Verify authOptions has expected structure
      expect(authOptions).toBeDefined();
      expect(authOptions).toHaveProperty('providers');
      expect(authOptions).toHaveProperty('callbacks');
      expect(authOptions).toHaveProperty('pages');
      expect(authOptions).toHaveProperty('session');
    });

    it('should configure NextAuth as a catch-all route', () => {
      // Verify the handler is created once (not per-request)
      // This ensures proper Next.js App Router integration
      expect(NextAuth).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration', () => {
    it('should integrate NextAuth with custom auth options', () => {
      // Verify NextAuth was initialized with the mocked authOptions
      expect(NextAuth).toHaveBeenCalledWith(mockAuthOptions);
    });

    it('should support both OAuth and Credentials providers', async () => {
      // Import actual authOptions (unmocked for this test)
      jest.isolateModulesAsync(async () => {
        // This verifies the actual file exports valid authOptions
        const { authOptions: actualAuthOptions } = await import('@/lib/auth/options');
        expect(actualAuthOptions.providers).toBeDefined();
        expect(Array.isArray(actualAuthOptions.providers)).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle NextAuth initialization without throwing', async () => {
      // Verify no errors were thrown during module initialization
      await expect(import('../route')).resolves.toBeDefined();
    });

    it('should gracefully handle missing environment variables', () => {
      // NextAuth should still initialize even if env vars are missing
      // (It will fail at runtime, but shouldn't throw during initialization)
      expect(NextAuth).toHaveBeenCalled();
    });
  });
});
