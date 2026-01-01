'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Container, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { Header, Footer } from '@/components/common';
import { SettingsForm, type SettingsFormData } from '@/components/settings';
import { useSettings } from '@/hooks';
import { getSettingsStore } from '@/lib/stores';
import {
  containerStyles,
  headerSectionStyles,
  pageTitleStyles,
  alertStyles,
  loadingContainerStyles,
  infoBoxStyles,
} from './page.styles';

export default function SettingsPage() {
  const settings = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (data: SettingsFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Update store with new values
      getSettingsStore.getState().setWeekdayRate(data.weekdayRate);
      getSettingsStore.getState().setWeekendRate(data.weekendRate);

      // Show success message
      setShowSuccess(true);

      // Clear any existing timeout
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      // Hide success message after 3 seconds
      successTimeoutRef.current = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Current form values from store
  const initialValues = {
    weekdayRate: settings.weekdayRate,
    weekendRate: settings.weekendRate,
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={containerStyles}>
        {/* Page Header */}
        <Box sx={headerSectionStyles}>
          <Typography variant="h1" component="h1" sx={pageTitleStyles}>
            Settings
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Customize your payment rates for on-call compensation calculations
          </Typography>
        </Box>

        {/* Success Message */}
        {showSuccess && (
          <Alert severity="success" sx={alertStyles} onClose={() => setShowSuccess(false)}>
            Settings saved successfully!
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={alertStyles} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <Box sx={loadingContainerStyles}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Settings Form */}
        <SettingsForm initialValues={initialValues} onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Information Box */}
        <Box sx={infoBoxStyles}>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> These rates are used to calculate your on-call compensation.
            Changes will be applied to new calculations immediately. Weekday rates apply
            Monday–Thursday, and weekend rates apply Friday–Sunday.
          </Typography>
        </Box>
      </Container>
      <Footer />
    </>
  );
}
