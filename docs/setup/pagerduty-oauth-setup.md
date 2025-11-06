# PagerDuty OAuth Setup Guide

This guide explains how to acquire the necessary PagerDuty OAuth credentials for the CaloohPay application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step-by-Step Setup](#step-by-step-setup)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Prerequisites

Before you begin, ensure you have:

1. A PagerDuty account with administrative access
2. Permission to create OAuth applications in your PagerDuty account
3. Access to your development environment to set environment variables

## Step-by-Step Setup

### 1. Access PagerDuty Developer Portal

1. Log in to your PagerDuty account
2. Navigate to **User Icon (top right)** → **My Profile**
3. Click on **User Settings** in the left sidebar
4. Select **Developer Apps**

Alternatively, you can directly access: `https://[your-subdomain].pagerduty.com/developer/applications`

### 2. Create a New OAuth Application

1. Click the **Create New App** button
2. Fill in the application details:
   - **App Name**: `CaloohPay` (or your preferred name)
   - **Brief Description**: `On-call payment calculator for PagerDuty schedules`
   - **Category**: Select `Reporting` or `Developer Tools`
   - **Published**: Leave unchecked (for internal use)

### 3. Configure OAuth Settings

#### Redirect URLs

Add the following redirect URLs based on your environment:

**For Local Development:**

```
http://localhost:3000/api/auth/callback/pagerduty
```

**For Production:**

```
https://your-domain.com/api/auth/callback/pagerduty
```

> ⚠️ **Important**: The redirect URL must match exactly, including the protocol (http/https) and port number.

#### OAuth Scopes

Request the following scopes for your application:

- **Read Access**:
  - `read` - General read access to PagerDuty data
  - `schedules.read` - Read access to on-call schedules
  - `users.read` - Read access to user information
  - `escalation_policies.read` - Read escalation policies
  - `teams.read` - Read team information

- **Write Access** (Optional, for future features):
  - `write` - General write access (only if you plan to modify data)

> 💡 **Tip**: Start with read-only scopes. You can always add more scopes later if needed.

### 4. Save and Retrieve Credentials

1. Click **Save** to create the application
2. You will be shown:
   - **Client ID** - A public identifier for your application
   - **Client Secret** - A confidential secret (only shown once!)

> ⚠️ **Critical**: Copy the **Client Secret** immediately! It will only be displayed once. If you lose it, you'll need to regenerate it.

### 5. Configure Your Application

Copy the credentials and add them to your `.env.local` file:

```env
# PagerDuty OAuth Configuration
PAGERDUTY_CLIENT_ID=your_client_id_here
PAGERDUTY_CLIENT_SECRET=your_client_secret_here
```

For the complete environment configuration, see [Environment Variables](#environment-variables) below.

## Environment Variables

Your `.env.local` file should include the following PagerDuty-related variables:

```env
# PagerDuty OAuth Configuration
PAGERDUTY_CLIENT_ID=<your_client_id>
PAGERDUTY_CLIENT_SECRET=<your_client_secret>

# NextAuth Configuration (required for OAuth flow)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate_with: openssl rand -base64 32>

# Optional: PagerDuty API Configuration
PAGERDUTY_API_BASE=https://api.pagerduty.com
```

### How to Generate NEXTAUTH_SECRET

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET` value.

## Troubleshooting

### Common Issues

#### 1. "Invalid Redirect URI" Error

**Problem**: After clicking "Sign in with PagerDuty", you see an error about invalid redirect URI.

**Solution**:

- Verify the redirect URL in your PagerDuty app matches exactly:
  - Development: `http://localhost:3000/api/auth/callback/pagerduty`
  - Production: `https://your-domain.com/api/auth/callback/pagerduty`
- Check for trailing slashes (should NOT have one)
- Ensure protocol matches (http vs https)
- Verify port number is included for local development

#### 2. "Access Denied" After Authorization

**Problem**: PagerDuty authorization succeeds, but the app shows "Access Denied".

**Solution**:

- Verify all required scopes are enabled in your PagerDuty app
- Minimum required: `read`, `schedules.read`, `users.read`
- Try revoking and re-authorizing the application

#### 3. "Invalid Client Secret" Error

**Problem**: Authentication fails with invalid client secret error.

**Solution**:

- Double-check the `PAGERDUTY_CLIENT_SECRET` in your `.env.local`
- Ensure there are no extra spaces or line breaks
- If lost, regenerate the secret in PagerDuty Developer Apps
- Restart your development server after changing environment variables

#### 4. Token Expires Immediately

**Problem**: Users are repeatedly asked to re-authenticate.

**Solution**:

- Verify `NEXTAUTH_SECRET` is set and not empty
- Check token refresh is working (see NextAuth configuration)
- Ensure cookies are enabled in your browser
- Clear browser cookies and try again

### Debug Mode

To enable detailed OAuth debugging:

1. Add to your `.env.local`:

   ```env
   NEXTAUTH_DEBUG=true
   ```

2. Restart your development server

3. Check the console for detailed authentication logs

## Security Considerations

### Protecting Your Credentials

1. **Never commit secrets to version control**:
   - `.env.local` should be in `.gitignore`
   - Use environment variables in production
   - Consider using a secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)

2. **Regenerate secrets if exposed**:
   - If your Client Secret is accidentally committed, regenerate it immediately
   - Update all environments with the new secret

3. **Scope Principle of Least Privilege**:
   - Only request OAuth scopes you actually need
   - Remove unused scopes to minimize security risk

4. **Rotate secrets regularly**:
   - Consider rotating OAuth secrets every 90-180 days
   - Update documentation when rotating credentials

### Production Deployment

When deploying to production:

1. Use environment-specific OAuth apps (separate Dev/Prod apps)
2. Set production redirect URLs to your actual domain
3. Use HTTPS for all production redirect URLs
4. Store secrets in your hosting provider's environment variables:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Build & Deploy → Environment
   - AWS: Parameter Store or Secrets Manager
   - Azure: Key Vault or App Configuration

### Monitoring

Monitor your PagerDuty OAuth usage:

1. Check PagerDuty Developer Apps → Your App → **Analytics**
2. Review authentication logs in your application
3. Set up alerts for authentication failures
4. Monitor token refresh rates

## Additional Resources

- [PagerDuty OAuth 2.0 Documentation](https://developer.pagerduty.com/docs/ZG9jOjExMDI5NTU0-o-auth-2-0)
- [PagerDuty API Reference](https://developer.pagerduty.com/api-reference/)
- [NextAuth.js PagerDuty Provider](https://next-auth.js.org/providers/pagerduty)
- [NextAuth Configuration Guide](../configuration/nextauth-setup.md)

## Next Steps

After setting up PagerDuty OAuth:

1. Review the [NextAuth Configuration Guide](../configuration/nextauth-setup.md)
2. Test the authentication flow locally
3. Read the [Contributing Guide](../contributing/getting-started.md)
4. Explore the [Architecture Documentation](../architecture/overview.md) (if available)

## Support

If you encounter issues not covered in this guide:

1. Check existing [GitHub Issues](../../issues)
2. Review [NextAuth.js Debugging](https://next-auth.js.org/configuration/options#debug)
3. Consult [PagerDuty Support](https://support.pagerduty.com/)
4. Create a new issue with:
   - Error messages (redact secrets!)
   - Steps to reproduce
   - Environment details (Node version, OS, browser)
