/**
 * Styles for RotationStripPlot component
 */

import type { SxProps, Theme } from '@mui/material';

export const container: SxProps<Theme> = {
  p: 3,
  mb: 3,
  borderRadius: 2,
  boxShadow: 1,
};

export const timelineContainer: SxProps<Theme> = {
  width: '100%',
  overflow: 'auto',
  minHeight: 300,
};

export const timelineHeader: SxProps<Theme> = {
  display: 'flex',
  mb: 2,
  pb: 1,
  borderBottom: 1,
  borderColor: 'divider',
};

export const userLabelColumn: SxProps<Theme> = {
  width: 150,
  minWidth: 150,
  pr: 2,
  display: 'flex',
  alignItems: 'center',
};

export const timelineAxis: SxProps<Theme> = {
  flex: 1,
  position: 'relative',
  height: 30,
  minWidth: 600,
};

export const userRow: SxProps<Theme> = {
  display: 'flex',
  mb: 2,
  '&:last-child': {
    mb: 0,
  },
};

export const userLabel: SxProps<Theme> = {
  width: 150,
  minWidth: 150,
  pr: 2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

export const timelineTrack: SxProps<Theme> = {
  flex: 1,
  position: 'relative',
  height: 40,
  backgroundColor: 'action.hover',
  borderRadius: 1,
  minWidth: 600,
};

export const shiftBlock: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  height: '100%',
  borderRadius: 1,
  transition: 'opacity 0.2s',
};
