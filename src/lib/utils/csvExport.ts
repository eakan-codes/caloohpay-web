/**
 * CSV export utilities for payment data
 */

import type { OnCallCompensation, CSVExportData } from '@/lib/types';
import { PAYMENT_RATES } from '@/lib/constants';

/**
 * Escapes CSV special characters
 */
function escapeCsvValue(value: string): string {
  // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Converts compensation data to CSV format
 */
export function generateCSV(data: CSVExportData): string {
  const lines: string[] = [];

  // Schedule information header
  lines.push('');
  lines.push(`Schedule name:,${escapeCsvValue(data.scheduleName)}`);
  lines.push(`Schedule URL:,${escapeCsvValue(data.scheduleUrl)}`);
  lines.push(`Using timezone:,${escapeCsvValue(data.timezone)}`);
  lines.push('');

  // Data header
  lines.push(
    `User,Total Compensation (${PAYMENT_RATES.CURRENCY_SYMBOL}),Weekdays (Mon-Thu),Weekends (Fri-Sun)`
  );

  // Data rows
  for (const row of data.rows) {
    const userName = escapeCsvValue(row.userName);
    lines.push(`${userName},${row.totalCompensation},${row.weekdayDays},${row.weekendDays}`);
  }

  lines.push('');

  return lines.join('\n');
}

/**
 * Converts compensation array to CSV export data
 */
export function compensationToCSVData(
  compensations: OnCallCompensation[],
  scheduleName: string,
  scheduleUrl: string,
  timezone: string
): CSVExportData {
  return {
    scheduleName,
    scheduleUrl,
    timezone,
    rows: compensations.map((comp) => ({
      userName: comp.user.name,
      totalCompensation: comp.totalCompensation,
      weekdayDays: comp.weekdayDays,
      weekendDays: comp.weekendDays,
    })),
  };
}

/**
 * Downloads CSV data as a file in the browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    // Create a link to the file
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Generates a filename for CSV export
 */
export function generateCSVFilename(scheduleName: string, date?: Date): string {
  const sanitizedName = scheduleName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  return `${sanitizedName}-oncall-${dateStr}.csv`;
}

/**
 * Combines multiple CSV export data into a single CSV
 */
export function combineCSVData(dataArray: CSVExportData[]): string {
  return dataArray.map((data) => generateCSV(data)).join('\n');
}
