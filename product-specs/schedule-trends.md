# On call schedule Visualisation

## Per schedule trend visualisation

When a user goes to the `schedules/[id]/page.tsx`, they are currently able to see the schedule with the on-call payment information overlaid, on a monthly basis. This is great.

But we want users like managers to be able to get insights from the data that's available on pagerduty.

We want users to click on a new Analytics button on this page, which should ideally be located just above the month navigation bar. Clicking on this _Analytics_ button should take users to a page that allows users to view the following types of data visualisation, like an _Analytics Dashboard_ for the past 6 months for that specific schedule:

1. The frequency Matrix
2. The "Burden Distribution"
3. "Interruption vs Pay" Correlation

Clicking on each of the visualisation should take the user to an expanded view that allows the user to interact with the visualisation and observe the details closely.

## What the visualisation means

Visualizing on-call frequency transforms raw API data into "team health" metrics that Engineering Managers can actually use to prevent burnout.

To effectively visualize this using the PagerDuty API, you should use a combination of the **`oncalls`** endpoint for raw shift data and the **`analytics`** endpoints for aggregated insights.

### 1. The "Frequency Matrix" (Heatmap)

This is the most effective way to show if a user is being "on-called" too often at specific times (like weekends or late nights).

- **Data Source:** `GET /oncalls` with `since` and `until` parameters.
- **How to Build:** Group the results by `user_id` and then by `day_of_week`.
- **The Visual:** A 7x24 grid (Hours vs. Days). Darker cells represent higher on-call frequency for that specific user.
- **Value for EMs:** It reveals if a specific engineer is consistently stuck with the "Sunday Night" shift, which is a major burnout risk.

### 2. The "Burden Distribution" (Pie or Bar Chart)

Visualizes the total percentage of time each team member spends on-call relative to the whole team.

- **Data Source:** `POST /analytics/metrics/users/all` (Aggregated).
- **Key Metric:** `total_oncall_duration`.
- **The Visual:** A Pie Chart showing the "Slice of the Pie" each engineer takes.
- **Value for EMs:** Perfect for spotting "Hero Culture"—where one person is doing 50% of the on-call while others do 5%.

### 3. "Interruption vs. Pay" Correlation

For your **Caloohpay** project, this is a "killer feature." It compares how much someone is being paid vs. how much they are actually being interrupted.

- **Data Source:** \* `GET /oncalls` (for the pay calculation).
- `POST /analytics/metrics/responders/all` (for `total_interruptions`).

- **The Visual:** A Scatter Plot.
- **X-axis:** Monthly Pay.
- **Y-axis:** Number of midnight pages.

- **Value for EMs:** Identifies "Underpaid Heroes"—people getting paged constantly but receiving the same flat rate as someone who had a quiet week.

---

### Implementation Tips for your Web UI:

These are suggestions but if therea re more suitable libraries for a Next.js project, then that should be used instead.

| Feature           | API Endpoint                               | Suggested Chart Library |
| ----------------- | ------------------------------------------ | ----------------------- |
| **Shift History** | `/oncalls`                                 | FullCalendar.io         |
| **User Load**     | `/analytics/metrics/users/all`             | Chart.js / Recharts     |
| **Burnout Risk**  | `/analytics/raw/responders/{id}/incidents` | Heatmap.js              |

---

[PagerDuty Guide: On-Call & Incident Management Best Practices](https://www.youtube.com/watch?v=McBrUhz9Ia4)
This video provides a solid overview of PagerDuty’s core features and best practices for monitoring on-call load to prevent burnout, which aligns with your goal of making your tool more attractive to engineering managers.
