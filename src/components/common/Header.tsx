'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  CalendarMonth as CalendarIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useThemeMode } from '@/context/ThemeContext';
import { ROUTES } from '@/lib/constants';

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
  const { mode, toggleTheme } = useThemeMode();
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleMenuClose();
    await signOut({ callbackUrl: ROUTES.HOME });
  };

  return (
    <ElevationScroll>
      <AppBar position="sticky" elevation={elevation}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo */}
            <Link href={ROUTES.HOME} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon sx={{ fontSize: 28 }} />
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    fontWeight: 700,
                    color: 'inherit',
                  }}
                >
                  CalOohPay
                </Typography>
              </Box>
            </Link>

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Navigation Links */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {status === 'authenticated' && (
                <Button color="inherit" component={Link} href={ROUTES.SCHEDULES}>
                  Schedules
                </Button>
              )}

              {/* Dark Mode Toggle */}
              <IconButton
                onClick={toggleTheme}
                color="inherit"
                aria-label="toggle theme"
                suppressHydrationWarning
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              {/* Auth Section */}
              {status === 'authenticated' && session?.user ? (
                <>
                  <IconButton onClick={handleMenuOpen} sx={{ p: 0 }} aria-label="account menu">
                    <Avatar
                      alt={session.user.name || 'User'}
                      src={session.user.image || undefined}
                      sx={{ width: 36, height: 36 }}
                    >
                      {session.user.name?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {session.user.email}
                      </Typography>
                    </MenuItem>
                    <MenuItem component={Link} href={ROUTES.SETTINGS} onClick={handleMenuClose}>
                      <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                      Settings
                    </MenuItem>
                    <MenuItem onClick={handleSignOut}>
                      <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : status === 'unauthenticated' ? (
                <Button variant="contained" color="secondary" component={Link} href={ROUTES.LOGIN}>
                  Sign In
                </Button>
              ) : null}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
}
