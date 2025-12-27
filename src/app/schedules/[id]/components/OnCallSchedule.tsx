'use client';

import { memo } from 'react';
import { Box, Card, CardContent, Typography, Chip, Stack, Divider, Alert } from '@mui/material';
import { Person, Work, WorkOff, Wallet } from '@mui/icons-material';
import { DateTime } from 'luxon';
import { PAYMENT_RATES } from '@/lib/constants';
import { Loading } from '@/components/common';
import * as styles from '../page.styles';
import type { OnCallScheduleProps } from './OnCallSchedule.types';

/**
 * PeriodEntry - Sub-component for rendering individual on-call periods
 * Extracted to keep OnCallSchedule component more readable
 */
const PeriodEntry = memo<{
  entry: OnCallScheduleProps['userSchedules'][0]['entries'][0];
  timeZone: string;
}>(({ entry, timeZone }) => {
  const start = DateTime.fromISO(
    typeof entry.start === 'string' ? entry.start : entry.start.toISOString(),
    {
      zone: timeZone,
    }
  );
  const end = DateTime.fromISO(
    typeof entry.end === 'string' ? entry.end : entry.end.toISOString(),
    {
      zone: timeZone,
    }
  );

  return (
    <Box sx={styles.periodEntryBox}>
      <Box sx={styles.periodEntryInner}>
        <Box sx={styles.periodDateContainer}>
          <Typography variant="body2" fontWeight="medium">
            {start.toFormat('EEE, MMM d, yyyy, HH:mm ZZZ')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {end.toFormat('EEE, MMM d, yyyy, HH:mm ZZZ')}
          </Typography>
        </Box>

        <Box sx={styles.periodChipsContainer}>
          <Chip label={`${entry.duration.toFixed(1)}h`} size="small" variant="outlined" />
          {entry.weekdayDays > 0 && (
            <Chip
              label={`${entry.weekdayDays} WD`}
              size="small"
              color="default"
              title={`${entry.weekdayDays} weekday${entry.weekdayDays > 1 ? 's' : ''} × ${PAYMENT_RATES.CURRENCY_SYMBOL}${PAYMENT_RATES.WEEKDAY}`}
            />
          )}
          {entry.weekendDays > 0 && (
            <Chip
              label={`${entry.weekendDays} WE`}
              size="small"
              color="secondary"
              title={`${entry.weekendDays} weekend${entry.weekendDays > 1 ? 's' : ''} × ${PAYMENT_RATES.CURRENCY_SYMBOL}${PAYMENT_RATES.WEEKEND}`}
            />
          )}
          <Chip
            icon={<Wallet sx={styles.walletIconStyle} />}
            label={`${PAYMENT_RATES.CURRENCY_SYMBOL}${entry.compensation.toFixed(2)}`}
            size="small"
            color="success"
            sx={styles.compensationChipStyle}
          />
        </Box>
      </Box>
    </Box>
  );
});

PeriodEntry.displayName = 'PeriodEntry';

/**
 * UserScheduleCard - Sub-component for rendering individual user's schedule
 * Extracted to keep OnCallSchedule component more readable
 */
const UserScheduleCard = memo<{
  userSchedule: OnCallScheduleProps['userSchedules'][0];
  timeZone: string;
}>(({ userSchedule, timeZone }) => {
  const { user, entries, totalHours, totalWeekdays, totalWeekends, totalCompensation } =
    userSchedule;

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={styles.userCardHeader}>
          <Box sx={styles.userInfoContainer}>
            <Person />
            <Box>
              <Typography variant="h6">{user.name || user.summary}</Typography>
              {user.email && (
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={styles.chipsContainer}>
            <Chip label={`${totalHours.toFixed(1)} hours`} color="primary" variant="outlined" />
            <Chip
              icon={<Work />}
              label={`${totalWeekdays} weekdays`}
              color="default"
              variant="outlined"
            />
            <Chip
              icon={<WorkOff />}
              label={`${totalWeekends} weekends`}
              color="secondary"
              variant="outlined"
            />
            <Chip
              icon={<Wallet />}
              label={`${PAYMENT_RATES.CURRENCY_SYMBOL}${totalCompensation.toFixed(2)}`}
              color="success"
              variant="filled"
            />
          </Box>
        </Box>

        <Divider sx={styles.dividerStyle} />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            On-Call Periods ({entries.length})
          </Typography>
          <Stack spacing={1}>
            {entries.map((entry, index) => (
              <PeriodEntry key={index} entry={entry} timeZone={timeZone} />
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
});

UserScheduleCard.displayName = 'UserScheduleCard';

/**
 * OnCallSchedule - Main component for displaying on-call schedule data
 *
 * @remarks
 * - Memoized to prevent re-renders unless props change
 * - Displays loading state, empty state, or list of user schedules
 * - Each user schedule shows total hours, weekday/weekend counts, and compensation
 * - Individual on-call periods are shown with start/end times and compensation
 *
 * @example
 * ```tsx
 * <OnCallSchedule
 *   userSchedules={userSchedules}
 *   currentMonthDisplay="January 2025"
 *   timeZone="America/New_York"
 *   isLoading={false}
 * />
 * ```
 */
const OnCallSchedule = memo<OnCallScheduleProps>(
  ({ userSchedules, currentMonthDisplay, timeZone, isLoading }) => {
    // Show loading state only in this section
    if (isLoading) {
      return (
        <Box sx={styles.loadingContainer}>
          <Loading message="Loading schedule..." />
        </Box>
      );
    }

    if (userSchedules.length === 0) {
      return (
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            No On-Call Periods
          </Typography>
          <Typography variant="body2">
            There are no on-call periods scheduled for {currentMonthDisplay}.
          </Typography>
        </Alert>
      );
    }

    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={styles.scheduleTitle}>
          On-Call Schedule ({userSchedules.length}{' '}
          {userSchedules.length === 1 ? 'person' : 'people'})
        </Typography>

        <Stack spacing={3}>
          {userSchedules.map((userSchedule) => (
            <UserScheduleCard
              key={userSchedule.user.id}
              userSchedule={userSchedule}
              timeZone={timeZone}
            />
          ))}
        </Stack>
      </Box>
    );
  }
);

OnCallSchedule.displayName = 'OnCallSchedule';

export default OnCallSchedule;
