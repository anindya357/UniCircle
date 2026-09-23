# Transport feature

Feature 7 replaces the `/transport` placeholder with a responsive selected-day
routine and driver directory.

- Current and future date controls expose four normal daily windows.
- The three Bottoli station runs assign 9 buses to the regular route and 2 buses to
  the Chawkbazar route; the midday CUET–Rastar Matha return uses 4 buses.
- Each schedule card links to a dedicated assignment page showing the buses, service
  types, drivers, contacts, and route path for that exact run.
- The Bus Drivers tab lists the 25 PDF-sourced drivers, their assigned buses, and
  searchable contact numbers.

The live authenticated API supplies routes, recurring schedules, buses, and driver
contacts. The supplied CUET bus photo appears in the responsive page banner. Past
schedules are rejected by the General User API, while App Admins can maintain the
transport records in the Admin workspace.
