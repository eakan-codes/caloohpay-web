'use client';

import { useState, useCallback } from 'react';

type ViewMode = 'list' | 'calendar';

/**
 * Hook for managing the schedule view mode (list or calendar)
 *
 * @remarks
 * - Manages toggle state between list and calendar views
 * - Provides callback for view mode changes
 * - Initializes to 'list' view by default
 *
 * @returns Object with {
 *   viewMode: Current view mode ('list' or 'calendar'),
 *   handleViewModeChange: Callback to change view mode
 * }
 *
 * @example
 * ```tsx
 * const { viewMode, handleViewModeChange } = useViewMode();
 *
 * <ToggleButtonGroup
 *   value={viewMode}
 *   exclusive
 *   onChange={handleViewModeChange}
 * >
 *   <ToggleButton value="list">List View</ToggleButton>
 *   <ToggleButton value="calendar">Calendar View</ToggleButton>
 * </ToggleButtonGroup>
 * ```
 */
export const useViewMode = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Handle view mode change
  const handleViewModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
      if (newMode !== null) {
        setViewMode(newMode);
      }
    },
    []
  );

  return {
    viewMode,
    handleViewModeChange,
  };
};
