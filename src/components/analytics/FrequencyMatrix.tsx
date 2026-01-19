/**
 * Frequency Matrix Heatmap Component
 * Shows a 7x24 grid of when users are on-call most frequently
 */

'use client';

import { Box, Typography, Paper, useTheme, Tooltip } from '@mui/material';
import { useMemo, memo } from 'react';
import type { FrequencyMatrixCell } from '@/lib/types';
import { getDayName, formatHour } from '@/lib/utils/analyticsUtils';
import * as styles from './FrequencyMatrix.styles';

interface FrequencyMatrixProps {
  data: FrequencyMatrixCell[];
  userName?: string;
}

function FrequencyMatrixComponent({ data, userName }: FrequencyMatrixProps) {
  const theme = useTheme();

  // Find max count for color scaling
  const maxCount = useMemo(() => {
    return Math.max(...data.map((cell) => cell.count), 1);
  }, [data]);

  // Get color intensity based on count
  const getColor = (count: number): string => {
    if (count === 0) {
      return theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5';
    }

    const intensity = count / maxCount;
    const baseColor = theme.palette.primary.main;

    // Convert hex to RGB and adjust opacity
    const rgb = hexToRgb(baseColor);
    if (!rgb) return baseColor;

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0.2, intensity)})`;
  };

  // Create fast lookup map for cells
  const cellMap = useMemo(() => {
    const map = new Map<string, FrequencyMatrixCell>();
    data.forEach((cell) => {
      map.set(`${cell.dayOfWeek}-${cell.hour}`, cell);
    });
    return map;
  }, [data]);

  return (
    <Paper sx={styles.container}>
      <Typography variant="h6" gutterBottom>
        Frequency Matrix {userName ? `- ${userName}` : ''}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Shows when on-call shifts occur most frequently
      </Typography>

      <Box sx={styles.heatmapContainer}>
        {/* Hour labels */}
        <Box sx={styles.hourLabelsContainer}>
          <Box sx={styles.cornerCell} />
          {Array.from({ length: 24 }, (_, hour) => (
            <Box key={hour} sx={styles.hourLabel}>
              {hour}
            </Box>
          ))}
        </Box>

        {/* Grid with day labels and cells */}
        {Array.from({ length: 7 }).map((_, dayIndex) => (
          <Box key={dayIndex} sx={styles.gridRow}>
            <Box sx={styles.dayLabel}>{getDayName(dayIndex)}</Box>
            {Array.from({ length: 24 }).map((_, hour) => {
              const cell = cellMap.get(`${dayIndex}-${hour}`);
              const count = cell?.count || 0;

              const summaryText = `${getDayName(dayIndex)} ${formatHour(hour)}: ${count} shifts`;

              const tooltipContent = (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {getDayName(dayIndex)} {formatHour(hour)}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Total shifts: {count}
                  </Typography>
                  {cell?.users && cell.users.length > 0 && (
                    <Box component="ul" sx={{ pl: 2, m: 0, fontSize: '0.75rem' }}>
                      {cell.users.slice(0, 5).map((u, i) => (
                        <li key={i}>
                          {u.name}: {u.count}
                        </li>
                      ))}
                      {cell.users.length > 5 && <li>+ {cell.users.length - 5} more</li>}
                    </Box>
                  )}
                </Box>
              );

              return (
                <Tooltip key={`${dayIndex}-${hour}`} title={tooltipContent} arrow placement="top">
                  <Box
                    aria-label={summaryText}
                    sx={{
                      ...styles.gridCell,
                      backgroundColor: getColor(count),
                    }}
                  >
                    {count > 0 && <Typography sx={styles.cellText}>{count}</Typography>}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* Legend */}
      <Box sx={styles.legendContainer}>
        <Typography variant="caption" sx={{ mr: 2 }}>
          Low
        </Typography>
        <Box sx={styles.legendGradient} />
        <Typography variant="caption" sx={{ ml: 2 }}>
          High ({maxCount} shifts)
        </Typography>
      </Box>
    </Paper>
  );
}

// Memoize to prevent unnecessary re-renders
export const FrequencyMatrix = memo(FrequencyMatrixComponent);

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
