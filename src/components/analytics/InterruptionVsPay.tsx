/**
 * Interruption vs Pay Correlation Component
 * Shows scatter plot of interruptions vs compensation
 */

'use client';

import { Box, Typography, Paper } from '@mui/material';
import { memo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import type { UserInterruptionData } from '@/lib/types';
import { PAYMENT_RATES } from '@/lib/constants';
import { HelpModal } from '@/components/common/HelpModal';
import * as styles from './InterruptionVsPay.styles';

interface InterruptionVsPayProps {
  data: UserInterruptionData[];
}

function InterruptionVsPayComponent({ data }: InterruptionVsPayProps) {
  // Transform data for recharts
  const chartData = data.map((item) => ({
    name: item.userName,
    interruptions: item.totalInterruptions,
    pay: item.totalPay,
  }));

  return (
    <Paper sx={styles.container}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Interruption vs Pay Correlation</Typography>
        <HelpModal
          title="Interruption vs Pay Correlation"
          description="A scatter plot showing the relationship between work interruptions (from incidents) and compensation for on-call duties."
          howToRead={
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <li>Each dot represents one team member</li>
              <li>X-axis shows total compensation (in GBP)</li>
              <li>Y-axis shows interruption score based on incidents handled</li>
              <li>
                Interruption score factors in time-to-resolve:
                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                  <li>&lt; 12 hours: 0.5x (quick resolution)</li>
                  <li>12-24 hours: 1.0x (standard incident)</li>
                  <li>24-72 hours: 2.0x (extended disruption)</li>
                  <li>&gt; 72 hours: 3.0x (severe interruption)</li>
                </Box>
              </li>
              <li>Hover over dots to see individual details</li>
            </Box>
          }
          value={
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                This visualization helps you:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Assess if compensation aligns with actual work burden</li>
                <li>Identify team members with high interruptions relative to pay</li>
                <li>Make informed decisions about compensation adjustments</li>
                <li>Understand the true cost of incidents beyond just on-call time</li>
              </Box>
            </Box>
          }
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Relationship between on-call hours and compensation
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
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 60,
                left: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="pay" name="Pay">
                <Label
                  value={`Compensation (${PAYMENT_RATES.CURRENCY_SYMBOL})`}
                  position="insideBottom"
                  offset={-40}
                />
              </XAxis>
              <YAxis type="number" dataKey="interruptions" name="Hours">
                <Label
                  value="On-Call Hours"
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: 'middle' }}
                />
              </YAxis>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Paper sx={styles.tooltipContainer}>
                        <Typography variant="body2" fontWeight="bold">
                          {data.name}
                        </Typography>
                        <Typography variant="body2">Hours: {data.interruptions}</Typography>
                        <Typography variant="body2">
                          Pay: {PAYMENT_RATES.CURRENCY_SYMBOL}
                          {data.pay.toFixed(2)}
                        </Typography>
                      </Paper>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Team Members" data={chartData} fill="#8884d8" shape="circle" r={8} />
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Summary statistics */}
      {data.length > 0 && (
        <Box sx={styles.summaryContainer}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Compensation
            </Typography>
            <Typography variant="h6">
              {PAYMENT_RATES.CURRENCY_SYMBOL}
              {data.reduce((sum, item) => sum + item.totalPay, 0).toFixed(2)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Hours
            </Typography>
            <Typography variant="h6">
              {data.reduce((sum, item) => sum + item.totalInterruptions, 0)}h
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Average Rate
            </Typography>
            <Typography variant="h6">
              {PAYMENT_RATES.CURRENCY_SYMBOL}
              {(
                data.reduce((sum, item) => sum + item.totalPay, 0) /
                data.reduce((sum, item) => sum + item.totalInterruptions, 1)
              ).toFixed(2)}
              /h
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

// Memoize to prevent unnecessary re-renders
export const InterruptionVsPay = memo(InterruptionVsPayComponent);
