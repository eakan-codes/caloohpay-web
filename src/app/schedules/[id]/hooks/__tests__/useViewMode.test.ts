import { renderHook, act } from '@testing-library/react';
import { useViewMode } from '../useViewMode';

describe('useViewMode', () => {
  it('initializes with list view mode', () => {
    const { result } = renderHook(() => useViewMode());

    expect(result.current.viewMode).toBe('list');
  });

  it('changes view mode to calendar', () => {
    const { result } = renderHook(() => useViewMode());

    act(() => {
      const mockEvent = {} as React.MouseEvent<HTMLElement>;
      result.current.handleViewModeChange(mockEvent, 'calendar');
    });

    expect(result.current.viewMode).toBe('calendar');
  });

  it('changes view mode back to list', () => {
    const { result } = renderHook(() => useViewMode());

    act(() => {
      const mockEvent = {} as React.MouseEvent<HTMLElement>;
      result.current.handleViewModeChange(mockEvent, 'calendar');
    });

    expect(result.current.viewMode).toBe('calendar');

    act(() => {
      const mockEvent = {} as React.MouseEvent<HTMLElement>;
      result.current.handleViewModeChange(mockEvent, 'list');
    });

    expect(result.current.viewMode).toBe('list');
  });

  it('ignores null view mode changes', () => {
    const { result } = renderHook(() => useViewMode());

    act(() => {
      const mockEvent = {} as React.MouseEvent<HTMLElement>;
      result.current.handleViewModeChange(mockEvent, null);
    });

    // Should remain in initial state
    expect(result.current.viewMode).toBe('list');
  });

  it('provides stable callback reference', () => {
    const { result, rerender } = renderHook(() => useViewMode());

    const callback1 = result.current.handleViewModeChange;

    rerender();

    const callback2 = result.current.handleViewModeChange;

    // Callbacks should be the same reference (memoized)
    expect(callback1).toBe(callback2);
  });

  it('toggles between list and calendar multiple times', () => {
    const { result } = renderHook(() => useViewMode());

    const mockEvent = {} as React.MouseEvent<HTMLElement>;

    act(() => {
      result.current.handleViewModeChange(mockEvent, 'calendar');
    });
    expect(result.current.viewMode).toBe('calendar');

    act(() => {
      result.current.handleViewModeChange(mockEvent, 'list');
    });
    expect(result.current.viewMode).toBe('list');

    act(() => {
      result.current.handleViewModeChange(mockEvent, 'calendar');
    });
    expect(result.current.viewMode).toBe('calendar');
  });
});
