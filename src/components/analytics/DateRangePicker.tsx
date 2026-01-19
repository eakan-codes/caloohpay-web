/**
 * Date Range Picker Component for Analytics
 * Allows users to select a custom date range with constraints
 */

'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { DateRange } from '@mui/icons-material';
import { DateTime } from 'luxon';

interface DateRangePickerProps {
  currentSince: string;
  currentUntil: string;
  onDateRangeChange: (since: string, until: string) => void;
}

export function DateRangePicker({
  currentSince,
  currentUntil,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [since, setSince] = useState(() => DateTime.fromISO(currentSince).toFormat('yyyy-MM-dd'));
  const [until, setUntil] = useState(() => DateTime.fromISO(currentUntil).toFormat('yyyy-MM-dd'));
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setSince(DateTime.fromISO(currentSince).toFormat('yyyy-MM-dd'));
    setUntil(DateTime.fromISO(currentUntil).toFormat('yyyy-MM-dd'));
    setError(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleApply = () => {
    setError(null);

    // Validate dates
    const sinceDate = DateTime.fromISO(since);
    const untilDate = DateTime.fromISO(until);
    const now = DateTime.now();
    const twoYearsAgo = now.minus({ years: 2 });

    if (!sinceDate.isValid || !untilDate.isValid) {
      setError('Please enter valid dates');
      return;
    }

    if (untilDate <= sinceDate) {
      setError('End date must be after start date');
      return;
    }

    // Check if start date is within 2 years
    if (sinceDate < twoYearsAgo) {
      setError('Start date cannot be more than 2 years in the past');
      return;
    }

    // Check if date range is within 1 year
    const daysDiff = untilDate.diff(sinceDate, 'days').days;
    if (daysDiff > 365) {
      setError('Date range cannot exceed 1 year (365 days)');
      return;
    }

    // Apply the date range
    onDateRangeChange(sinceDate.toISO() || '', untilDate.toISO() || '');
    handleClose();
  };

  const handleQuickSelect = (months: number) => {
    const now = DateTime.now();
    const startDate = now.minus({ months });
    setSince(startDate.toFormat('yyyy-MM-dd'));
    setUntil(now.toFormat('yyyy-MM-dd'));
    setError(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<DateRange />}
        onClick={handleOpen}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Custom Date Range
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Select Date Range</DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField
              label="Start Date"
              type="date"
              value={since}
              onChange={(e) => {
                setSince(e.target.value);
                setError(null);
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: until,
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              label="End Date"
              type="date"
              value={until}
              onChange={(e) => {
                setUntil(e.target.value);
                setError(null);
              }}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: since,
                max: DateTime.now().toFormat('yyyy-MM-dd'),
              }}
            />
          </Box>

          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Constraints:</strong>
              <br />• Maximum range: 1 year (365 days)
              <br />• Cannot go back more than 2 years
            </Alert>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" variant="outlined" onClick={() => handleQuickSelect(1)}>
                Last Month
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleQuickSelect(3)}>
                Last 3 Months
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleQuickSelect(6)}>
                Last 6 Months
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleQuickSelect(12)}>
                Last Year
              </Button>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleApply} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
