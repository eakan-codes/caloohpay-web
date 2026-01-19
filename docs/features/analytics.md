# Schedule Analytics Feature

## Overview

The Schedule Analytics feature provides visual insights into on-call patterns and team burden distribution. It helps engineering managers identify burnout risks and ensure fair on-call distribution.

## Features

### 1. Frequency Matrix (Heatmap)

**Purpose**: Identify when specific users are on-call most frequently

- **Visual**: 7x24 grid (days × hours)
- **Data**: Shows concentration of on-call shifts by day and hour
- **Use Case**: Detect if someone is consistently stuck with "Sunday Night" shifts

### 2. Burden Distribution (Pie Chart)

**Purpose**: Visualize on-call load distribution across team members

- **Visual**: Pie chart with percentages
- **Data**: Total on-call hours per user
- **Use Case**: Spot "Hero Culture" where one person carries 50% of on-call while others do 5%

### 3. Interruption vs Pay Correlation (Scatter Plot)

**Purpose**: Compare compensation vs. actual interruptions from incidents

- **Visual**: Scatter plot with pay on X-axis, interruption score on Y-axis
- **Data**: Compensation vs. incident-based interruption score per user
- **Use Case**: Identify "Underpaid Heroes" who handle complex, time-consuming incidents but receive standard compensation
- **Interruption Scoring**: Uses actual PagerDuty incident data with time-to-resolve multipliers
  - < 12 hours: 0.5x factor (quick resolution)
  - 12-24 hours: 1.0x factor (standard incident)
  - 24-72 hours: 2.0x factor (extended disruption)
  - > 72 hours: 3.0x factor (severe interruption)

## Accessing Analytics

1. Navigate to any schedule detail page: `/schedules/[id]`
2. Click the **Analytics** button above the month navigation
3. View analytics dashboard with all three visualizations
4. Use the **Custom Date Range** button to select a specific time period (up to 1 year, max 2 years back)
5. Click the **?** icon next to any visualization for help on how to interpret it

## Data Source

- **Time Period**: Default is last 6 months; customizable via date range picker (1 year max, 2 years lookback)
- **API Endpoints**:
  - PagerDuty `/oncalls` endpoint (with pagination for >100 entries)
  - PagerDuty `/incidents` endpoint (for interruption correlation)
- **Update Frequency**: Real-time (fetches on page load or date range change)
- **Pagination**: Automatically fetches all pages to ensure no employees are missing

## Technical Implementation

### Components

```
src/components/analytics/
├── FrequencyMatrix.tsx          # Heatmap component
├── FrequencyMatrix.styles.ts    # Heatmap styles
├── BurdenDistribution.tsx       # Pie chart component
├── BurdenDistribution.styles.ts # Pie chart styles
├── InterruptionVsPay.tsx        # Scatter plot component
├── InterruptionVsPay.styles.ts  # Scatter plot styles
├── DateRangePicker.tsx          # Date range selection component
└── index.ts                     # Barrel exports

src/components/common/
└── HelpModal.tsx                # Reusable help modal for visualizations
```

### API Routes

```
src/app/api/analytics/
├── oncalls/route.ts   # Fetches on-call data from PagerDuty (with pagination)
└── incidents/route.ts # Fetches incident data for interruption scoring
```

### Utilities

```
src/lib/utils/analyticsUtils.ts
├── buildFrequencyMatrix()              # Transforms oncalls to heatmap data
├── calculateBurdenDistribution()       # Calculates user percentages
├── calculateInterruptionCorrelation()  # Computes pay vs hours
├── getDayName()                        # Helper for day labels
└── formatHour()                        # Helper for hour labels
```

### Types

```typescript
interface OnCallEntry {
  user: User;
  schedule: { id: string; summary: string; html_url: string };
  start: string;
  end: string;
}

interface FrequencyMatrixCell {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  count: number; // Number of times on-call
}

interface UserBurdenData {
  userId: string;
  userName: string;
  totalOnCallHours: number;
  percentage: number;
}

interface UserInterruptionData {
  userId: string;
  userName: string;
  totalInterruptions: number;
  totalPay: number;
}
```

## Payment Calculation

### Rates

- **Weekday (Mon-Thu)**: £50 per qualifying night (default)
- **Weekend (Fri-Sun)**: £75 per qualifying night (default)

_Note: Rates can be customized in Settings page_

### Logic

- **Per-Night Calculation**: Pay is calculated per qualifying out-of-hours (OOH) night, NOT per hour
- **OOH Qualification Criteria**:
  - Shift must last at least 6 hours
  - Shift must extend past 17:30 (end of work day)
  - Counted per calendar day (not per shift)
- **Weekend Definition**: Friday-Sunday (not just Sat-Sun)
- **Day Classification**: Based on which day(s) the qualifying OOH period covers
- Uses `getCurrentRates()` from `ratesUtils.ts` to support user customization
- Matches the official [caloohpay](https://www.npmjs.com/package/caloohpay) package calculation logic

## Testing

### Unit Tests

- `analyticsUtils.test.ts`: 14 tests for data transformation and payment calculation
  - Includes tests for per-night OOH qualification
  - Multi-day shift calculation tests
  - Weekday/weekend classification tests
- `FrequencyMatrix.test.tsx`: 10 tests for heatmap component
- `BurdenDistribution.test.tsx`: 8 tests for pie chart component
- `InterruptionVsPay.test.tsx`: 7 tests for scatter plot component

### Running Tests

```bash
npm test -- --testPathPatterns=analytics
```

## Dependencies

- **Recharts**: Chart library for React
  - `recharts` - Installed in package.json
  - Used for PieChart, ScatterChart, and associated components

- **Luxon**: Date/time library
  - Already used in project for timezone-aware operations
  - Used to parse ISO8601 timestamps and calculate durations

## Accessibility

All components follow WCAG 2.1 Level AA standards:

- Proper heading hierarchy (h6 for component titles)
- Descriptive text for each visualization
- **Help buttons** with detailed explanations of each chart
- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigable (via MUI components)
- Color contrast compliant
- **Non-blocking modals** that don't obscure visualizations

## Recent Enhancements

### ✅ Implemented Features

1. **✅ Date Range Selector**: Users can select custom time periods (up to 1 year, max 2 years lookback)
2. **✅ Help Modals**: Contextual help buttons on every visualization explaining how to read and interpret data
3. **✅ Pagination Support**: Handles schedules with >100 on-call entries (PagerDuty API limit)
4. **✅ Incident-Based Interruption Scoring**: Uses actual PagerDuty incident data with time-to-resolve multipliers
5. **✅ Per-Night Payment Calculation**: Accurate OOH compensation matching caloohpay package logic
6. **✅ Chart Persistence**: Charts no longer re-render on tab focus changes

## Future Enhancements

1. **User Filtering**: Filter frequency matrix by specific user
2. **Export Functionality**: Download analytics data as CSV/PDF
3. **Expanded Views**: Click visualization to see detailed breakdown
4. **Historical Trends**: Track changes over time with line charts
5. **Alerting**: Notify when burden distribution becomes imbalanced
6. **Real-time Updates**: WebSocket integration for live incident tracking

## Related Documentation

- [Product Spec](../../product-specs/schedule-trends.md)
- [PagerDuty API Docs](https://developer.pagerduty.com/docs/rest-api-v2/oncalls-api/)
- [Copilot Instructions](../../.github/copilot-instructions.md)
