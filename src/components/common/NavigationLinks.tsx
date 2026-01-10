import React from 'react';
import { Button } from '@mui/material';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface NavigationLinksProps {
  isAuthenticated: boolean;
}

/**
 * Navigation links component for authenticated users
 */
export const NavigationLinks: React.FC<NavigationLinksProps> = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Button color="inherit" component={Link} href={ROUTES.SCHEDULES}>
        Schedules
      </Button>
      <Button color="inherit" component={Link} href={ROUTES.SCHEDULE_MULTI_GRID}>
        Reports
      </Button>
    </>
  );
};
