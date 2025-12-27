'use client';

import { memo } from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import { ArrowBack, AccessTime } from '@mui/icons-material';
import * as styles from '../page.styles';

export interface ScheduleHeaderProps {
  /** The name of the schedule */
  scheduleName: string;
  /** Optional description of the schedule */
  scheduleDescription?: string;
  /** IANA timezone identifier (e.g., 'America/New_York') */
  timeZone: string;
  /** Callback when back button is clicked */
  onBack: () => void;
}

/**
 * Displays the schedule header with title, description, timezone, and back button
 *
 * @remarks
 * - Memoized to prevent re-renders unless props change
 * - Only re-renders if scheduleName, scheduleDescription, timeZone, or onBack changes
 *
 * @example
 * ```tsx
 * <ScheduleHeader
 *   scheduleName="Engineering On-Call"
 *   scheduleDescription="Primary engineering schedule"
 *   timeZone="Europe/London"
 *   onBack={() => router.back()}
 * />
 * ```
 */
const ScheduleHeader = memo<ScheduleHeaderProps>(
  ({ scheduleName, scheduleDescription, timeZone, onBack }) => (
    <Box sx={styles.headerContainer}>
      <Box sx={styles.headerTopRow}>
        <IconButton onClick={onBack} size="large">
          <ArrowBack />
        </IconButton>
        <Box sx={styles.headerTitleContainer}>
          <Typography variant="h4" component="h1" gutterBottom>
            {scheduleName}
          </Typography>
          {scheduleDescription && (
            <Typography variant="body1" color="text.secondary">
              {scheduleDescription}
            </Typography>
          )}
        </Box>
        <Chip icon={<AccessTime />} label={timeZone} color="primary" variant="outlined" />
      </Box>
    </Box>
  )
);

ScheduleHeader.displayName = 'ScheduleHeader';

export default ScheduleHeader;
