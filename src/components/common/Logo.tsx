import React from 'react';
import { Box, Typography } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import {
  logoLinkStyles,
  logoBoxStyles,
  logoIconStyles,
  logoTypographyStyles,
} from './Header.styles';

/**
 * Logo component for the application header
 */
export const Logo: React.FC = () => (
  <Link href={ROUTES.HOME} style={logoLinkStyles}>
    <Box sx={logoBoxStyles}>
      <CalendarIcon sx={logoIconStyles} />
      <Typography variant="h6" noWrap sx={logoTypographyStyles}>
        CalOohPay
      </Typography>
    </Box>
  </Link>
);
