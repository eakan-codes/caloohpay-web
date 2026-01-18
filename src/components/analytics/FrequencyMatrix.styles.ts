/**
 * Styles for FrequencyMatrix component
 */

import type { SxProps, Theme } from '@mui/material';

export const container: SxProps<Theme> = {
  padding: 3,
  marginBottom: 3,
};

export const heatmapContainer: SxProps<Theme> = {
  overflowX: 'auto',
  overflowY: 'hidden',
  marginBottom: 2,
};

export const hourLabelsContainer: SxProps<Theme> = {
  display: 'flex',
  marginBottom: 0.5,
};

export const cornerCell: SxProps<Theme> = {
  width: 60,
  flexShrink: 0,
};

export const hourLabel: SxProps<Theme> = {
  width: 30,
  flexShrink: 0,
  textAlign: 'center',
  fontSize: '0.7rem',
  color: 'text.secondary',
};

export const gridRow: SxProps<Theme> = {
  display: 'flex',
  marginBottom: 0.5,
};

export const dayLabel: SxProps<Theme> = {
  width: 60,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.875rem',
  fontWeight: 500,
  paddingRight: 1,
};

export const gridCell: SxProps<Theme> = {
  width: 30,
  height: 30,
  flexShrink: 0,
  border: '1px solid',
  borderColor: 'divider',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'scale(1.1)',
    zIndex: 1,
    boxShadow: 2,
  },
};

export const cellText: SxProps<Theme> = {
  fontSize: '0.65rem',
  fontWeight: 600,
  color: 'white',
  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
};

export const legendContainer: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 3,
};

export const legendGradient: SxProps<Theme> = {
  width: 200,
  height: 20,
  background: (theme: Theme) =>
    `linear-gradient(to right, ${theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5'}, ${theme.palette.primary.main})`,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
};
