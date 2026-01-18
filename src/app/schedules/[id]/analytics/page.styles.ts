/**
 * Styles for Analytics Page
 */

import type { SxProps, Theme } from '@mui/material';

export const pageContainer: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

export const contentContainer: SxProps<Theme> = {
  flex: 1,
  maxWidth: 1400,
  margin: '0 auto',
  padding: 4,
  width: '100%',
};

export const headerContainer: SxProps<Theme> = {
  padding: 3,
  marginBottom: 4,
};

export const loadingContainer: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 400,
};
