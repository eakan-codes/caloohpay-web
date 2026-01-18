/**
 * Burden Distribution Component
 * Shows pie chart of on-call time distribution across team members
 */

'use client';

import { Box, Typography, Paper, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { UserBurdenData } from '@/lib/types';
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

export function BurdenDistribution({ data }: BurdenDistributionProps) {
  const theme = useTheme();

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
      <Typography variant="h6" gutterBottom>
        Burden Distribution
      </Typography>
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
                formatter={(value, entry) => {
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
