'use client';

import { Suspense, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Alert,
  TextField,
  Tab,
  Tabs,
} from '@mui/material';
import { Login as LoginIcon, VpnKey as ApiKeyIcon } from '@mui/icons-material';
import { Loading } from '@/components/common';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'oauth' | 'token'>('oauth');
  const [apiToken, setApiToken] = useState('');
  const [tokenError, setTokenError] = useState('');

  const errorParam = searchParams.get('error');

  // Compute error message from URL param
  const error = errorParam
    ? (() => {
        const errorMessages: Record<string, string> = {
          OAuthSignin: 'Error starting OAuth sign in',
          OAuthCallback: 'Error handling OAuth callback',
          OAuthCreateAccount: 'Error creating OAuth account',
          EmailCreateAccount: 'Error creating email account',
          Callback: 'Error in OAuth callback',
          OAuthAccountNotLinked: 'Account already exists with different provider',
          EmailSignin: 'Error sending email',
          CredentialsSignin: 'Invalid credentials',
          SessionRequired: 'Please sign in to access this page',
          Default: 'An error occurred during authentication',
        };
        return errorMessages[errorParam] || errorMessages.Default;
      })()
    : null;

  useEffect(() => {
    // Redirect if already authenticated
    if (status === 'authenticated') {
      router.push('/schedules');
    }
  }, [status, router]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);

      await signIn('pagerduty', {
        callbackUrl: '/schedules',
      });
    } catch (err) {
      console.error('Sign in error:', err);
      // Error will be shown via URL params after redirect
      setIsLoading(false);
    }
  };

  const handleTokenSignIn = async () => {
    if (!apiToken.trim()) {
      setTokenError('Please enter your API token');
      return;
    }

    try {
      setIsLoading(true);
      setTokenError('');

      const result = await signIn('pagerduty-token', {
        apiToken: apiToken.trim(),
        callbackUrl: '/schedules',
        redirect: false,
      });

      if (result?.error) {
        setTokenError('Invalid API token. Please check and try again.');
        setIsLoading(false);
      } else if (result?.ok) {
        router.push('/schedules');
      }
    } catch (err) {
      console.error('Token sign in error:', err);
      setTokenError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication status
  if (status === 'loading') {
    return <Loading message="Checking authentication..." fullScreen />;
  }

  // Don't show login form if already authenticated (will redirect)
  if (status === 'authenticated') {
    return <Loading message="Redirecting to schedules..." fullScreen />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              {/* Logo/Title */}
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                textAlign="center"
                color="primary"
              >
                CalOohPay Web
              </Typography>

              <Typography variant="body1" textAlign="center" color="text.secondary">
                Sign in with your PagerDuty account to calculate on-call compensation
              </Typography>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {error}
                </Alert>
              )}

              {tokenError && (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {tokenError}
                </Alert>
              )}

              {/* Auth Method Tabs */}
              <Tabs
                value={authMethod}
                onChange={(_, newValue) => {
                  setAuthMethod(newValue);
                  setTokenError('');
                }}
                sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="OAuth Login" value="oauth" sx={{ flex: 1 }} />
                <Tab label="API Token" value="token" sx={{ flex: 1 }} />
              </Tabs>

              {/* OAuth Sign In */}
              {authMethod === 'oauth' && (
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<LoginIcon />}
                    onClick={handleSignIn}
                    disabled={isLoading}
                    sx={{ py: 1.5 }}
                  >
                    {isLoading ? 'Connecting to PagerDuty...' : 'Sign in with PagerDuty'}
                  </Button>

                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    By signing in, you authorize CalOohPay to access your PagerDuty schedules for
                    payment calculation purposes.
                  </Typography>

                  <Stack spacing={1} sx={{ pt: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      Required Permissions:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Read access to schedules
                      <br />
                      • Read access to user information
                      <br />• Read access to on-call schedules
                    </Typography>
                  </Stack>
                </Stack>
              )}

              {/* API Token Sign In */}
              {authMethod === 'token' && (
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    type="password"
                    label="PagerDuty User API Token"
                    placeholder="Enter your API token"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTokenSignIn();
                      }
                    }}
                    disabled={isLoading}
                    error={!!tokenError}
                    helperText="Find your API token in PagerDuty > User Icon > My Profile > User Settings > API Access"
                  />

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<ApiKeyIcon />}
                    onClick={handleTokenSignIn}
                    disabled={isLoading || !apiToken.trim()}
                    sx={{ py: 1.5 }}
                  >
                    {isLoading ? 'Verifying Token...' : 'Sign in with API Token'}
                  </Button>

                  <Alert severity="info" sx={{ width: '100%' }}>
                    <Typography variant="caption">
                      Using an API token is simpler than OAuth but requires manual token management.
                      Your token is stored securely and only used to access your PagerDuty data.
                    </Typography>
                  </Alert>

                  <Stack spacing={1} sx={{ pt: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      How to get your API Token:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      1. Log into PagerDuty
                      <br />
                      2. Click your user icon → My Profile
                      <br />
                      3. Go to User Settings tab
                      <br />
                      4. Scroll to API Access section
                      <br />
                      5. Create or copy your User API Token
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography
          variant="caption"
          color="white"
          sx={{ display: 'block', textAlign: 'center', mt: 3, opacity: 0.8 }}
        >
          Need help? Contact your administrator or visit our{' '}
          <a
            href="https://github.com/lonelydev/caloohpay"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white', textDecoration: 'underline' }}
          >
            documentation
          </a>
        </Typography>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading message="Loading..." fullScreen />}>
      <LoginForm />
    </Suspense>
  );
}
