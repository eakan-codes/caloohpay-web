import { SxProps, Theme } from '@mui/material';

/**
 * Logo link container styles
 */
export const logoLinkStyles: React.CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
};

/**
 * Logo box container styles
 */
export const logoBoxStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

/**
 * Logo icon styles
 */
export const logoIconStyles: SxProps<Theme> = {
  fontSize: 28,
};

/**
 * Logo typography styles
 */
export const logoTypographyStyles: SxProps<Theme> = {
  fontWeight: 700,
  color: 'inherit',
};

/**
 * Spacer to push content to the right
 */
export const spacerStyles: SxProps<Theme> = {
  flexGrow: 1,
};

/**
 * Navigation container styles
 */
export const navigationStyles: SxProps<Theme> = {
  display: 'flex',
  gap: 2,
  alignItems: 'center',
};

/**
 * Avatar button styles
 */
export const avatarButtonStyles: SxProps<Theme> = {
  p: 0,
};

/**
 * Avatar styles
 */
export const avatarStyles: SxProps<Theme> = {
  width: 36,
  height: 36,
};

/**
 * Menu transform origin
 */
export const menuTransformOrigin = {
  horizontal: 'right' as const,
  vertical: 'top' as const,
};

/**
 * Menu anchor origin
 */
export const menuAnchorOrigin = {
  horizontal: 'right' as const,
  vertical: 'bottom' as const,
};

/**
 * Menu item icon styles
 */
export const menuItemIconStyles: SxProps<Theme> = {
  mr: 1,
};
