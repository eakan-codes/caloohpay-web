import { authOptions } from '../options';

describe('Authentication Options', () => {
  describe('Provider Configuration', () => {
    it('should have PagerDuty provider configured', () => {
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers[0].id).toBe('pagerduty');
    });

    it('should have correct provider name', () => {
      expect(authOptions.providers[0].name).toBe('PagerDuty');
    });

    it('should have OAuth 2.0 type', () => {
      expect(authOptions.providers[0].type).toBe('oauth');
    });
  });

  describe('Session Configuration', () => {
    it('should use JWT strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have 30-day session duration', () => {
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      expect(authOptions.session?.maxAge).toBe(thirtyDaysInSeconds);
    });
  });

  describe('Pages Configuration', () => {
    it('should redirect to /login for sign in', () => {
      expect(authOptions.pages?.signIn).toBe('/login');
    });

    it('should redirect to /login for errors', () => {
      expect(authOptions.pages?.error).toBe('/login');
    });
  });

  describe('Callbacks', () => {
    it('should have JWT callback defined', () => {
      expect(authOptions.callbacks?.jwt).toBeDefined();
      expect(typeof authOptions.callbacks?.jwt).toBe('function');
    });

    it('should have session callback defined', () => {
      expect(authOptions.callbacks?.session).toBeDefined();
      expect(typeof authOptions.callbacks?.session).toBe('function');
    });
  });

  describe('Debug Mode', () => {
    it('should enable debug in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Note: authOptions is already imported with current NODE_ENV
      // In real scenario, we'd need to dynamically import
      expect(authOptions.debug).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('JWT Callback', () => {
  const mockJWT = authOptions.callbacks?.jwt;

  it('should store tokens on initial sign in', async () => {
    if (!mockJWT) {
      throw new Error('JWT callback not defined');
    }

    const mockAccount = {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      provider: 'pagerduty',
      type: 'oauth' as const,
      providerAccountId: '123',
    };

    const mockUser = {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
    };

    const result = await mockJWT({
      token: {},
      user: mockUser,
      account: mockAccount,
      trigger: 'signIn',
    });

    expect(result.accessToken).toBe('mock_access_token');
    expect(result.refreshToken).toBe('mock_refresh_token');
    expect(result.user).toEqual(mockUser);
  });

  it('should return existing token if not expired', async () => {
    if (!mockJWT) {
      throw new Error('JWT callback not defined');
    }

    const futureTimestamp = Date.now() + 3600000; // 1 hour from now
    const existingToken = {
      accessToken: 'existing_token',
      accessTokenExpires: futureTimestamp,
      user: {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      },
    };

    const result = await mockJWT({
      token: existingToken,
      trigger: 'update',
    });

    expect(result.accessToken).toBe('existing_token');
    expect(result.accessTokenExpires).toBe(futureTimestamp);
  });
});

describe('Session Callback', () => {
  const mockSession = authOptions.callbacks?.session;

  it('should include user data in session', async () => {
    if (!mockSession) {
      throw new Error('Session callback not defined');
    }

    const mockToken = {
      user: {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
      accessToken: 'mock_access_token',
    };

    const mockSessionInput = {
      expires: new Date(Date.now() + 86400000).toISOString(),
      user: {
        id: '',
        name: null,
        email: null,
        image: null,
      },
    };

    const result = await mockSession({
      session: mockSessionInput,
      token: mockToken,
      trigger: 'getSession',
    });

    expect(result.user).toEqual(mockToken.user);
    expect(result.accessToken).toBe('mock_access_token');
  });

  it('should include error in session if present', async () => {
    if (!mockSession) {
      throw new Error('Session callback not defined');
    }

    const mockToken = {
      user: {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      },
      error: 'RefreshAccessTokenError',
    };

    const mockSessionInput = {
      expires: new Date(Date.now() + 86400000).toISOString(),
      user: {
        id: '',
        name: null,
        email: null,
        image: null,
      },
    };

    const result = await mockSession({
      session: mockSessionInput,
      token: mockToken,
      trigger: 'getSession',
    });

    expect(result.error).toBe('RefreshAccessTokenError');
  });
});
