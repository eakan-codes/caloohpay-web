import { create } from 'zustand';

const DEFAULTS = {
  weekdayRate: 50,
  weekendRate: 75,
} as const;

export interface SettingsState {
  weekdayRate: number;
  weekendRate: number;
  setWeekdayRate: (rate: number) => void;
  setWeekendRate: (rate: number) => void;
  getDefaults: () => typeof DEFAULTS;
  reset: () => void;
}

// Validation helper
const isValidRate = (value: unknown): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return typeof num === 'number' && !isNaN(num) && num > 0;
};

// Helper to load from localStorage with validation
const loadFromStorage = (): Partial<SettingsState> => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {};
  }

  const storageKey = 'settings';
  const stored = localStorage.getItem(storageKey);
  const initialState: Partial<SettingsState> = {};

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Only use values that pass validation
      if (isValidRate(parsed.weekdayRate)) {
        initialState.weekdayRate = Number(parsed.weekdayRate);
      }
      if (isValidRate(parsed.weekendRate)) {
        initialState.weekendRate = Number(parsed.weekendRate);
      }
    } catch (error) {
      // Fall back to defaults on parse error
      console.warn('Failed to parse settings from localStorage:', error);
    }
  }

  return initialState;
};

// Helper to persist to localStorage
const persistToStorage = (state: { weekdayRate: number; weekendRate: number }) => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('settings', JSON.stringify(state));
};

// Create the store
export const getSettingsStore = create<SettingsState>((set, get) => {
  // Load initial state from storage at creation time
  const stored = loadFromStorage();

  return {
    weekdayRate: stored.weekdayRate ?? DEFAULTS.weekdayRate,
    weekendRate: stored.weekendRate ?? DEFAULTS.weekendRate,

    setWeekdayRate: (rate: number) => {
      const current = get();
      const newState = { weekdayRate: rate, weekendRate: current.weekendRate };
      persistToStorage(newState);
      set(newState);
    },

    setWeekendRate: (rate: number) => {
      const current = get();
      const newState = { weekdayRate: current.weekdayRate, weekendRate: rate };
      persistToStorage(newState);
      set(newState);
    },

    getDefaults: () => DEFAULTS,

    reset: () => {
      persistToStorage(DEFAULTS);
      set(DEFAULTS);
    },
  };
});

// Helper function to reload store from localStorage
// This is used in tests to simulate loading from storage after it's been changed
export const reloadSettingsFromStorage = () => {
  const stored = loadFromStorage();
  getSettingsStore.setState({
    weekdayRate: stored.weekdayRate ?? DEFAULTS.weekdayRate,
    weekendRate: stored.weekendRate ?? DEFAULTS.weekendRate,
  });
};

// For React hooks usage
export const useSettings = getSettingsStore;
