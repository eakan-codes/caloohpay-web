/**
 * Utility functions for PagerDuty authentication
 */

/**
 * Get the appropriate Authorization header for PagerDuty API calls
 * Supports both OAuth Bearer tokens and User API tokens
 *
 * @param accessToken - The access token from the session
 * @param authMethod - The authentication method ('oauth' or 'api-token')
 * @returns Authorization header value
 */
export function getPagerDutyAuthHeader(
  accessToken: string,
  authMethod?: 'oauth' | 'api-token'
): string {
  // If authMethod is explicitly api-token, use Token format
  if (authMethod === 'api-token') {
    return `Token token=${accessToken}`;
  }

  // Default to OAuth Bearer token (for OAuth or when authMethod is undefined)
  return `Bearer ${accessToken}`;
}

/**
 * Get headers for PagerDuty API requests
 *
 * @param accessToken - The access token from the session
 * @param authMethod - The authentication method ('oauth' or 'api-token')
 * @returns Headers object for fetch requests
 */
export function getPagerDutyHeaders(
  accessToken: string,
  authMethod?: 'oauth' | 'api-token'
): HeadersInit {
  return {
    Authorization: getPagerDutyAuthHeader(accessToken, authMethod),
    Accept: 'application/vnd.pagerduty+json;version=2',
    'Content-Type': 'application/json',
  };
}
