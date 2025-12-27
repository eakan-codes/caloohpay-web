'use client';

import { useState, useCallback } from 'react';
import { ViewMode, ViewModeType } from '../constants';

/**
 * Hook for managing the schedule view mode (list or calendar)
 *
 * @remarks
 * - Manages toggle state between list and calendar views
 * - Provides callback for view mode changes
 * - Initializes to 'list' view by default
 *
 * @returns Object with {
 *   viewMode: Current view mode (ViewMode.List or ViewMode.Calendar),
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
 *   <ToggleButton value={ViewMode.List}>List View</ToggleButton>
 *   <ToggleButton value={ViewMode.Calendar}>Calendar View</ToggleButton>
 * </ToggleButtonGroup>
 * ```
 */
export const useViewMode = () => {
  const [viewMode, setViewMode] = useState<ViewModeType>(ViewMode.List);

  // Handle view mode change
  const handleViewModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newMode: ViewModeType | null) => {
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
