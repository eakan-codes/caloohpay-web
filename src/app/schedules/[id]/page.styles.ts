/**
 * Styles for Schedule Detail Page
 * Extracted from inline sx props for better maintainability
 */

import type { SxProps, Theme } from '@mui/material';
import { LAYOUT } from './constants';

// Page layout styles
export const pageContainer: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

export const contentContainer: SxProps<Theme> = {
  maxWidth: LAYOUT.MAX_WIDTH_DESKTOP,
  mx: 'auto',
  py: LAYOUT.PADDING_VERTICAL,
  flex: 1,
};

export const errorContentContainer: SxProps<Theme> = {
  maxWidth: LAYOUT.MAX_WIDTH_ERROR,
  mx: 'auto',
  mt: LAYOUT.MARGIN_VERTICAL_ERROR,
  mb: LAYOUT.MARGIN_VERTICAL_ERROR,
  flex: 1,
};

// Header styles
export const headerContainer: SxProps<Theme> = {
  mb: LAYOUT.MARGIN_BOTTOM_HEADER,
};

export const headerTopRow: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  mb: 2,
};

export const headerTitleContainer: SxProps<Theme> = {
  flex: 1,
};

// View mode toggle styles
export const viewModeContainer: SxProps<Theme> = {
  p: LAYOUT.PADDING_VIEW_MODE,
  mb: LAYOUT.MARGIN_BOTTOM_VIEW_MODE,
};

export const viewModeInner: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 2,
};

export const toggleButtonIcon: SxProps<Theme> = {
  mr: 1,
};

// Schedule display styles
export const scheduleDisplayContainer: SxProps<Theme> = {
  p: LAYOUT.PADDING_CARD,
  mb: LAYOUT.MARGIN_BOTTOM_SCHEDULE,
};

// OnCallSchedule component styles
export const loadingContainer: SxProps<Theme> = {
  position: 'relative',
  minHeight: LAYOUT.MIN_HEIGHT_LOADING,
};

export const scheduleTitle: SxProps<Theme> = {
  mb: 3,
};

export const userCardHeader: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  mb: 2,
  flexWrap: 'wrap',
  gap: 2,
};

export const userInfoContainer: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

export const chipsContainer: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  flexWrap: 'wrap',
};

export const dividerStyle: SxProps<Theme> = {
  my: 2,
};

export const periodEntryBox: SxProps<Theme> = {
  p: 1.5,
  bgcolor: 'action.hover',
  borderRadius: 1,
};

export const periodEntryInner: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: 1,
};

export const periodDateContainer: SxProps<Theme> = {
  flex: 1,
  minWidth: '200px',
};

export const periodChipsContainer: SxProps<Theme> = {
  display: 'flex',
  gap: 0.5,
  flexWrap: 'wrap',
  alignItems: 'center',
};

export const walletIconStyle: SxProps<Theme> = {
  fontSize: '16px !important',
};

export const compensationChipStyle: SxProps<Theme> = {
  fontWeight: 'medium',
};

// Actions styles
export const actionsContainer: SxProps<Theme> = {
  mt: LAYOUT.MARGIN_TOP_ACTIONS,
  display: 'flex',
  gap: 2,
};

// Error page styles
export const errorAlert: SxProps<Theme> = {
  mb: 2,
};

export const backButtonStyle: SxProps<Theme> = {
  mt: 2,
};
