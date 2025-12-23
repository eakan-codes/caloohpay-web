'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  Stack,
  Card as MUICard,
  CardContent,
  Pagination,
  Button,
  ButtonGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material';
import { Header, Footer, Loading, ErrorDisplay } from '@/components/common';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { PagerDutySchedule } from '@/lib/types';

const ITEMS_PER_PAGE = 16;

interface SchedulesResponse {
  schedules: PagerDutySchedule[];
  total: number;
  limit: number;
  offset: number;
  more: boolean;
}

async function fetchSchedules(
  url: string,
  token: string,
  query: string,
  offset: number
): Promise<SchedulesResponse> {
  const params = new URLSearchParams({
    limit: ITEMS_PER_PAGE.toString(),
    offset: offset.toString(),
    ...(query && { query }),
  });

  const response = await fetch(`${url}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch schedules');
  }

  return response.json();
}

export default function SchedulesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [allSchedules, setAllSchedules] = useState<PagerDutySchedule[]>([]);
  const [useClientSideFiltering, setUseClientSideFiltering] = useState(true);

  // Calculate offset for API pagination
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const { data, error, isLoading } = useSWR(
    session?.accessToken ? ['/api/schedules', session.accessToken, apiSearchQuery, offset] : null,
    ([url, token, query, offset]) =>
      fetchSchedules(url, token as string, query as string, offset as number),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Store all schedules for client-side filtering
  useEffect(() => {
    if (data?.schedules && !apiSearchQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllSchedules((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newSchedules = data.schedules.filter((s) => !existingIds.has(s.id));
        return [...prev, ...newSchedules];
      });
    }
  }, [data, apiSearchQuery]);

  // Client-side filtering from cached schedules
  const clientFilteredSchedules = useMemo(() => {
    if (!searchQuery || !useClientSideFiltering) return [];

    return allSchedules.filter((schedule) =>
      schedule.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allSchedules, searchQuery, useClientSideFiltering]);

  // Determine if we should use client-side filtering or API search
  useEffect(() => {
    if (!searchQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!useClientSideFiltering) setUseClientSideFiltering(true);

      if (apiSearchQuery) setApiSearchQuery('');

      if (page !== 1) setPage(1);
      return;
    }

    // Try client-side filtering first
    const clientResults = allSchedules.filter((schedule) =>
      schedule.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (clientResults.length > 0) {
      // Found results in cached schedules

      if (!useClientSideFiltering) setUseClientSideFiltering(true);

      if (apiSearchQuery) setApiSearchQuery('');

      if (page !== 1) setPage(1);
    } else {
      // No client-side results, fallback to API search

      if (useClientSideFiltering) setUseClientSideFiltering(false);

      if (apiSearchQuery !== searchQuery) setApiSearchQuery(searchQuery);

      if (page !== 1) setPage(1);
    }
  }, [searchQuery, allSchedules, useClientSideFiltering, apiSearchQuery, page]);

  // Paginate client-filtered results
  const paginatedClientResults = useMemo(() => {
    if (!useClientSideFiltering || !searchQuery) return [];

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return clientFilteredSchedules.slice(start, end);
  }, [clientFilteredSchedules, page, useClientSideFiltering, searchQuery]);

  // Final schedules to display
  // When searching: use client-side paginated results if available, otherwise API results
  // When not searching: always use API results (which reflects current page via offset)
  const displaySchedules =
    searchQuery && useClientSideFiltering ? paginatedClientResults : data?.schedules || [];

  // Total count and pages
  // When not searching, use estimated total from API (based on 'more' flag)
  const totalCount = useClientSideFiltering
    ? searchQuery
      ? clientFilteredSchedules.length
      : data?.total || allSchedules.length
    : data?.total || 0;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Always show pagination controls if we have data, but disable buttons based on state
  const showPagination = (data?.schedules && data.schedules.length > 0) || isLoading;
  const isFirstPage = page === 1;
  const isLastPage = !data?.more; // Use 'more' flag to determine if we're on last page

  // Pagination handlers
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFirstPage = () => {
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLastPage = () => {
    setPage(totalPages);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (status === 'loading' || isLoading) {
    return <Loading message="Loading schedules..." fullScreen />;
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
          <ErrorDisplay
            title="Failed to Load Schedules"
            message={error.message || 'Unable to fetch schedules from PagerDuty'}
            onRetry={() => window.location.reload()}
          />
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Stack spacing={4}>
          {/* Page Header */}
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              On-Call Schedules
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select a schedule to calculate on-call compensation for your team
            </Typography>
          </Box>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search schedules by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 600 }}
          />

          {/* Schedule Count & Pagination Info */}
          {displaySchedules && totalCount > 0 && (
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Chip
                label={`${totalCount} schedule${totalCount !== 1 ? 's' : ''} found`}
                color="primary"
                variant="outlined"
              />
              {totalPages > 1 && (
                <Typography variant="body2" color="text.secondary">
                  Page {page} of {totalPages} • Showing {displaySchedules.length} of {totalCount}
                </Typography>
              )}
              {searchQuery && useClientSideFiltering && (
                <Chip label="Client-side search" size="small" color="success" variant="outlined" />
              )}
              {searchQuery && !useClientSideFiltering && (
                <Chip label="API search" size="small" color="info" variant="outlined" />
              )}
            </Stack>
          )}

          {/* Schedules Grid */}
          {displaySchedules && displaySchedules.length > 0 ? (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {displaySchedules.map((schedule) => (
                  <MUICard
                    key={schedule.id}
                    elevation={2}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        elevation: 4,
                        transform: 'translateY(-4px)',
                        boxShadow: 8,
                      },
                    }}
                    onClick={() => router.push(`/schedules/${schedule.id}`)}
                    role="article"
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <CalendarIcon color="primary" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" component="h3" fontWeight={600} noWrap>
                              {schedule.name}
                            </Typography>
                            {schedule.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {schedule.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {schedule.time_zone && (
                          <Chip
                            label={schedule.time_zone}
                            size="small"
                            variant="outlined"
                            sx={{ alignSelf: 'flex-start' }}
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </MUICard>
                ))}
              </Box>

              {/* Pagination Controls */}
              {showPagination && (
                <Stack spacing={3} alignItems="center">
                  {/* Navigation Buttons */}
                  <ButtonGroup variant="outlined" size="large">
                    <Button
                      onClick={handleFirstPage}
                      disabled={isFirstPage}
                      startIcon={<FirstPageIcon />}
                    >
                      First
                    </Button>
                    <Button
                      onClick={handlePrevPage}
                      disabled={isFirstPage}
                      startIcon={<PrevIcon />}
                    >
                      Previous
                    </Button>
                    <Button onClick={handleNextPage} disabled={isLastPage} endIcon={<NextIcon />}>
                      Next
                    </Button>
                    <Button
                      onClick={handleLastPage}
                      disabled={isLastPage}
                      endIcon={<LastPageIcon />}
                    >
                      Last
                    </Button>
                  </ButtonGroup>

                  {/* Page Number Pagination */}
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    siblingCount={1}
                    boundaryCount={1}
                  />
                </Stack>
              )}
            </>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
              }}
            >
              <CalendarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? 'No schedules found' : 'No schedules available'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Create schedules in PagerDuty to get started'}
              </Typography>
            </Box>
          )}
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}
