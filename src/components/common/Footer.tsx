'use client';

import { Box, Container, Link as MUILink, Stack, Typography } from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { APP_METADATA } from '@/lib/constants';

export function Footer() {
  // Use a fixed year initially to avoid hydration mismatch
  const [currentYear, setCurrentYear] = useState(2025);

  // Update year after hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[900],
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} {APP_METADATA.NAME} v{APP_METADATA.VERSION}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <MUILink
              component={Link}
              href={APP_METADATA.REPOSITORY}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <GitHubIcon fontSize="small" />
              <Typography variant="body2">Source Code</Typography>
            </MUILink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
