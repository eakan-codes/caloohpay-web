/**
 * Rotation Strip Plot Component (Rhythm View)
 * Visualizes on-call rotation patterns showing cadence and back-to-back shifts
 */

'use client';

import { Box, Typography, Paper, useTheme, Tooltip } from '@mui/material';
import { memo, useMemo } from 'react';
import { DateTime } from 'luxon';
import type { OnCallEntry } from '@/lib/types';
import { getRotationMetrics } from '@/lib/utils/rotationMetrics';
import { HelpModal } from '@/components/common/HelpModal';
import * as styles from './RotationStripPlot.styles';

interface RotationStripPlotProps {
  data: OnCallEntry[];
}

function RotationStripPlotComponent({ data }: RotationStripPlotProps) {
  const theme = useTheme();

  // Calculate rotation metrics
  const metrics = useMemo(() => getRotationMetrics(data), [data]);

  // Find the date range for the timeline
  const dateRange = useMemo(() => {
    if (data.length === 0) {
      return { start: DateTime.now(), end: DateTime.now(), totalWeeks: 0 };
    }

    const dates = data.flatMap((oncall) => [
      DateTime.fromISO(oncall.start),
      DateTime.fromISO(oncall.end),
    ]);

    const start = DateTime.min(...dates) || DateTime.now();
    const end = DateTime.max(...dates) || DateTime.now();
    const totalWeeks = Math.ceil(end.diff(start, 'weeks').weeks);

    return { start, end, totalWeeks };
  }, [data]);

  // Generate week labels for the timeline
  const weekLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 0; i <= dateRange.totalWeeks; i++) {
      const weekDate = dateRange.start.plus({ weeks: i });
      labels.push(weekDate.toFormat('MMM d'));
    }
    return labels;
  }, [dateRange]);

  // Calculate position and width for each shift block
  const getBlockPosition = (start: string, end: string) => {
    const startDate = DateTime.fromISO(start);
    const endDate = DateTime.fromISO(end);

    const offsetWeeks = startDate.diff(dateRange.start, 'weeks').weeks;
    const durationWeeks = endDate.diff(startDate, 'weeks').weeks;

    return {
      left: `${(offsetWeeks / dateRange.totalWeeks) * 100}%`,
      width: `${(durationWeeks / dateRange.totalWeeks) * 100}%`,
    };
  };

  // Check if shift is back-to-back with previous shift
  const isBackToBack = (userId: string, shiftIndex: number): boolean => {
    const userMetrics = metrics[userId];
    if (!userMetrics || shiftIndex === 0) return false;

    const gap = userMetrics.gapHistory[shiftIndex - 1];
    if (!gap) return false;

    // Consider back-to-back if gap is less than 1 day (< 0.14 weeks)
    return gap.gapDurationWeeks < 0.14;
  };

  const userIds = Object.keys(metrics);

  if (data.length === 0) {
    return (
      <Paper sx={styles.container}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Rhythm View</Typography>
          <HelpModal
            title="Rhythm View"
            description="Visualizes the cadence and rhythm of on-call rotations. Each user has a horizontal timeline showing their on-call weeks as colored blocks."
            howToRead={
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Each row represents one team member</li>
                <li>Blue blocks show weeks they were on-call</li>
                <li>Red blocks indicate back-to-back shifts (less than 24 hours rest)</li>
                <li>Spacing between blocks shows rest periods</li>
                <li>Hover over blocks to see exact dates and duration</li>
              </Box>
            }
            value={
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  This visualization helps you:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  <li>Spot back-to-back shifts that cause burnout</li>
                  <li>Identify rotation patterns (e.g., 1-in-3 weeks)</li>
                  <li>Ensure fair and sustainable on-call distribution</li>
                  <li>Detect scheduling anomalies from shift swaps</li>
                </Box>
              </Box>
            }
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          No on-call data available for the selected date range
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={styles.container}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Rhythm View</Typography>
        <HelpModal
          title="Rhythm View"
          description="Visualizes the cadence and rhythm of on-call rotations. Each user has a horizontal timeline showing their on-call weeks as colored blocks."
          howToRead={
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>Each row represents one team member</li>
              <li>Blue blocks show weeks they were on-call</li>
              <li>Red blocks indicate back-to-back shifts (less than 24 hours rest)</li>
              <li>Spacing between blocks shows rest periods</li>
              <li>Hover over blocks to see exact dates and duration</li>
            </Box>
          }
          value={
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                This visualization helps you:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Spot back-to-back shifts that cause burnout</li>
                <li>Identify rotation patterns (e.g., 1-in-3 weeks)</li>
                <li>Ensure fair and sustainable on-call distribution</li>
                <li>Detect scheduling anomalies from shift swaps</li>
              </Box>
            </Box>
          }
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Shows rotation cadence and spacing for weekly schedules
      </Typography>

      {/* Timeline Container */}
      <Box sx={styles.timelineContainer}>
        {/* Timeline Header */}
        <Box sx={styles.timelineHeader}>
          <Box sx={styles.userLabelColumn}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              Team Member
            </Typography>
          </Box>
          <Box sx={styles.timelineAxis}>
            {weekLabels.map((label, index) => (
              <Typography
                key={index}
                variant="caption"
                sx={{
                  position: 'absolute',
                  left: `${(index / dateRange.totalWeeks) * 100}%`,
                  transform: 'translateX(-50%)',
                  fontSize: '0.7rem',
                  color: theme.palette.text.secondary,
                }}
              >
                {label}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* User Rows */}
        {userIds.map((userId) => {
          const userMetrics = metrics[userId];

          return (
            <Box key={userId} sx={styles.userRow}>
              {/* User Name */}
              <Box sx={styles.userLabel}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {userMetrics.userName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg rest: {userMetrics.averageRest.toFixed(1)}w
                </Typography>
              </Box>

              {/* Timeline Track */}
              <Box sx={styles.timelineTrack}>
                {/* Shift Blocks */}
                {userMetrics.shiftHistory.map((shift, index) => {
                  const position = getBlockPosition(shift.start, shift.end);
                  const backToBack = isBackToBack(userId, index);
                  const startDate = DateTime.fromISO(shift.start);
                  const endDate = DateTime.fromISO(shift.end);

                  return (
                    <Tooltip
                      key={index}
                      title={
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', fontWeight: 'bold' }}
                          >
                            {startDate.toFormat('MMM d, yyyy')} - {endDate.toFormat('MMM d, yyyy')}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Duration: {shift.durationWeeks.toFixed(1)} weeks
                          </Typography>
                          {backToBack && (
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', color: '#ff5252' }}
                            >
                              ⚠️ Back-to-back shift
                            </Typography>
                          )}
                        </Box>
                      }
                      arrow
                    >
                      <Box
                        sx={{
                          ...styles.shiftBlock,
                          ...position,
                          backgroundColor: backToBack
                            ? theme.palette.error.main
                            : theme.palette.primary.main,
                          '&:hover': {
                            opacity: 0.8,
                            cursor: 'pointer',
                          },
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

// Memoize to prevent unnecessary re-renders
export const RotationStripPlot = memo(RotationStripPlotComponent);
