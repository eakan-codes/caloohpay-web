import 'next-auth';
import 'next-auth/jwt';

/**
 * Extended types for NextAuth to include PagerDuty-specific fields
 */
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    authMethod?: 'oauth' | 'api-token';
    error?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    authMethod?: 'oauth' | 'api-token';
    error?: string;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
