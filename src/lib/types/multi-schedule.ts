export interface MultiScheduleRequest {
  scheduleIds: string[];
  startDate: string; // ISO date
  endDate: string; // ISO date
}

export interface ScheduleMetadata {
  id: string;
  name: string;
  html_url: string;
  time_zone: string;
}

export interface EmployeeCompensation {
  name: string;
  totalCompensation: number;
  weekdayHours: number;
  weekendHours: number;
  isOverlapping?: boolean; // Flag to indicate if this employee has overlap
}

export interface ScheduleCompensationReport {
  metadata: ScheduleMetadata;
  employees: EmployeeCompensation[];
}

export interface MultiScheduleReportResponse {
  reports: ScheduleCompensationReport[];
  period: {
    start: string;
    end: string;
  };
}
