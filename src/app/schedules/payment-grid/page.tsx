'use client';

import React, { useState, useEffect } from 'react';
import { Container, Box, Button, Stack, Typography, Alert } from '@mui/material';
import { Header, Footer, Loading, ErrorDisplay } from '@/components/common';
import ScheduleMultiSelect from '@/components/schedules/ScheduleMultiSelect';
import MonthNavigation from '@/components/schedules/MonthNavigation';
import CompensationGrid from '@/components/schedules/CompensationGrid';
import { useSession } from 'next-auth/react';
import { DateTime } from 'luxon';
import useSWR from 'swr';
import { PagerDutySchedule } from '@/lib/types';
import { MultiScheduleReportResponse } from '@/lib/types/multi-schedule';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSettings } from '@/hooks/useSettings';

// Local storage key
const STORAGE_KEY = 'caloohpay_multi_schedule_ids';

const fetcher = (url: string, token: string, body: unknown) =>
  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  });

export default function MultiSchedulePaymentPage() {
  const { data: session } = useSession();
  const settings = useSettings();
  const [selectedMonth, setSelectedMonth] = useState<DateTime | null>(null);
  const [selectedSchedules, setSelectedSchedules] = useState<PagerDutySchedule[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Initialize month on client side to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedMonth(DateTime.now().startOf('month'));
  }, []);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids) && ids.length > 0) {
          // We initially only have IDs. proper objects will come from report or we need to hydrate.
          // For UI consistency, we can temporarily show IDs or empty until report loads.
          // Strategy: Report request will happen based on these IDs.
          // We'll set a flag or temporary placeholders.

          const placeholders = ids.map(
            (id: string) =>
              ({
                id,
                name: 'Loading...',
                html_url: '',
                time_zone: '',
                final_schedule: { name: '', rendered_schedule_entries: [] },
              }) as PagerDutySchedule
          );
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSelectedSchedules(placeholders);
        }
      }
    } catch (e) {
      console.error('Failed to load schedules', e);
    }
    setInitialLoading(false);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!initialLoading) {
      const ids = selectedSchedules.map((s) => s.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  }, [selectedSchedules, initialLoading]);

  // Report SWR
  const reportKey =
    session?.accessToken && selectedSchedules.length > 0 && selectedMonth
      ? [
          '/api/reports/multi-schedule',
          session.accessToken,
          selectedSchedules.map((s) => s.id).join(','),
          selectedMonth.toISODate(),
          settings.weekdayRate,
          settings.weekendRate,
        ]
      : null;

  const {
    data: reportData,
    error,
    isLoading,
    mutate,
  } = useSWR<MultiScheduleReportResponse>(
    reportKey,
    ([url, token]) => {
      const ids = selectedSchedules.map((s) => s.id);
      // selectedMonth is guaranteed by reportKey check
      const start = selectedMonth!.startOf('month').toISO();
      const end = selectedMonth!.endOf('month').toISO();

      return fetcher(url, token, {
        scheduleIds: ids,
        startDate: start,
        endDate: end,
        rates: {
          weekdayRate: settings.weekdayRate,
          weekendRate: settings.weekendRate,
        },
      });
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // Hydrate selectedSchedules with metadata from report if available (corrects the "Loading..." names)
  useEffect(() => {
    if (reportData?.reports) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSchedules((prev) => {
        // Check if we need to update any metadata
        const newSchedules = [...prev];
        let changed = false;

        reportData.reports.forEach((r) => {
          // Safety check for metadata
          if (!r.metadata || !r.metadata.id) return;

          const idx = newSchedules.findIndex((s) => s.id === r.metadata.id);
          if (idx !== -1) {
            if (
              newSchedules[idx].name === 'Loading...' ||
              newSchedules[idx].name !== r.metadata.name
            ) {
              newSchedules[idx] = {
                ...newSchedules[idx],
                name: r.metadata.name,
                html_url: r.metadata.html_url,
                time_zone: r.metadata.time_zone,
              };
              changed = true;
            }
          }
        });
        return changed ? newSchedules : prev;
      });
    }
  }, [reportData]);

  const handleCopy = () => {
    // Very specific logic needed to construct CSV/Table string from all reports
    if (!reportData?.reports) return;

    let text = '';
    reportData.reports.forEach((r) => {
      text += `Schedule: ${r.metadata.name}\tURL: ${r.metadata.html_url}\tTimezone: ${r.metadata.time_zone}\n`;
      text += `Employee\tTotal Compensation\tWeekdays\tWeekends\n`;
      r.employees.forEach((e) => {
        text += `${e.name}\t${e.totalCompensation}\t${e.weekdayHours}\t${e.weekendHours}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!'); // Replace with Toast if available
    });
  };

  if (!selectedMonth) {
    return <Loading />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Multi-Schedule Reports
        </Typography>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ mb: 4 }}
          alignItems="flex-start"
        >
          <Box sx={{ flex: 1, width: '100%' }}>
            <ScheduleMultiSelect
              value={selectedSchedules}
              onChange={setSelectedSchedules}
              isLoadingInitial={initialLoading}
            />
          </Box>
          <Box>
            <MonthNavigation
              currentMonth={selectedMonth?.toFormat('MMMM yyyy') || ''}
              onPreviousMonth={() =>
                setSelectedMonth((prev) => (prev ? prev.minus({ months: 1 }) : prev))
              }
              onNextMonth={() =>
                setSelectedMonth((prev) => (prev ? prev.plus({ months: 1 }) : prev))
              }
              isLoading={isLoading}
            />
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            disabled={!reportData || isLoading}
          >
            Export / Copy
          </Button>
        </Box>

        {error && (
          <ErrorDisplay
            message={error?.message || 'An error occurred while fetching the report.'}
            onRetry={() => mutate()}
          />
        )}

        {!isLoading && !reportData && !error && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Select one or more schedules above to generate a payment report.
          </Alert>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Loading message="Calculating multi-schedule payments..." />
          </Box>
        )}

        {!isLoading && reportData?.reports && (
          <Box sx={{ height: '700px', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <CompensationGrid reports={reportData.reports} />
          </Box>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
