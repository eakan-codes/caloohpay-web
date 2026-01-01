'use client';

import { Box, Container, Typography, Button, Stack, Paper } from '@mui/material';
import {
  Schedule as ScheduleIcon,
  AccountBalance as PaymentIcon,
  TableChart as ExportIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { Header, Footer } from '@/components/common';

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Hero Section */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={6} alignItems="center" textAlign="center">
            <Stack spacing={3} maxWidth="800px">
              <Typography
                variant="h2"
                component="h2"
                fontWeight={700}
                sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
              >
                Automate On-Call Payment Calculations
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' } }}
              >
                Calculate out-of-hours compensation for engineering teams using PagerDuty schedules.
                Save time, eliminate errors, and ensure fair payment.
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component={Link}
                href="/login"
                variant="contained"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Get Started
              </Button>
              <Button
                component={Link}
                href="https://github.com/lonelydev/caloohpay"
                target="_blank"
                variant="outlined"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                View CLI Tool
              </Button>
            </Stack>

            {/* Features Grid */}
            <Box sx={{ pt: 6, width: '100%' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="center">
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    flex: 1,
                    maxWidth: { md: '280px' },
                    textAlign: 'center',
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    PagerDuty Integration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Direct integration with PagerDuty API. View schedules in monthly calendar format
                    with timezone support.
                  </Typography>
                </Paper>

                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    flex: 1,
                    maxWidth: { md: '280px' },
                    textAlign: 'center',
                  }}
                >
                  <PaymentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Smart Calculations
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Automatic calculation of OOH compensation with customizable rates. Default: £50
                    per weekday, £75 per weekend. Auditable and transparent.
                  </Typography>
                </Paper>

                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    flex: 1,
                    maxWidth: { md: '280px' },
                    textAlign: 'center',
                  }}
                >
                  <ExportIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Easy Export
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Export payment data to CSV for payroll. Google Sheets compatible format with
                    detailed breakdowns.
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
