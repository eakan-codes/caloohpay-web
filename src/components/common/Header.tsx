'use client';

import React from 'react';
import { AppBar, Box, Container, Toolbar, useScrollTrigger } from '@mui/material';
import { useSession } from 'next-auth/react';
import { Logo } from './Logo';
import { NavigationLinks } from './NavigationLinks';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { spacerStyles, navigationStyles } from './Header.styles';

interface HeaderProps {
  elevation?: number;
}

interface ElevationScrollProps {
  children: React.ReactElement<{ elevation?: number }>;
}

function ElevationScroll({ children }: ElevationScrollProps) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

export function Header({ elevation }: HeaderProps) {
  const { data: session, status } = useSession();

  return (
    <ElevationScroll>
      <AppBar position="sticky" elevation={elevation}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Logo />

            <Box sx={spacerStyles} />

            <Box sx={navigationStyles}>
              <NavigationLinks isAuthenticated={status === 'authenticated'} />
              <ThemeToggle />
              <UserMenu session={session} status={status} />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
}
