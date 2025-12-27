/**
 * Constants for Schedule Detail Page
 * Centralized configuration values for maintainability
 */

/**
 * Layout and spacing constants
 */
export const LAYOUT = {
  /** Maximum width for main content container (px) */
  MAX_WIDTH_DESKTOP: 1200,
  /** Maximum width for error content container (px) */
  MAX_WIDTH_ERROR: 800,
  /** Minimum height for loading container (px) */
  MIN_HEIGHT_LOADING: 300,
  /** Vertical padding for main content (theme spacing units) */
  PADDING_VERTICAL: 4,
  /** Vertical margin for error content (theme spacing units) */
  MARGIN_VERTICAL_ERROR: 4,
  /** Bottom margin for header (theme spacing units) */
  MARGIN_BOTTOM_HEADER: 4,
  /** Bottom margin for view mode container (theme spacing units) */
  MARGIN_BOTTOM_VIEW_MODE: 3,
  /** Bottom margin for schedule display (theme spacing units) */
  MARGIN_BOTTOM_SCHEDULE: 3,
  /** Padding for card/paper components (theme spacing units) */
  PADDING_CARD: 3,
  /** Padding for view mode container (theme spacing units) */
  PADDING_VIEW_MODE: 2,
  /** Top margin for actions container (theme spacing units) */
  MARGIN_TOP_ACTIONS: 4,
} as const;

/**
 * View mode options for schedule display
 */
export enum ViewMode {
  /** List view - shows on-call periods in expandable cards */
  List = 'list',
  /** Calendar view - displays schedule in monthly calendar format */
  Calendar = 'calendar',
}

/**
 * Type-safe view mode type
 */
export type ViewModeType = `${ViewMode}`;
