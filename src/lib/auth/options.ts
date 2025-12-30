import { AuthOptions, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { OAuthConfig } from 'next-auth/providers/oauth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PAGERDUTY_URLS } from '@/lib/constants';

declare module 'next-auth' {
  interface User extends DefaultUser {
    apiToken?: string;
  }
}

/**
 * PagerDuty OAuth Provider Configuration
 * Documentation: https://developer.pagerduty.com/docs/app-integration-development/oauth-2-functionality/
 */
const PagerDutyProvider: OAuthConfig<{
  user_id: string;
  account_id: string;
  subdomain: string;
}> = {
  id: 'pagerduty',
  name: 'PagerDuty',
  type: 'oauth' as const,
  version: '2.0',
  authorization: {
    url: `${PAGERDUTY_URLS.OAUTH_BASE}/authorize`,
    params: {
      scope: 'read openid', // Changed from 'read write' to 'read openid' for OIDC - write scope not needed as app only reads data
      response_type: 'code',
    },
  },
  token: `${PAGERDUTY_URLS.OAUTH_BASE}/token`,
  userinfo: `${PAGERDUTY_URLS.OAUTH_BASE}/userinfo`,
  issuer: `${PAGERDUTY_URLS.OAUTH_BASE}/anonymous`,
  jwks_endpoint: `${PAGERDUTY_URLS.OAUTH_BASE}/anonymous/jwks`,
  idToken: true,
  checks: ['state'],
  clientId: process.env.NEXT_PUBLIC_PAGERDUTY_CLIENT_ID,
  clientSecret: process.env.PAGERDUTY_CLIENT_SECRET,
  async profile(profile: { user_id: string }, tokens: { access_token?: string }) {
    try {
      // PagerDuty OIDC returns user_id directly in the profile
      // We need to fetch full user details from the REST API
      if (!profile?.user_id) {
        throw new Error('Missing user_id in OIDC profile');
      }

      if (!tokens?.access_token) {
        throw new Error('Missing access_token for profile fetch');
      }

      const response = await fetch(`${PAGERDUTY_URLS.API_BASE}/users/${profile.user_id}`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: 'application/vnd.pagerduty+json;version=2',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data?.user) {
        throw new Error('Invalid user profile response from PagerDuty API');
      }

      return {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        image: data.user.avatar_url,
      };
    } catch (error) {
      console.error('Error fetching PagerDuty user profile:', error);
      throw new Error(
        `Failed to retrieve user profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

/**
 * PagerDuty API Token Provider Configuration
 * Allows users to authenticate with their PagerDuty User API Token
 */
const PagerDutyAPITokenProvider = CredentialsProvider({
  id: 'pagerduty-token',
  name: 'PagerDuty API Token',
  credentials: {
    apiToken: {
      label: 'API Token',
      type: 'password',
      placeholder: 'Enter your PagerDuty API Token',
    },
  },
  async authorize(credentials) {
    if (!credentials?.apiToken) {
      return null;
    }

    try {
      // Verify the API token by fetching the user's profile
      const response = await fetch(`${PAGERDUTY_URLS.API_BASE}/users/me`, {
        headers: {
          Authorization: `Token token=${credentials.apiToken}`,
          Accept: 'application/vnd.pagerduty+json;version=2',
        },
      });

      if (!response.ok) {
        console.error('PagerDuty API Token validation failed:', response.status);
        return null;
      }

      const data = await response.json();
      const user = data.user;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.avatar_url,
        // Store the API token for use in API calls
        apiToken: credentials.apiToken,
      };
    } catch (error) {
      console.error('Error validating PagerDuty API token:', error);
      return null;
    }
  },
});

/**
 * NextAuth.js Configuration
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: AuthOptions = {
  providers: [PagerDutyProvider, PagerDutyAPITokenProvider],

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    /**
     * JWT Callback - Store PagerDuty access token or API token in JWT
     */
    async jwt({ token, account, user }): Promise<JWT> {
      // Initial sign in
      if (account && user) {
        // Check if this is API token login (credentials provider)
        if (account.type === 'credentials') {
          return {
            ...token,
            accessToken: user.apiToken,
            authMethod: 'api-token',
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
          };
        }

        // OAuth login
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
          authMethod: 'oauth',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        };
      }

      // API token authentication doesn't expire
      if (token.authMethod === 'api-token') {
        return token;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },

    /**
     * Session Callback - Send properties to the client
     */
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      session.accessToken = token.accessToken as string;
      session.authMethod = token.authMethod as 'oauth' | 'api-token' | undefined;
      session.error = token.error as string | undefined;

      return session;
    },
  },

  events: {
    async signOut({ token }) {
      // Optionally revoke the token with PagerDuty
      console.log('User signed out:', token.user);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = `${PAGERDUTY_URLS.OAUTH_BASE}/token`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_PAGERDUTY_CLIENT_ID!,
        client_secret: process.env.PAGERDUTY_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
