import { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { OAuthConfig } from 'next-auth/providers/oauth';

/**
 * PagerDuty OAuth Provider Configuration
 * Documentation: https://developer.pagerduty.com/docs/app-integration-development/oauth-2-functionality/
 */
const PagerDutyProvider: OAuthConfig<{
  user: { id: string; name: string; email: string; avatar_url: string };
}> = {
  id: 'pagerduty',
  name: 'PagerDuty',
  type: 'oauth' as const,
  version: '2.0',
  authorization: {
    url: 'https://app.pagerduty.com/oauth/authorize',
    params: {
      scope: 'read write', // Required scopes for schedule access
      response_type: 'code',
    },
  },
  token: 'https://app.pagerduty.com/oauth/token',
  userinfo: 'https://api.pagerduty.com/users/me',
  clientId: process.env.NEXT_PUBLIC_PAGERDUTY_CLIENT_ID,
  clientSecret: process.env.PAGERDUTY_CLIENT_SECRET,
  profile(profile: { user: { id: string; name: string; email: string; avatar_url: string } }) {
    return {
      id: profile.user.id,
      name: profile.user.name,
      email: profile.user.email,
      image: profile.user.avatar_url,
    };
  },
};

/**
 * NextAuth.js Configuration
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: AuthOptions = {
  providers: [PagerDutyProvider],

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
     * JWT Callback - Store PagerDuty access token in JWT
     */
    async jwt({ token, account, user }): Promise<JWT> {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        };
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
    const url = 'https://app.pagerduty.com/oauth/token';

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
