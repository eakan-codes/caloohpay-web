# Multiple Schedule Payment Calculation

## Background

In every organisation that uses an on-call schedule system, there will be a few members of the organisation that have a high level overview all the schedules and how much they cost overall. These members are likely to have administrative privileges to the on-call system. In this application's case, it is PagerDuty. Let's call these special group of people the Admins.

### The Admins

These admins do not necessarily have to be on a rota. However, they are the ones responsible for ensuring those going on-call, especially outside of regular working hours are compensated properly. On-call outside-of-hours, is not something one looks forward to. Thus as an organisation that cares for the well-being of their employees, they have to ensure that their employees are compensated for the inconvenience caused by having to be ready to respond to an unexpected incident, outside of contracted working hours.

These Admins maybe, senior product managers, heads of departments, Engineering managers, operations managers or finance managers.

They need to be able to use CalOohPay to get a monthly statement of all of the rotas that had an outside-of-working-hours on-call in one page - something like a spreadsheet, where they can see the names of the schedules, the names of individuals who were members of those schedules and the number of weekdays and weekend days these employees were on-call for the respective schedules.

There are situations where employees maybe on-call for multiple schedules during the same period. This is non-recommended as if both systems were to have incidents at the same time, then it would compromise the said employee's ability to effectively handle the incident. As they are now split between systems. Although this is not recommended, there maybe situations where this is the case. If they do exist, the admins must be able to tell that the employee was on-call for more than one system and only pay them for total duration of the rota.

#### Example of an employee who is on-call for multiple systems at the same time

Employee OnCallerPerson, is extremely happy about outside of hours incident, thus they have signed up to be on the schedules for SystemAlwaysBroken and SystemSometimesBroken. So they seem to be on-call for two different schedules:

- SystemAlwaysBrokenSchedule
- SystemSometimesBrokenSchedule

Both the Schedules have OnCallerPerson on-call for the following days in January:

- The 5th 10:00am to the 12th 10:00am of January GMT
- The 19th 10:00am to the 26th 10:00am of January GMT

In this case the on-call person should only get paid for the duration they were on-call. That is for a duration of 8 Weekdays + 6 Weekends.

## The MultiSchedule Grid View `/schedules`

We now have a schedules page for typing and searching for various schedules. This is a brilliant way to discover schedules and also get to schedules that you may not know the proper names of.

We need a similar view, however, with the option of selecting multiple schedules and then the ability to click on a button to _View On-Call Compensation_ in a Spreadsheet like Grid view.

There could also be a single button in the header navigation after a user is signed in, to Multi-Schedule Grid page.

### The MultiSchedule Grid or Spreadsheet view

This page has the following layout.

- The common website header on the top that's visible for all pages
- A central main functionality column below that header, that's as wide as the Schedules View Page
- The common website footer below both of these elements.

The Central main functionality column should have a Schedule Search input on the top left section. To the right of this search input, there will be navigation buttons to switch the monthly period.

This month navigation should be similar to the Schedules ID Page.

A left arrow icon, followed by the Month and Year followed by a right arrow icon.

Below this row of components is a row with just one right aligned button that reads Export grid data into a spreadsheet.

Below both these rows of components is an empty spreadsheet grid that gets populated as schedules are added.

The admin must be able to search and select multiple schedules to view the on-call data in the spreadsheet below.

The spreadsheet must be able to display the following information as two tables, for every schedule. An example is illustrated below for the _SystemsAlwaysBroken Schedule_.

| Schedule name                | Schedule URL                                           | Using Time-zone |
| ---------------------------- | ------------------------------------------------------ | --------------- |
| SystemsAlwaysBroken Schedule | https://broken-company.pagerduty.com/schedules/SYPLBKH | Europe/London   |

| Employee               | Total Compensation (£) | Weekdays (Mon-Thu) | Weekends (Fri-Sun) |
| ---------------------- | ---------------------- | ------------------ | ------------------ |
| OnCallai Humanoid      | 900                    | 9                  | 6                  |
| OnCaller Person        | 0                      | 0                  | 0                  |
| On Call McHuman        | 950                    | 10                 | 6                  |
| Humalo Robolo On Callo | 0                      | 0                  | 0                  |

The first table is a bit of metadata about the schedule. The second table is the employee compensation data.

If multiple schedules are selected, then the above set of tables will be generated multiple times, one for each schedule. Enabling the Admin to have a one page view of all the On Call compensation for the period.

#### The period

To start simple, let us ensure that the period is always a month from the beginning to the end of a month.

#### The multiple schedules selection

The user should be able to save the selected schedule identifiers to local storage for use the next time they log in. This will help admins log in every month to get their organisation wide on-call.

This implementation may be later enhanced to provide the user the ability to save this data into a database like DynamoDb where all user specific settings could also be stored.

### Export Grid Data to Spreadsheet

To start with, let us first enable this button to copy all data in the spreadsheet. Then the user can paste that data into a spreadsheet application of their choice. This is the Minimum viable feature that we can provide that will make it convenient for the user.

### The non-functional requirements

- The page must be able to render grid data for at least 100 schedules without being sluggish.
- Ensure that the user is able to scroll through the schedule data in the grid smoothly
- Choose a lightweight, fast grid library to accomplish the spreadsheet view.

## Q&A with Agent

### Multi-schedule implementation: Are there specific grid libraries you're considering (AG Grid, TanStack Table, MUI DataGrid)?

Which grid library is the is the most suitable in 2026 for implementing the features listed in this specification file? I am only familiar with AG Grid when I used it with Angular and it was great, even without the enterprise features. But that was several years ago - 2019. What's the trend now, especially for a NextJS based application?

### Overlapping schedule logic: Should the deduplication logic live in the frontend or should there be a dedicated API endpoint for multi-schedule calculations?

A dedicated API endpoint for multi-schedule calculations would be best as the deduplication is only necessary in this scenario.

### Test coverage for new feature: Should I add specific testing requirements for the multi-schedule grid view in the TDD section?

Take a pragmatic approach to testing. Key behaviours must be tested. Both for Unit and End to End testing.

### Performance benchmarks: Do you want specific performance testing commands/patterns documented for validating the 100+ schedule requirement?

It would be great to have this, to ensure that the product is fit for purpose.

## Implementation Status (Completed Jan 2026)

This feature has been fully implemented with the following components:

- **Route**: `/schedules/payment-grid` (Accessible via "Reports" link in header)
- **API**: `/api/reports/multi-schedule` implements an O(N log N) sweep-line algorithm to correctly calculate compensation for overlapping intervals across multiple schedules.
- **UI**:
  - Async multi-select autocomplete for schedules.
  - Virtualized grid for high-performance rendering of large datasets.
  - Month selection navigation.
- **Testing**:
  - E2E tests in `tests/e2e/multi-schedule.spec.ts`.
  - Unit tests for overlap logic in `src/app/api/reports/multi-schedule/__tests__/route.test.ts`.
