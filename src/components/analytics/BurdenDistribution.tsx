/**
 * Burden Distribution Component
 * Shows pie chart of on-call time distribution across team members
 */

'use client';

import { Box, Typography, Paper } from '@mui/material';
import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { UserBurdenData } from '@/lib/types';
import { HelpModal } from '@/components/common/HelpModal';
import * as styles from './BurdenDistribution.styles';

interface BurdenDistributionProps {
  data: UserBurdenData[];
}

// Color palette for pie chart slices
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#8DD1E1',
  '#D084D0',
  '#A4DE6C',
];

function BurdenDistributionComponent({ data }: BurdenDistributionProps) {
  // Transform data for recharts
  const chartData = data.map((item) => ({
    name: item.userName,
    value: item.totalOnCallHours,
    percentage: item.percentage,
  }));

  // Custom label renderer
  const renderLabel = (entry: unknown) => {
    const data = entry as { percentage: number };
    return `${data.percentage}%`;
  };

  return (
    <Paper sx={styles.container}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Burden Distribution</Typography>
        <HelpModal
          title="Burden Distribution"
          description="A pie chart showing how on-call time is distributed across team members as a percentage of the total on-call hours."
          howToRead={
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>Each slice represents one team member</li>
              <li>Slice size is proportional to their total on-call hours</li>
              <li>Percentages show each person&apos;s share of the total burden</li>
              <li>Hover over slices to see exact hours and percentages</li>
              <li>Legend on the right shows names and total hours</li>
            </Box>
          }
          value={
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                This visualization helps you:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Identify uneven distribution of on-call duties</li>
                <li>Ensure fair rotation and prevent burnout</li>
                <li>Spot team members who may need support or backup</li>
                <li>Make data-driven decisions about rotation adjustments</li>
              </Box>
            </Box>
          }
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Percentage of total on-call time per team member
      </Typography>

      {data.length === 0 ? (
        <Box sx={styles.emptyState}>
          <Typography variant="body2" color="text.secondary">
            No data available for the selected period
          </Typography>
        </Box>
      ) : (
        <Box sx={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Paper sx={styles.tooltipContainer}>
                        <Typography variant="body2" fontWeight="bold">
                          {data.name}
                        </Typography>
                        <Typography variant="body2">Hours: {data.value.toFixed(1)}</Typography>
                        <Typography variant="body2">Percentage: {data.percentage}%</Typography>
                      </Paper>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => {
                  const item = data.find((d) => d.userName === value);
                  return `${value} (${item?.totalOnCallHours.toFixed(1)}h)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Summary statistics */}
      {data.length > 0 && (
        <Box sx={styles.summaryContainer}>
          <Typography variant="body2" color="text.secondary">
            Total on-call hours:{' '}
            {data.reduce((sum, item) => sum + item.totalOnCallHours, 0).toFixed(1)}h
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Team members: {data.length}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

// Memoize to prevent unnecessary re-renders
export const BurdenDistribution = memo(BurdenDistributionComponent);
