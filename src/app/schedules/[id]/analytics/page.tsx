/**
 * Analytics Page for Schedule
 * Displays frequency matrix, burden distribution, and interruption vs pay
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Paper, Tabs, Tab } from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { DateTime } from 'luxon';
import { Header, Footer } from '@/components/common';
import { FrequencyMatrix } from '@/components/analytics/FrequencyMatrix';
import { BurdenDistribution } from '@/components/analytics/BurdenDistribution';
import { InterruptionVsPay } from '@/components/analytics/InterruptionVsPay';
import { RotationStripPlot } from '@/components/analytics/RotationStripPlot';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import {
  buildFrequencyMatrix,
  calculateBurdenDistribution,
  calculateInterruptionCorrelation,
} from '@/lib/utils/analyticsUtils';
import { getCurrentRates } from '@/lib/utils/ratesUtils';
import { ROUTES } from '@/lib/constants';
import type { OnCallEntry } from '@/lib/types';
import * as styles from './page.styles';

export default function ScheduleAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const scheduleId = params?.id as string;

  const [oncalls, setOncalls] = useState<OnCallEntry[]>([]);
  const [incidents, setIncidents] = useState<import('@/lib/types').Incident[]>([]);
  const [scheduleName, setScheduleName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  // Default to last 6 months, but allow user customization
  const [dateRange, setDateRange] = useState(() => {
    const now = DateTime.now();
    const sixMonthsAgo = now.minus({ months: 6 });
    return {
      since: sixMonthsAgo.toISO() || '',
      until: now.toISO() || '',
    };
  });

  // Handle date range change from picker
  const handleDateRangeChange = useCallback((since: string, until: string) => {
    setDateRange({ since, until });
    // Clear existing data to trigger refetch
    setOncalls([]);
    setIncidents([]);
  }, []);

  // Fetch on-call data when date range changes
  // Don't refetch when tab regains focus
  useEffect(() => {
    let isMounted = true;

    const fetchAnalyticsData = async () => {
      if (!session?.accessToken || !scheduleId) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch schedule details to get name
        const scheduleResponse = await fetch(
          `/api/schedules/${scheduleId}?since=${dateRange.since}&until=${dateRange.until}`,
          { credentials: 'include' }
        );

        if (!scheduleResponse.ok) {
          throw new Error('Failed to fetch schedule details');
        }

        const scheduleData = await scheduleResponse.json();

        if (!isMounted) return;
        setScheduleName(scheduleData.schedule?.name || 'Unknown Schedule');

        // Fetch on-call data and incidents in parallel
        const [oncallsResponse, incidentsResponse] = await Promise.all([
          fetch(
            `/api/analytics/oncalls?schedule_id=${scheduleId}&since=${dateRange.since}&until=${dateRange.until}`,
            { credentials: 'include' }
          ),
          fetch(
            `/api/analytics/incidents?schedule_id=${scheduleId}&since=${dateRange.since}&until=${dateRange.until}`,
            { credentials: 'include' }
          ).catch(() => null), // Gracefully handle if incidents API fails
        ]);

        if (!isMounted) return;

        if (!oncallsResponse.ok) {
          throw new Error('Failed to fetch on-call data');
        }

        const oncallsData = await oncallsResponse.json();
        setOncalls(oncallsData.oncalls || []);

        // Set incidents if available
        if (incidentsResponse && incidentsResponse.ok) {
          const incidentsData = await incidentsResponse.json();
          setIncidents(incidentsData.incidents || []);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Only fetch if we don't already have data for this date range
    if (oncalls.length === 0 && !isLoading) {
      fetchAnalyticsData();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, scheduleId, dateRange.since, dateRange.until]);

  // Transform data for visualizations
  const analyticsData = useMemo(() => {
    if (oncalls.length === 0) {
      return {
        frequencyMatrix: [],
        burdenDistribution: [],
        interruptionCorrelation: [],
      };
    }

    const rates = getCurrentRates();

    return {
      frequencyMatrix: buildFrequencyMatrix(oncalls),
      burdenDistribution: calculateBurdenDistribution(oncalls),
      interruptionCorrelation: calculateInterruptionCorrelation(
        oncalls,
        rates.weekdayRate,
        rates.weekendRate,
        incidents.length > 0 ? incidents : undefined
      ),
    };
  }, [oncalls, incidents]);

  const handleBack = () => {
    router.push(ROUTES.SCHEDULE_DETAIL(scheduleId));
  };

  if (error) {
    return (
      <Box sx={styles.pageContainer}>
        <Header />
        <Box sx={styles.contentContainer}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Failed to Load Analytics
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
          <Button variant="contained" startIcon={<ArrowBack />} onClick={handleBack}>
            Back to Schedule
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
        {/* Header */}
        <Paper sx={styles.headerContainer}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{ mb: 2 }}
            aria-label="Back to schedule"
          >
            Back to Schedule
          </Button>
          <Typography variant="h4" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {scheduleName}
          </Typography>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2, mt: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              {DateTime.fromISO(dateRange.since).toFormat('MMM d, yyyy')} -{' '}
              {DateTime.fromISO(dateRange.until).toFormat('MMM d, yyyy')}
            </Typography>
            <DateRangePicker
              currentSince={dateRange.since}
              currentUntil={dateRange.until}
              onDateRangeChange={handleDateRangeChange}
            />
            <Button
              variant="text"
              size="small"
              startIcon={<Refresh />}
              onClick={() => {
                setOncalls([]);
                setIncidents([]);
              }}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Box>
        </Paper>

        {isLoading ? (
          <Box sx={styles.loadingContainer}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading analytics data...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Tabs for different visualization views */}
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={currentTab}
                onChange={(_, newValue) => setCurrentTab(newValue)}
                aria-label="Analytics visualization tabs"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Rhythm View" id="tab-0" aria-controls="tabpanel-0" />
                <Tab label="Frequency Matrix" id="tab-1" aria-controls="tabpanel-1" />
                <Tab label="Burden Distribution" id="tab-2" aria-controls="tabpanel-2" />
                <Tab label="Interruption vs Pay" id="tab-3" aria-controls="tabpanel-3" />
              </Tabs>
            </Paper>

            {/* Tab Panels */}
            <Box role="tabpanel" hidden={currentTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
              {currentTab === 0 && <RotationStripPlot data={oncalls} />}
            </Box>

            <Box role="tabpanel" hidden={currentTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
              {currentTab === 1 && <FrequencyMatrix data={analyticsData.frequencyMatrix} />}
            </Box>

            <Box role="tabpanel" hidden={currentTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
              {currentTab === 2 && <BurdenDistribution data={analyticsData.burdenDistribution} />}
            </Box>

            <Box role="tabpanel" hidden={currentTab !== 3} id="tabpanel-3" aria-labelledby="tab-3">
              {currentTab === 3 && (
                <InterruptionVsPay data={analyticsData.interruptionCorrelation} />
              )}
            </Box>
          </>
        )}
      </Box>
      <Footer />
    </Box>
  );
}
