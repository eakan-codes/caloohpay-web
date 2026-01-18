'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box,
  Paper,
  Alert,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import { ArrowBack, ViewList, CalendarMonth, Analytics } from '@mui/icons-material';
import { useCallback, useMemo } from 'react';
import { Header, Footer } from '@/components/common';
import MonthNavigation from '@/components/schedules/MonthNavigation';
import CalendarView from '@/components/schedules/CalendarView';
import { transformToCalendarEvents } from '@/lib/utils/calendarUtils';
import { ViewMode, ROUTES } from '@/lib/constants';
import { sanitizeUrl } from '@/lib/utils/urlSanitization';
import ScheduleHeader from './components/ScheduleHeader';
import ScheduleActions from './components/ScheduleActions';
import OnCallSchedule from './components/OnCallSchedule';
import { useScheduleData, useDateRangeNavigation, useViewMode } from './hooks';
import * as styles from './page.styles';

export default function ScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const scheduleId = params?.id as string;

  // Use custom hooks for state management
  const { dateRange, currentMonthDisplay, handlePreviousMonth, handleNextMonth } =
    useDateRangeNavigation();
  const { viewMode, handleViewModeChange } = useViewMode();
  const { data, userSchedules, isLoading, error } = useScheduleData(
    scheduleId,
    session?.accessToken,
    session?.authMethod,
    dateRange
  );

  // Stable back handler
  const handleBack = useCallback(() => {
    router.push('/schedules');
  }, [router]);

  // Handle analytics navigation
  const handleAnalytics = useCallback(() => {
    router.push(ROUTES.SCHEDULE_ANALYTICS(scheduleId));
  }, [router, scheduleId]);

  // Transform schedule entries to calendar events
  const calendarEvents = useMemo(() => {
    if (!data?.schedule?.final_schedule?.rendered_schedule_entries || !data.schedule.time_zone) {
      return [];
    }
    return transformToCalendarEvents(
      data.schedule.final_schedule.rendered_schedule_entries,
      data.schedule.time_zone
    );
  }, [data]);

  // Error state
  if (error) {
    return (
      <Box sx={styles.pageContainer}>
        <Header />
        <Box sx={styles.errorContentContainer}>
          <Alert severity="error" sx={styles.errorAlert}>
            <Typography variant="h6" gutterBottom>
              Failed to Load Schedule
            </Typography>
            <Typography variant="body2">
              {error.message || 'Unable to fetch schedule details from PagerDuty.'}
            </Typography>
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/schedules')}
          >
            Back to Schedules
          </Button>
        </Box>
        <Footer />
      </Box>
    );
  }

  const schedule = data?.schedule;

  // Show "not found" only if not loading and no schedule exists
  if (!schedule && !isLoading) {
    return (
      <Box sx={styles.pageContainer}>
        <Header />
        <Box sx={styles.errorContentContainer}>
          <Alert severity="warning">
            <Typography variant="h6">Schedule Not Found</Typography>
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/schedules')}
            sx={styles.backButtonStyle}
          >
            Back to Schedules
          </Button>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={styles.pageContainer}>
      <Header />
      <Box sx={styles.contentContainer}>
        {/* Header - Memoized to prevent re-renders */}
        <ScheduleHeader
          scheduleName={schedule?.name || ''}
          scheduleDescription={schedule?.description}
          timeZone={schedule?.time_zone || ''}
          onBack={handleBack}
        />

        {/* View Mode Toggle with Analytics Button */}
        <Paper sx={styles.viewModeContainer}>
          <Box sx={styles.viewModeInner}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<Analytics />}
                onClick={handleAnalytics}
                aria-label="View analytics"
              >
                Analytics
              </Button>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                size="small"
              >
                <Tooltip title="List View" arrow>
                  <ToggleButton value={ViewMode.List} aria-label="list view">
                    <ViewList />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Calendar View" arrow>
                  <ToggleButton value={ViewMode.Calendar} aria-label="calendar view">
                    <CalendarMonth />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
            <MonthNavigation
              currentMonth={currentMonthDisplay}
              isLoading={isLoading}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
            />
          </Box>
        </Paper>

        {/* Schedule Display - Toggle between list and calendar views */}
        {viewMode === ViewMode.Calendar ? (
          <Paper sx={styles.scheduleDisplayContainer}>
            <CalendarView
              events={calendarEvents}
              timezone={schedule?.time_zone || 'UTC'}
              initialDate={dateRange.since}
            />
          </Paper>
        ) : (
          <Paper sx={styles.scheduleDisplayContainer}>
            <OnCallSchedule
              userSchedules={userSchedules}
              currentMonthDisplay={currentMonthDisplay}
              timeZone={schedule?.time_zone || 'UTC'}
              isLoading={isLoading}
            />
          </Paper>
        )}

        {/* Actions - Memoized to prevent re-renders */}
        <ScheduleActions
          htmlUrl={sanitizeUrl(schedule?.html_url, '#') || '#'}
          hasSchedules={userSchedules.length > 0}
        />
      </Box>
      <Footer />
    </Box>
  );
}
