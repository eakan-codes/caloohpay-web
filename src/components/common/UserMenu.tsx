import React, { useState } from 'react';
import { Avatar, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { Logout as LogoutIcon, Settings as SettingsIcon } from '@mui/icons-material';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import { ROUTES } from '@/lib/constants';
import {
  avatarButtonStyles,
  avatarStyles,
  menuTransformOrigin,
  menuAnchorOrigin,
  menuItemIconStyles,
} from './Header.styles';

interface UserMenuProps {
  session: Session | null;
  status: 'authenticated' | 'loading' | 'unauthenticated';
}

/**
 * User menu component with authentication state management
 */
export const UserMenu: React.FC<UserMenuProps> = ({ session, status }) => {
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

  if (status === 'authenticated' && session?.user) {
    return (
      <>
        <IconButton onClick={handleMenuOpen} sx={avatarButtonStyles} aria-label="account menu">
          <Avatar
            alt={session.user.name || 'User'}
            src={session.user.image || undefined}
            sx={avatarStyles}
          >
            {session.user.name?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={menuTransformOrigin}
          anchorOrigin={menuAnchorOrigin}
        >
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {session.user.email}
            </Typography>
          </MenuItem>
          <MenuItem component={Link} href={ROUTES.SETTINGS} onClick={handleMenuClose}>
            <SettingsIcon fontSize="small" sx={menuItemIconStyles} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleSignOut}>
            <LogoutIcon fontSize="small" sx={menuItemIconStyles} />
            Sign Out
          </MenuItem>
        </Menu>
      </>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Button variant="contained" color="secondary" component={Link} href={ROUTES.LOGIN}>
        Sign In
      </Button>
    );
  }

  return null;
};
