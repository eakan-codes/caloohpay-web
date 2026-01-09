import { act } from '@testing-library/react';
import { getSettingsStore, reloadSettingsFromStorage } from '../settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset store to initial state
    act(() => {
      getSettingsStore.setState({
        weekdayRate: 50,
        weekendRate: 75,
      });
    });
  });

  describe('initialization', () => {
    it('should initialize with default rates', () => {
      // Fresh store with clean localStorage
      localStorage.clear();
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(50);
      expect(state.weekendRate).toBe(75);
    });

    it('should load rates from localStorage on init', () => {
      // Store custom rates in localStorage
      const customSettings = {
        weekdayRate: 60,
        weekendRate: 85,
      };
      localStorage.setItem('settings', JSON.stringify(customSettings));

      // Use reload helper to load from localStorage
      act(() => {
        reloadSettingsFromStorage();
      });

      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(60);
      expect(state.weekendRate).toBe(85);
    });
  });

  describe('updating rates', () => {
    it('should update weekday rate and return true', () => {
      let result = false;
      act(() => {
        result = getSettingsStore.getState().setWeekdayRate(60);
      });
      expect(result).toBe(true);
      expect(getSettingsStore.getState().weekdayRate).toBe(60);
    });

    it('should update weekend rate and return true', () => {
      let result = false;
      act(() => {
        result = getSettingsStore.getState().setWeekendRate(90);
      });
      expect(result).toBe(true);
      expect(getSettingsStore.getState().weekendRate).toBe(90);
    });

    it('should allow independent updates without affecting other rate', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(65);
      });
      expect(getSettingsStore.getState().weekdayRate).toBe(65);
      expect(getSettingsStore.getState().weekendRate).toBe(75);

      act(() => {
        getSettingsStore.getState().setWeekendRate(95);
      });
      expect(getSettingsStore.getState().weekdayRate).toBe(65);
      expect(getSettingsStore.getState().weekendRate).toBe(95);
    });
  });

  describe('rate validation in setters', () => {
    it('should reject negative weekday rate and return false', () => {
      let result = false;
      act(() => {
        result = getSettingsStore.getState().setWeekdayRate(-50);
      });
      expect(result).toBe(false);
      expect(getSettingsStore.getState().weekdayRate).toBe(50); // unchanged
    });

    it('should reject negative weekend rate and return false', () => {
      let result = false;
      act(() => {
        result = getSettingsStore.getState().setWeekendRate(-75);
      });
      expect(result).toBe(false);
      expect(getSettingsStore.getState().weekendRate).toBe(75); // unchanged
    });

    it('should reject NaN and return false', () => {
      let result = false;
      act(() => {
        result = getSettingsStore.getState().setWeekdayRate(NaN);
      });
      expect(result).toBe(false);
      expect(getSettingsStore.getState().weekdayRate).toBe(50); // unchanged
    });

    it('should reject rates below minimum (25) and return false', () => {
      let result = false;
      act(() => {
        result = getSettingsStore.getState().setWeekdayRate(24);
      });
      expect(result).toBe(false);
      expect(getSettingsStore.getState().weekdayRate).toBe(50); // unchanged
    });

    it('should accept minimum boundary rate (25) and return true', () => {
      let result = false;
      act(() => {
        result = getSettingsStore.getState().setWeekdayRate(25);
      });
      expect(result).toBe(true);
      expect(getSettingsStore.getState().weekdayRate).toBe(25);
    });

    it('should reject rates above maximum (200) and return false', () => {
      let result = false;
      act(() => {
        result = getSettingsStore.getState().setWeekdayRate(201);
      });
      expect(result).toBe(false);
      expect(getSettingsStore.getState().weekdayRate).toBe(50); // unchanged
    });

    it('should accept maximum boundary rate (200) and return true', () => {
      let result = false;
      act(() => {
        result = getSettingsStore.getState().setWeekdayRate(200);
      });
      expect(result).toBe(true);
      expect(getSettingsStore.getState().weekdayRate).toBe(200);
    });

    it('should not persist invalid rate to localStorage', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(300);
      });
      const saved = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(saved.weekdayRate).not.toBe(300);
    });

    it('should persist valid rate to localStorage before rejecting next invalid update', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(60);
      });
      const savedAfterValid = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(savedAfterValid.weekdayRate).toBe(60);

      act(() => {
        getSettingsStore.getState().setWeekdayRate(300);
      });
      const savedAfterInvalid = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(savedAfterInvalid.weekdayRate).toBe(60); // still the old valid value
    });
  });

  describe('localStorage persistence', () => {
    it('should persist weekday rate to localStorage when updated', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(70);
      });

      const saved = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(saved.weekdayRate).toBe(70);
    });

    it('should persist weekend rate to localStorage when updated', () => {
      act(() => {
        getSettingsStore.getState().setWeekendRate(100);
      });

      const saved = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(saved.weekendRate).toBe(100);
    });

    it('should persist both rates to localStorage together', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(62);
        getSettingsStore.getState().setWeekendRate(88);
      });

      const saved = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(saved).toEqual({
        weekdayRate: 62,
        weekendRate: 88,
      });
    });
  });

  describe('resetting to defaults', () => {
    it('should reset rates to defaults', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(70);
        getSettingsStore.getState().setWeekendRate(95);
      });

      act(() => {
        getSettingsStore.getState().reset();
      });

      expect(getSettingsStore.getState().weekdayRate).toBe(50);
      expect(getSettingsStore.getState().weekendRate).toBe(75);
    });

    it('should persist defaults to localStorage after reset', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(70);
        getSettingsStore.getState().setWeekendRate(95);
      });

      act(() => {
        getSettingsStore.getState().reset();
      });

      const saved = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(saved.weekdayRate).toBe(50);
      expect(saved.weekendRate).toBe(75);
    });
  });

  describe('getDefaults', () => {
    it('should return default rates', () => {
      const defaults = getSettingsStore.getState().getDefaults();
      expect(defaults).toEqual({
        weekdayRate: 50,
        weekendRate: 75,
      });
    });

    it('should return defaults even when custom rates are set', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(80);
        getSettingsStore.getState().setWeekendRate(110);
      });

      const defaults = getSettingsStore.getState().getDefaults();
      expect(defaults).toEqual({
        weekdayRate: 50,
        weekendRate: 75,
      });
    });

    it('should return a new object on each call to prevent mutations', () => {
      const defaults1 = getSettingsStore.getState().getDefaults();
      const defaults2 = getSettingsStore.getState().getDefaults();

      // Should return equal values
      expect(defaults1).toEqual(defaults2);

      // But should be different object references to prevent external mutations
      expect(defaults1).not.toBe(defaults2);

      // Modifying one should not affect the other
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (defaults1 as any).weekdayRate = 999;
      expect(defaults2.weekdayRate).toBe(50);
    });
  });

  describe('store subscriptions', () => {
    it('should notify subscribers when state changes', () => {
      const listener = jest.fn();
      const unsubscribe = getSettingsStore.subscribe(listener);

      act(() => {
        getSettingsStore.getState().setWeekdayRate(55);
      });

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('should pass new state to listeners', () => {
      const listener = jest.fn();
      getSettingsStore.subscribe(listener);

      const newState = { weekdayRate: 65, weekendRate: 85 };
      act(() => {
        getSettingsStore.setState(newState);
      });

      expect(listener).toHaveBeenCalled();
      expect(getSettingsStore.getState()).toMatchObject(newState);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid localStorage JSON gracefully', () => {
      localStorage.setItem('settings', 'invalid json {');
      act(() => {
        reloadSettingsFromStorage();
      });
      // Store should fall back to defaults
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(50);
      expect(state.weekendRate).toBe(75);
    });

    it('should handle missing localStorage gracefully', () => {
      localStorage.clear();
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(50);
      expect(state.weekendRate).toBe(75);
    });

    it('should handle partial localStorage data (missing fields)', () => {
      localStorage.setItem('settings', JSON.stringify({ weekdayRate: 60 }));
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      // Should have weekdayRate from storage and weekendRate from defaults
      expect(state.weekdayRate).toBe(60);
      expect(state.weekendRate).toBe(75);
    });

    it('should ignore invalid rate values and use defaults', () => {
      localStorage.setItem('settings', JSON.stringify({ weekdayRate: -5, weekendRate: 'invalid' }));
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      // Should use defaults for invalid values
      expect(state.weekdayRate).toBe(50);
      expect(state.weekendRate).toBe(75);
    });

    it('should accept valid numeric strings and convert them', () => {
      localStorage.setItem('settings', JSON.stringify({ weekdayRate: '60', weekendRate: '90' }));
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(60);
      expect(state.weekendRate).toBe(90);
    });

    it('should enforce minimum rate boundary (25)', () => {
      // Values below 25 should be rejected and defaults used
      localStorage.setItem('settings', JSON.stringify({ weekdayRate: 24, weekendRate: 10 }));
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(50);
      expect(state.weekendRate).toBe(75);
    });

    it('should accept minimum rate boundary (25)', () => {
      // Exactly 25 should be valid
      localStorage.setItem('settings', JSON.stringify({ weekdayRate: 25, weekendRate: 25 }));
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(25);
      expect(state.weekendRate).toBe(25);
    });

    it('should enforce maximum rate boundary (200)', () => {
      // Values above 200 should be rejected and defaults used
      localStorage.setItem('settings', JSON.stringify({ weekdayRate: 201, weekendRate: 250 }));
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(50);
      expect(state.weekendRate).toBe(75);
    });

    it('should accept maximum rate boundary (200)', () => {
      // Exactly 200 should be valid
      localStorage.setItem('settings', JSON.stringify({ weekdayRate: 200, weekendRate: 200 }));
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(200);
      expect(state.weekendRate).toBe(200);
    });
  });
});
