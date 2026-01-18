/**
 * Styles for BurdenDistribution component
 */

import type { SxProps, Theme } from '@mui/material';

export const container: SxProps<Theme> = {
  padding: 3,
  marginBottom: 3,
};

export const chartContainer: SxProps<Theme> = {
  width: '100%',
  height: 400,
  marginTop: 2,
};

export const emptyState: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 200,
};

export const tooltipContainer: SxProps<Theme> = {
  padding: 1.5,
  backgroundColor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
};

export const summaryContainer: SxProps<Theme> = {
  marginTop: 3,
  paddingTop: 2,
  borderTop: '1px solid',
  borderColor: 'divider',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 2,
};
