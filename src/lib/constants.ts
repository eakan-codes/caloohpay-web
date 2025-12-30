/**
 * Application constants
 */

/**
 * Payment rates for on-call compensation
 */
export const PAYMENT_RATES = {
  WEEKDAY: 50, // £50 per weekday (Mon-Thu)
  WEEKEND: 75, // £75 per weekend (Fri-Sun)
  CURRENCY: 'GBP',
  CURRENCY_SYMBOL: '£',
} as const;

/**
 * Working hours configuration
 */
export const WORKING_HOURS = {
  START: 9, // 9:00 AM
  END: 17.5, // 5:30 PM (17:30)
  MINIMUM_OOH_DURATION_HOURS: 6, // Minimum 6 hours to count as OOH
} as const;

/**
 * Day of week constants (0 = Sunday, 6 = Saturday)
 */
export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

/**
 * Weekend days (Friday-Sunday for payment purposes)
 */
export const WEEKEND_DAYS = [
  DAYS_OF_WEEK.FRIDAY,
  DAYS_OF_WEEK.SATURDAY,
  DAYS_OF_WEEK.SUNDAY,
] as const;

/**
 * Weekday days (Monday-Thursday for payment purposes)
 */
export const WEEKDAY_DAYS = [
  DAYS_OF_WEEK.MONDAY,
  DAYS_OF_WEEK.TUESDAY,
  DAYS_OF_WEEK.WEDNESDAY,
  DAYS_OF_WEEK.THURSDAY,
] as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CALLBACK: '/api/auth/callback',
    SESSION: '/api/auth/session',
  },
  SCHEDULES: {
    LIST: '/api/schedules',
    DETAIL: (id: string) => `/api/schedules/${id}`,
    SEARCH: '/api/schedules/search',
  },
  PAYMENTS: {
    CALCULATE: '/api/payments/calculate',
    EXPORT: '/api/payments/export',
  },
} as const;

/**
 * PagerDuty API Base URLs
 * All OAuth/OIDC endpoints use OAUTH_BASE per PagerDuty's OIDC configuration
 */
export const PAGERDUTY_URLS = {
  OAUTH_BASE: 'https://app.pagerduty.com/global/oauth',
  API_BASE: 'https://api.pagerduty.com',
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SCHEDULES: '/schedules',
  SCHEDULE_DETAIL: (id: string) => `/schedules/${id}`,
  PAYMENTS: '/payments',
  DOCUMENTATION: 'https://github.com/lonelydev/caloohpay',
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  THEME_MODE: 'theme-mode',
  AUTH_TOKEN: 'auth-token',
  USER_PREFERENCES: 'user-preferences',
} as const;

/**
 * Default timezone fallback
 */
export const DEFAULT_TIMEZONE = 'UTC';

/**
 * Date format strings
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
  API: 'yyyy-MM-dd',
} as const;

/**
 * Application metadata
 */
export const APP_METADATA = {
  NAME: 'CalOohPay Web',
  VERSION: '0.1.0',
  DESCRIPTION: 'Calculate out-of-hours on-call compensation',
  REPOSITORY: 'https://github.com/yourusername/caloohpay-web',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid credentials',
  SCHEDULE_NOT_FOUND: 'Schedule not found',
  CALCULATION_FAILED: 'Payment calculation failed',
  EXPORT_FAILED: 'Export failed',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  CALCULATION_SUCCESS: 'Payment calculation completed',
  EXPORT_SUCCESS: 'Data exported successfully',
} as const;

/**
 * Authentication-specific error messages for OAuth and token flows
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: 'Error starting OAuth sign in',
  OAuthCallback: 'Error handling OAuth callback',
  OAuthCreateAccount: 'Error creating OAuth account',
  EmailCreateAccount: 'Error creating email account',
  Callback: 'Error in OAuth callback',
  OAuthAccountNotLinked: 'Account already exists with different provider',
  EmailSignin: 'Error sending email',
  CredentialsSignin: 'Invalid credentials',
  SessionRequired: 'Please sign in to access this page',
  Default: 'An error occurred during authentication',
} as const;

/**
 * Authentication methods
 */
export const AUTH_METHODS = {
  OAUTH: 'oauth',
  TOKEN: 'token',
} as const;

/**
 * PagerDuty OAuth permissions displayed to users
 */
export const PAGERDUTY_PERMISSIONS = [
  'Read access to schedules',
  'Read access to user information',
  'Read access to on-call schedules',
] as const;

/**
 * Instructions for obtaining PagerDuty API token
 */
export const API_TOKEN_INSTRUCTIONS = [
  'Log into PagerDuty',
  'Click your user icon → My Profile',
  'Go to User Settings tab',
  'Scroll to API Access section',
  'Create or copy your User API Token',
] as const;

/**
 * Schedule layout configuration for list view
 */
export const SCHEDULE_LAYOUT = {
  /** Cards per page */
  ITEMS_PER_PAGE: 16,
  /** Grid configuration */
  GRID: {
    /** Number of columns per breakpoint */
    COLUMNS: {
      xs: 1,
      sm: 2,
      md: 4,
    },
    /** Number of rows to accommodate ITEMS_PER_PAGE */
    ROWS: {
      xs: 16, // All cards in single column
      sm: 8, // 8 rows x 2 columns = 16 cards
      md: 4, // 4 rows x 4 columns = 16 cards
    },
    /** Fixed row height to prevent layout shifts */
    ROW_HEIGHT: 250, // px
    /** Gap between grid items */
    GAP: 3, // theme spacing units (24px)
    GAP_PX: 24, // Actual pixel value for calculations
  },
  /** Card dimensions */
  CARD: {
    MIN_HEIGHT: 200,
    PADDING: 2, // theme spacing units
  },
} as const;

/**
 * Layout and spacing constants for schedule detail page
 */
export const SCHEDULE_DETAIL_LAYOUT = {
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
