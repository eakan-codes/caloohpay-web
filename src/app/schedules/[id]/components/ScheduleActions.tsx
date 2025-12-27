'use client';

import { memo } from 'react';
import { Box, Button } from '@mui/material';
import * as styles from '../page.styles';

export interface ScheduleActionsProps {
  /** The HTML URL to the schedule in PagerDuty */
  htmlUrl: string;
  /** Whether there are schedules to work with */
  hasSchedules: boolean;
}

/**
 * Displays schedule action buttons: Calculate Payments and View in PagerDuty
 *
 * @remarks
 * - Memoized to prevent re-renders unless props change
 * - Only re-renders if htmlUrl or hasSchedules changes
 * - Calculate Payments button is disabled when no schedules are available
 *
 * @example
 * ```tsx
 * <ScheduleActions
 *   htmlUrl="https://company.pagerduty.com/schedules/ABC123"
 *   hasSchedules={userSchedules.length > 0}
 * />
 * ```
 */
const ScheduleActions = memo<ScheduleActionsProps>(({ htmlUrl, hasSchedules }) => (
  <Box sx={styles.actionsContainer}>
    <Button variant="contained" color="primary" size="large" disabled={!hasSchedules}>
      Calculate Payments
    </Button>
    <Button variant="outlined" href={htmlUrl} target="_blank" rel="noopener noreferrer">
      View in PagerDuty
    </Button>
  </Box>
));

ScheduleActions.displayName = 'ScheduleActions';

export default ScheduleActions;
