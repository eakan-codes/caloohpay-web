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

**Purpose**: Compare compensation vs. actual on-call hours

- **Visual**: Scatter plot with pay on X-axis, hours on Y-axis
- **Data**: Monthly pay vs. on-call hours per user
- **Use Case**: Identify "Underpaid Heroes" who get paged constantly but receive the same flat rate

## Accessing Analytics

1. Navigate to any schedule detail page: `/schedules/[id]`
2. Click the **Analytics** button above the month navigation
3. View analytics dashboard with all three visualizations

## Data Source

- **Time Period**: Last 6 months from current date
- **API Endpoint**: PagerDuty `/oncalls` endpoint
- **Update Frequency**: Real-time (fetches on page load)

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
└── index.ts                     # Barrel exports
```

### API Routes

```
src/app/api/analytics/oncalls/route.ts  # Fetches on-call data from PagerDuty
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

- **Weekday (Mon-Thu)**: £50/hour (default)
- **Weekend (Fri-Sun)**: £75/hour (default)

_Note: Rates can be customized in Settings page_

### Logic

- Weekend includes Friday-Sunday (not just Sat-Sun)
- Pay is calculated based on start time day of week
- Uses `getCurrentRates()` from `ratesUtils.ts` to support user customization

## Testing

### Unit Tests (37 tests)

- `analyticsUtils.test.ts`: 12 tests for data transformation
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
- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigable (via MUI components)
- Color contrast compliant

## Future Enhancements

1. **Date Range Selector**: Allow users to select custom time periods
2. **User Filtering**: Filter frequency matrix by specific user
3. **Export Functionality**: Download analytics data as CSV/PDF
4. **Expanded Views**: Click visualization to see detailed breakdown
5. **PagerDuty Analytics API**: Integrate official analytics endpoints when available
6. **Historical Trends**: Track changes over time with line charts
7. **Alerting**: Notify when burden distribution becomes imbalanced

## Related Documentation

- [Product Spec](../../product-specs/schedule-trends.md)
- [PagerDuty API Docs](https://developer.pagerduty.com/docs/rest-api-v2/oncalls-api/)
- [Copilot Instructions](../../.github/copilot-instructions.md)
