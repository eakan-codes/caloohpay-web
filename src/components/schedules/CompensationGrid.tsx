import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  ColGroupDef,
  ICellRendererParams,
  ValueFormatterParams,
  RowSpanParams,
  themeQuartz,
} from 'ag-grid-community';
import { ScheduleCompensationReport } from '@/lib/types/multi-schedule';
import { Box, Chip, useTheme } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

interface CompensationGridProps {
  reports: ScheduleCompensationReport[];
}

interface FlatReportRow {
  // Schedule Data
  scheduleName: string;
  scheduleId: string;
  scheduleUrl: string;
  timezone: string;

  // Employee Data
  employeeName: string;
  totalCompensation: number;
  weekdayHours: number;
  weekendHours: number;
  isOverlapping: boolean;
}

const CompensationGrid: React.FC<CompensationGridProps> = ({ reports }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Flatten reports into rows
  const rowData = useMemo(() => {
    const rows: FlatReportRow[] = [];
    reports.forEach((report) => {
      if (!report?.metadata) return;
      report.employees.forEach((emp) => {
        rows.push({
          scheduleName: report.metadata.name,
          scheduleId: report.metadata.id,
          scheduleUrl: report.metadata.html_url,
          timezone: report.metadata.time_zone,
          employeeName: emp.name,
          totalCompensation: emp.totalCompensation,
          weekdayHours: emp.weekdayHours,
          weekendHours: emp.weekendHours,
          isOverlapping: !!emp.isOverlapping,
        });
      });
    });
    return rows;
  }, [reports]);

  // Dynamic Row Span Logic
  const getRowSpan = useCallback((params: RowSpanParams<FlatReportRow>) => {
    const rowIndex = params.node?.rowIndex ?? -1;
    if (rowIndex === -1) return 1;

    const currentData = params.data;
    if (!currentData) return 1;

    // Check if previous row has same Schedule ID (if so, we are inside a span group aka covered)
    // We return 1 for covered rows, but AG Grid won't render them due to the span above.
    const api = params.api;
    const prevRowNode = api.getDisplayedRowAtIndex(rowIndex - 1);
    const prevData = prevRowNode?.data as FlatReportRow | undefined;

    if (prevData && prevData.scheduleId === currentData.scheduleId) {
      return 1;
    }

    // We are at start of group. Count forward.
    let count = 1;
    let nextIndex = rowIndex + 1;
    while (true) {
      const nextRowNode = api.getDisplayedRowAtIndex(nextIndex);
      const nextData = nextRowNode?.data as FlatReportRow | undefined;

      if (nextData && nextData.scheduleId === currentData.scheduleId) {
        count++;
        nextIndex++;
      } else {
        break;
      }
    }
    return count;
  }, []);

  // Shared cell styles for spanned columns
  const spannedCellStyle = useMemo(
    () => ({
      backgroundColor: isDark ? '#1e1e1e' : '#f8f9fa',
      borderRight: `1px solid ${isDark ? '#333' : '#dde2eb'}`,
      display: 'flex',
      alignItems: 'center', // Vertically center content
      justifyContent: 'flex-start',
      color: isDark ? '#e0e0e0' : 'inherit',
    }),
    [isDark]
  );

  const spannedClassRules = useMemo(
    () => ({
      'p-2': () => true, // Add padding
    }),
    []
  );

  const columnDefs = useMemo<(ColDef<FlatReportRow> | ColGroupDef<FlatReportRow>)[]>(
    () => [
      {
        headerName: 'Schedule Metadata',
        children: [
          {
            field: 'scheduleName',
            headerName: 'Schedule',
            width: 260,
            rowSpan: getRowSpan,
            cellStyle: spannedCellStyle,
            cellClassRules: spannedClassRules,
            cellRenderer: (params: ICellRendererParams<FlatReportRow>) => {
              if (!params.data) return null;
              const url = params.data.scheduleUrl;
              const linkColor = isDark ? '#90caf9' : '#1565c0';
              const subTextColor = isDark ? '#aaa' : '#666';

              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    lineHeight: '1.2',
                  }}
                >
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontWeight: 600,
                        color: linkColor,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {params.value}
                      </span>
                      <OpenInNewIcon style={{ fontSize: 13, flexShrink: 0, opacity: 0.8 }} />
                    </a>
                  ) : (
                    <span style={{ fontWeight: 600 }}>{params.value}</span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: subTextColor }}>
                    {params.data.timezone}
                  </span>
                </div>
              );
            },
          },
        ],
      },
      {
        headerName: 'Compensation Details',
        children: [
          {
            field: 'employeeName',
            headerName: 'Employee',
            flex: 1,
            minWidth: 150,
            cellRenderer: (params: ICellRendererParams<FlatReportRow>) => {
              if (!params.data) return null;
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                  <span>{params.value}</span>
                  {params.data.isOverlapping && (
                    <Chip
                      label="Split"
                      size="small"
                      color="warning"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>
              );
            },
          },
          {
            field: 'weekdayHours',
            headerName: 'Weekdays',
            width: 110,
            type: 'numericColumn',
            valueFormatter: (params: ValueFormatterParams) => params.value?.toFixed(2) ?? '0.00',
          },
          {
            field: 'weekendHours',
            headerName: 'Weekends',
            width: 110,
            type: 'numericColumn',
            valueFormatter: (params: ValueFormatterParams) => params.value?.toFixed(2) ?? '0.00',
          },
          {
            field: 'totalCompensation',
            headerName: 'Total (£)',
            width: 130,
            type: 'numericColumn',
            cellStyle: { fontWeight: 'bold' },
            valueFormatter: (params: ValueFormatterParams) =>
              `£${params.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}`,
          },
        ],
      },
    ],
    [getRowSpan, isDark, spannedCellStyle, spannedClassRules]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
    }),
    []
  );

  const gridTheme = useMemo(() => {
    return themeQuartz.withParams({
      browserColorScheme: isDark ? 'dark' : 'light',
      borderColor: isDark ? '#424242' : '#e0e0e0',
      headerBackgroundColor: isDark ? '#333' : '#f5f5f5',
      headerTextColor: isDark ? '#ffffff' : '#000000',
      headerFontWeight: '600',
      rowHeight: 48,
      foregroundColor: isDark ? '#f0f0f0' : '#181d1f',
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
    });
  }, [isDark]);

  return (
    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Force vertical borders for grid-line effect */
            .ag-theme-quartz .ag-cell {
                border-right: 1px solid var(--ag-border-color);
            }
            .ag-header-cell {
                border-right: 1px solid var(--ag-border-color);
            }
        `,
        }}
      />
      <AgGridReact
        theme={gridTheme}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        // Disable pagination to support Row Spanning
        pagination={false}
        suppressCellFocus={true}
        rowHeight={48}
        animateRows={true}
      />
    </Box>
  );
};

export default CompensationGrid;
