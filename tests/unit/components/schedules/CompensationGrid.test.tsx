import React from 'react';
import { render, screen } from '@testing-library/react';
import CompensationGrid from '@/components/schedules/CompensationGrid';
import { ScheduleCompensationReport } from '@/lib/types/multi-schedule';

// Mock AG Grid because it's heavy and hard to test strictly in JSDOM without setup
// We want to verify that we are passing the right data to AG Grid.
jest.mock('ag-grid-react', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AgGridReact: ({ rowData }: any) => (
    <div data-testid="ag-grid">
      <div data-testid="row-count">{rowData?.length || 0}</div>
      {/* Render a simpler representation for testing */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {rowData.map((row: any, i: number) => (
        <div key={i} data-testid="grid-row">
          <span>Schedule: {row.scheduleName}</span>
          <span>Employee: {row.employeeName}</span>
          <span>Compensation: {row.totalCompensation}</span>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: () => ({
    palette: {
      mode: 'light',
    },
  }),
}));

describe('CompensationGrid', () => {
  const mockReports: ScheduleCompensationReport[] = [
    {
      metadata: {
        id: 'SCHWXYZ',
        name: 'Primary On-Call',
        html_url: 'https://pd.com/s/1',
        time_zone: 'UTC',
      },
      employees: [
        {
          name: 'Alice Smith',
          totalCompensation: 350.5,
          weekdayHours: 5,
          weekendHours: 2,
          isOverlapping: false,
        },
        {
          name: 'Bob Jones',
          totalCompensation: 100.0,
          weekdayHours: 2,
          weekendHours: 0,
          isOverlapping: true,
        },
      ],
    },
    {
      metadata: {
        id: 'SCH2',
        name: 'Secondary',
        html_url: 'https://pd.com/s/2',
        time_zone: 'EST',
      },
      employees: [],
    },
  ];

  it('flattens reports into rows correctly', () => {
    // Schedule 1 has 2 employees -> 2 rows
    // Schedule 2 has 0 employees -> 0 rows (based on current logic they wouldn't appear if loop is on employees)
    // Wait, let's check: reports.forEach -> employees.forEach
    // If employees is empty, loop doesn't run. So 2 rows expected.

    render(<CompensationGrid reports={mockReports} />);

    expect(screen.getByTestId('row-count')).toHaveTextContent('2');

    const rows = screen.getAllByTestId('grid-row');
    expect(rows).toHaveLength(2);

    expect(rows[0]).toHaveTextContent('Schedule: Primary On-Call');
    expect(rows[0]).toHaveTextContent('Employee: Alice Smith');

    expect(rows[1]).toHaveTextContent('Schedule: Primary On-Call');
    expect(rows[1]).toHaveTextContent('Employee: Bob Jones');
  });

  it('renders nothing if reports are empty', () => {
    render(<CompensationGrid reports={[]} />);
    expect(screen.getByTestId('row-count')).toHaveTextContent('0');
  });
});
