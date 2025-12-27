import type { User, ScheduleEntry } from '@/lib/types';

export interface OnCallScheduleEntry extends ScheduleEntry {
  duration: number;
  weekdayDays: number;
  weekendDays: number;
  compensation: number;
}

export interface UserSchedule {
  user: User;
  entries: OnCallScheduleEntry[];
  totalHours: number;
  totalWeekdays: number;
  totalWeekends: number;
  totalCompensation: number;
}

export interface OnCallScheduleProps {
  /** Array of user schedules with on-call periods and compensation */
  userSchedules: UserSchedule[];
  /** Display string for current month (e.g. "January 2025") */
  currentMonthDisplay: string;
  /** IANA timezone identifier */
  timeZone: string;
  /** Whether data is currently loading */
  isLoading: boolean;
}
