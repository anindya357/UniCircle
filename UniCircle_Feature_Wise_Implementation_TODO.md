# UniCircle — Feature-wise Implementation TODO Plan

> **Basis:** This implementation plan follows the supplied **Project Workflow Description** and the agreed technology stack:
>
> - **Frontend:** Next.js + TypeScript
> - **Backend:** FastAPI
> - **Database:** PostgreSQL
> - **Containerization:** Docker + Docker Compose
> - **CI/CD:** GitHub Actions
> - **AI:** RAG-based Campus AI Assistant
>
> **Required implementation order:**  
> **Project foundation → complete frontend feature-by-feature → complete backend feature-by-feature and connect each feature to the frontend → testing → Dockerization → CI/CD → production deployment**
>
> **Scope note:** This checklist follows the workflow document as the implementation source of truth. It includes Authentication, Home, Department & Faculty Directory, Campus Explorer, Club & Event Hub, Resource Sharing + user-to-user chat, Transport, Community Forum, Campus News & Announcements, Campus AI Assistant, Admin Page, Navbar, and Notifications.

---

## 0. Master Implementation Strategy

Use this sequence for the whole project:

```text
1. Create repository and project structure
2. Configure coding standards and environment
3. Create frontend foundation
4. Implement ALL frontend features using mock data
5. Review complete frontend flow
6. Create backend foundation
7. Design/create database migrations
8. Implement backend feature-by-feature
9. Replace each frontend mock service with the real API
10. Complete cross-feature integration
11. Create and execute complete testing plan
12. Dockerize the application
13. Create CI pipeline
14. Create CD pipeline
15. Prepare production infrastructure
16. Deploy
17. Verify production system
18. Document final release
```

---

# PHASE 1 — Repository and Project Foundation

## 1.1 Create the GitHub repository

- [x] Create the project repository.
- [x] Add a meaningful repository description.
- [x] Add `.gitignore`.
- [x] Create `README.md`.
- [x] Create `.env.example`.
- [x] Protect sensitive values from Git.
- [x] Decide branch strategy.
- [x] Recommended branches:
  - [x] `main` — production-ready code.
  - [x] `develop` — intentionally deferred; the team does not need a long-lived integration branch yet.
  - [x] `feature/<feature-name>` — feature development.
  - [x] `fix/<issue-name>` — fixes.
- [x] Decide pull-request rules.
- [x] Require review before merging important branches.
- [x] Add issue templates if useful.
- [x] Add pull-request template with testing checklist.

---

## 1.2 Create top-level project structure

Create an initial structure similar to:

```text
unicircle/
├── frontend/
├── backend/
├── docs/
│   ├── design/
│   ├── api/
│   ├── testing/
│   └── deployment/
├── docker/
├── scripts/
├── .github/
│   └── workflows/
├── .env.example
├── .gitignore
├── compose.yaml
└── README.md
```

Tasks:

- [x] Create `frontend/`.
- [x] Create `backend/`.
- [x] Create `docs/`.
- [x] Create `docker/`.
- [x] Create `.github/workflows/`.
- [x] Add project setup instructions to `README.md`.
- [x] Prepare `docs/design/` for approved artifacts; no separate approved design files were provided in this workspace.

---

## 1.3 Define environment configuration

Create a clear separation between:

```text
Development
Testing
Production
```

Prepare placeholders for values such as:

```text
APP_ENV
FRONTEND_URL
BACKEND_URL
DATABASE_URL
JWT_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
OPENAI_API_KEY
```

Additional storage/vector-database variables can be added after the corresponding technology is finalized.

Tasks:

- [x] Create `.env.example`.
- [x] Never commit `.env`.
- [x] Document every environment variable.
- [x] Decide which variables belong to frontend.
- [x] Decide which variables belong only to backend.
- [x] Ensure secrets never become public Next.js environment variables.

---

# PHASE 2 — Frontend Foundation

> During the complete frontend phase, use **mock data and a mock service layer**.  
> Do not scatter hard-coded demo data directly through page components.

## 2.1 Initialize Next.js

- [x] Create the Next.js application.
- [x] Enable TypeScript.
- [x] Configure linting.
- [x] Configure formatting.
- [x] Define import aliases.
- [x] Create environment configuration.
- [x] Create the application route structure.
- [x] Create shared layouts.
- [x] Create a global error UI.
- [x] Create loading UI conventions.
- [x] Create empty-state conventions.
- [x] Create reusable form-error presentation.

---

## 2.2 Create a modular frontend structure

Use a structure based on project architecture, for example:

```text
frontend/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   ├── features/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── directory/
│   │   ├── campus-explorer/
│   │   ├── clubs-events/
│   │   ├── resources/
│   │   ├── chat/
│   │   ├── transport/
│   │   ├── forum/
│   │   ├── news/
│   │   ├── assistant/
│   │   ├── notifications/
│   │   └── admin/
│   ├── services/
│   ├── mocks/
│   ├── types/
│   ├── hooks/
│   ├── lib/
│   └── config/
└── ...
```

Tasks:

- [x] Keep feature-specific components inside their feature modules.
- [x] Keep truly reusable UI inside shared/UI folders.
- [x] Create TypeScript domain types.
- [x] Create a mock repository/service layer.
- [x] Make mock service interfaces similar to the expected future API service interfaces.
- [x] Avoid importing mock JSON directly inside page components.

---

# PHASE 3 — Shared Frontend Shell

## 3.1 Navbar

The workflow requires navigation across all pages and a notification button.

- [x] Create the top Navbar/Navmenu.
- [x] Add links for all General User pages.
- [x] Add user/profile area.
- [x] Add notification button.
- [x] Add active-route indication.
- [x] Add responsive/mobile navigation.
- [x] Hide Admin links from normal users.
- [x] Add logout control.
- [x] Prepare Navbar to consume authenticated-user data later.

### Frontend acceptance check

- [x] Every main page can be reached from navigation.
- [x] Navigation works on desktop.
- [x] Navigation works on mobile.
- [x] Admin-only navigation is visually separated.
- [x] Notification control is globally available after login.

---

## 3.2 Notification UI

Notifications will later support event state changes and campus announcements/updates.

- [x] Create notification dropdown/page.
- [x] Create notification item component.
- [x] Support unread/read visual state.
- [x] Support notification timestamp.
- [x] Support notification type.
- [x] Prepare mock event notifications.
- [x] Prepare mock campus-news/announcement notifications.
- [x] Add “mark as read” UI behavior using mock state.
- [x] Add empty notification state.

---

# PHASE 4 — FRONTEND FEATURE IMPLEMENTATION

# Feature 1 — Authentication Frontend

The workflow requires General User registration with CUET email, role selection, role-specific ID, OTP verification, normal-user login, and separate Admin credentials.
Accepted CUET mailbox domains are exactly `cuet.ac.bd` and `student.cuet.ac.bd`;
the second is used by student addresses. Other subdomains are not assumed valid.

## 4.1 Registration page

- [x] Create registration route/page.
- [x] Add username field.
- [x] Add CUET email field.
- [x] Add password field.
- [x] Add password confirmation field.
- [x] Add role selection:
  - [x] Student
  - [x] Teacher
  - [x] Staff
- [x] Dynamically show the required role-specific ID field:
  - [x] Student ID
  - [x] Teacher ID
  - [x] Staff ID
- [x] Validate required fields on frontend.
- [x] Validate CUET email format/domain according to the finalized requirement.
- [x] Add password validation feedback.
- [x] Add submit/loading state.
- [x] Add registration error state.
- [x] Mock successful registration response.

## 4.2 OTP verification page

- [x] Create OTP verification screen.
- [x] Show the verified email target.
- [x] Create OTP input.
- [x] Add submit state.
- [x] Add invalid OTP state.
- [x] Add expired OTP state.
- [x] Add resend OTP UI.
- [x] Add resend cooldown UI if required by final design.
- [x] Mock successful verification.
- [x] Navigate verified user to login or logged-in destination according to final auth flow.

## 4.3 Login page

- [x] Create General User login.
- [x] Allow username or CUET email identifier.
- [x] Add password input.
- [x] Add validation errors.
- [x] Add invalid-credential state.
- [x] Add loading state.
- [x] Mock successful authentication.
- [x] Redirect successful General User login to Home.

## 4.4 Admin login UI

- [x] Decide whether Admin uses the same login screen or a dedicated route according to the approved design.
- [x] Support Admin ID.
- [x] Support Admin password.
- [x] Mock Admin session.
- [x] Redirect Admin to Admin Page.
- [x] Prevent normal-user mock session from entering Admin pages.

### Feature 1 frontend completion

- [x] Registration UI complete.
- [x] Role-dependent fields complete.
- [x] OTP UI complete.
- [x] General User login complete.
- [x] Admin login complete.
- [x] Protected-route mock behavior complete.
- [x] Responsive behavior checked.

---

# Feature 2 — Home Page Frontend

The Home page is the public landing page and remains the first main-app page after login. Before authentication it exposes only Login and Sign up as application-entry actions; every other feature remains protected.

## 4.5 Home page

- [x] Create Home route.
- [x] Make the existing Home page the public landing route.
- [x] Show only Login and Sign up as application-entry navigation before authentication.
- [x] Keep all non-Home feature pages protected by authentication.
- [x] Show the authenticated Navbar on Home after login.
- [x] Redirect successful user authentication to Home.
- [x] Add “Welcome to CUET Campus” hero/header area.
- [x] Add CUET basic-information section.
- [x] Add history section.
- [x] Add achievements section.
- [x] Add facilities section.
- [x] Add image/gallery area.
- [x] Add video/embed area.
- [x] Ensure every authenticated General User can view it.
- [x] Prepare content using mock/static frontend data until backend/content strategy is connected.
- [x] Optimize layout for mobile and desktop.

### Feature 2 frontend completion

- [x] All required information categories represented.
- [x] Images/videos have proper loading/fallback behavior.
- [x] Navigation works.
- [x] Page is responsive.

---

# Feature 3 — Department and Faculty Directory Frontend

## 4.6 Department list/tabs

Create entries for the departments specified in the workflow:

- [x] CSE
- [x] EEE
- [x] ME
- [x] CE
- [x] ETE
- [x] BME
- [x] MME
- [x] MIE
- [x] PME
- [x] WRE
- [x] Architecture
- [x] URP

## 4.7 Department details

- [x] Create department tab/list component.
- [x] Create department details view.
- [x] Display department description/information.
- [x] Add loading state.
- [x] Add no-data state.

## 4.8 Faculty directory

- [x] Display teachers/faculty belonging to selected department.
- [x] Create faculty card/list.
- [x] Show required contact information.
- [x] Add faculty-detail presentation if included in approved UI design.
- [x] Use typed department/faculty data from the backend.

### Feature 3 frontend completion

- [x] Every listed department can be selected.
- [x] Correct department data appears.
- [x] Faculty data changes with department.
- [x] Contact information is readable.
- [x] Empty-state behavior exists.

---

# Feature 4 — Campus Explorer Frontend

The workflow describes a demo map image and sequential information for key campus locations.

## 4.9 Explorer layout

- [ ] Create Campus Explorer route.
- [ ] Add campus/demo map image area.
- [ ] Create location list/cards.
- [ ] Include approved locations such as:
  - [ ] Gol Chottor
  - [ ] TSC
  - [ ] Basketball Ground
  - [ ] Central Field
  - [ ] Gymnasium
  - [ ] Stores
  - [ ] Halls
  - [ ] Academic Buildings
  - [ ] Research Centres
- [ ] Add location name.
- [ ] Add address/location description.
- [ ] Add detailed information.
- [ ] Implement scrolling list.
- [ ] Implement “tap/click for details”.
- [ ] Add selected-location state.
- [ ] Use typed mock location data.

### Feature 4 frontend completion

- [ ] Map is visible.
- [ ] Locations are browsable.
- [ ] User can open each location’s details.
- [ ] Mobile interaction works.

---

# Feature 5 — Club and Event Hub Frontend

During the frontend-only prototype, club requests, admin edits, and event registrations use mock state retained for the current browser tab so the student-to-App-Admin review flow can be demonstrated. This is not the production data store; Phase 7 replaces it with authenticated backend persistence.

## 4.10 Club section

- [x] Create Club & Event Hub route.
- [x] Create club tabs/list.
- [x] Create club details view.
- [x] Show club information.
- [x] Show member information.
- [x] Show activities.
- [x] Show ongoing events.
- [x] Show upcoming events.
- [x] Show recently finished events.

### Club ownership and student-admin controls

- [x] Model club-to-admin membership with registered student user IDs.
- [x] Support one student administering multiple clubs.
- [x] Support one club having multiple student admins.
- [x] Visually identify clubs administered by the current student.
- [x] Show club-management controls only to mapped admins of that club.
- [x] Allow a club admin to update club information and activities.
- [x] Allow a club admin to add another registered student as club admin.
- [x] Allow a club admin to remove an admin while preserving at least one admin.
- [x] Keep App Admin and Club Admin permissions separate.

### New club creation requests

- [x] Add a “Create a new club” action for registered students.
- [x] Create the club-request form.
- [x] Collect club name, short name, category, tagline, description, and planned activities.
- [x] Collect the reason, purpose, campus need, and expected impact for the proposed club.
- [x] Show the requesting student their mock request status.
- [x] Keep requested clubs hidden from the public directory until App Admin approval.

## 4.11 Events section

- [x] Create separate events section/tab.
- [x] Display ongoing events.
- [x] Display upcoming events.
- [x] Create event details view/card.
- [x] Add `Interested` action.
- [x] Add `Going` action.
- [x] Show selected interest state.
- [x] Add event start date/time.
- [x] Add event end date/time/status.
- [x] Mock event-start notification.
- [x] Mock event-finish notification.
- [x] Connect mock notifications to the global notification UI.

### Club-admin event management

- [x] Allow only a mapped admin of the corresponding club to add events.
- [x] Allow only a mapped admin of the corresponding club to edit events.
- [x] Allow only a mapped admin of the corresponding club to delete events.
- [x] Let the club admin enable or disable registration per event.
- [x] For paid events, let the club admin configure the fee and bKash number.

### Event registration frontend

- [x] Create an event details and registration route.
- [x] Show the configured bKash number above paid-event registration forms.
- [x] Collect participant name, CUET email, Student ID, and department.
- [x] Collect bKash transaction ID only for paid events.
- [x] Show states for free, paid, unavailable, closed, and completed registration.
- [x] Prevent duplicate mock registration by the same user for the same event.
- [x] Display the total number of registered users for each registration-enabled event.
- [x] Keep event registration separate from Interested/Going state.

### Feature 5 frontend completion

- [x] Clubs are selectable.
- [x] Club-specific events are visible.
- [x] Global event list is available.
- [x] Interested/Going UI works with mock state.
- [x] Notification UI can represent start/end event notifications.

---

# Feature 6 — Resource Sharing Platform Frontend

The workflow describes a people-discovery style list where users request physical/academic resources from other users. Chat becomes available after the other user accepts the request.

## 4.12 User/resource discovery UI

- [x] Create Resource Sharing route.
- [x] Create “people you may know”-style user list.
- [x] Create user resource/request card.
- [x] Support resource request categories/examples such as:
  - [x] Notebook
  - [x] Lab report
  - [x] T-scale
  - [x] Bicycle
  - [x] Other approved resource
- [x] Create resource request form/modal.
- [x] Add request message/details field if included in approved design.
- [x] Add request submit UI.
- [x] Display request status:
  - [x] Pending
  - [x] Accepted
  - [x] Rejected
- [x] Create received-request UI.
- [x] Create accept action.
- [x] Create reject action.
- [x] Mock all request-state transitions.

## 4.13 User-to-user chat frontend

> The workflow wording “end to end chat system” is treated here as a chat between the two users. Do not assume cryptographic end-to-end encryption unless that is separately added as a formal requirement.

- [x] Create conversation list.
- [x] Create chat screen.
- [x] Create message list.
- [x] Create message input.
- [x] Add message send behavior using mock state.
- [x] Add timestamps.
- [x] Add current-user vs other-user message presentation.
- [x] Disable/prevent chat before resource request is accepted.
- [x] Show chat access after accepted request.
- [x] Add empty conversation state.

### Feature 6 frontend completion

- [x] Users can be browsed.
- [x] Resource request can be composed.
- [x] Pending/accepted/rejected UI works.
- [x] Accepted request unlocks chat UI.
- [x] Chat UI is usable and responsive.

---

# Feature 7 — Transport Section Frontend

## 4.14 Schedule interface

- [x] Create Transport route.
- [x] Display one selected day’s schedule within one page/view.
- [x] Add date/day selector.
- [x] Prevent past schedules from appearing in normal user UI.
- [x] Display:
  - [x] Date
  - [x] Bus Name
  - [x] Driver
  - [x] Bus Type
  - [x] Route information
  - [x] Schedule/times
- [x] Support bus types defined by requirements:
  - [x] Student Bus
  - [x] Teacher Bus
  - [x] Staff Bus
- [x] Add no-schedule state.
- [x] Use future/current mock schedule data.

## 4.15 Bus Drivers tab

- [x] Create “Bus Drivers” tab.
- [x] List driver names.
- [x] Display contact numbers.
- [x] Add empty state.

### Feature 7 frontend completion

- [x] User can change date/day.
- [x] Selected day shows correct mocked schedule.
- [x] Past schedules are hidden.
- [x] Driver list is accessible.

---

# Feature 8 — Community Discussion Forum Frontend

The workflow allows text-only community posts, comments, and reporting. There are no reactions and no image/video posts.

## 4.16 Post creation

- [x] Create Community Forum route.
- [x] Create post composer at top of page.
- [x] Accept text only.
- [x] Do not add image/video upload.
- [x] Add validation for empty post.
- [x] Add submit state.
- [x] Mock new post creation.

## 4.17 Feed

- [x] Create scrollable community post feed.
- [x] Display author.
- [x] Display post text.
- [x] Display timestamp.
- [x] Do not add reaction buttons.
- [x] Add comments section.
- [x] Add text-comment input.
- [x] Add comment list.
- [x] Mock comment creation.

## 4.18 Reporting

- [x] Add “Report to Admin” option.
- [x] Add report confirmation UI.
- [x] Mock reported state.
- [x] Prevent accidental repeated reporting if that matches final design.

### Feature 8 frontend completion

- [x] Text posts can be mocked.
- [x] Comments work in mock state.
- [x] No reaction UI exists.
- [x] No image/video post UI exists.
- [x] Report action is available.

---

# Feature 9 — Campus News and Announcements Frontend

## 4.19 News/announcement page

- [x] Create News & Announcements route.
- [x] Display latest items in serial/list order.
- [x] Differentiate content types if desired:
  - [x] News
  - [x] Update
  - [x] Announcement
- [x] Add title.
- [x] Add content/summary.
- [x] Add publication date/time.
- [x] Add details view if required.
- [x] Add empty state.
- [x] Mock newest-first ordering.

## 4.20 Notification connection

- [x] Generate mock notification when a new update/announcement is inserted into mock state.
- [x] Display it in notification area.
- [x] Link notification to relevant item where appropriate.

### Feature 9 frontend completion

- [x] List ordering is correct.
- [x] News/updates/announcements are readable.
- [x] Notification UI supports these items.

---

# Feature 10 — Campus AI Assistant Frontend

## 4.21 Chatbot UI

- [x] Create Campus AI Assistant route.
- [x] Create chat-style interface.
- [x] Add question input.
- [x] Add send button.
- [x] Add user message bubble.
- [x] Add assistant response bubble.
- [x] Add loading/“thinking” state.
- [x] Add API-error state.
- [x] Add “information not found” response state.
- [x] Prepare a source/reference display area if the approved RAG design returns source information.
- [x] Use mocked campus-related responses for frontend implementation.
- [x] Do not call OpenAI directly from frontend.

### Feature 10 frontend completion

- [x] Complete chatbot interaction can be demonstrated with mock service.
- [x] Loading/error/no-answer states exist.
- [x] UI is ready to connect to FastAPI RAG endpoint later.

---

# Special Feature — Admin Page Frontend

The Admin Page is visible only to the App Admin and controls information required to operate the application.

## 4.22 Admin shell

- [x] Create protected Admin route/layout.
- [x] Create Admin dashboard.
- [x] Create Admin-only navigation.
- [x] Add unauthorized-access page/state.
- [x] Prepare role guard using mock auth.

## 4.23 Admin management sections

Implement admin UI for workflow-defined responsibilities.

### Transport management

- [x] Create schedule list.
- [x] Create schedule form.
- [x] Create route-management UI.
- [x] Create driver-management UI.
- [x] Support add/edit/remove UI states.
- [x] Support weekly/monthly schedule entry workflow.

### News/updates/announcements

- [x] Create list.
- [x] Create add form.
- [x] Create edit UI.
- [x] Create delete UI.
- [x] Create publish state if included in approved design.

### Community reports

- [x] Create reported-post queue.
- [x] Show report/post information.
- [x] Add remove-post action.
- [x] Add dismiss/resolve-report action if included in approved design.

### Club creation requests

- [x] Create a club-request review queue for the main App Admin.
- [x] Show requester, Student ID, club information, activities, and purpose.
- [x] Add approve and reject actions.
- [x] On mock approval, publish the club and assign the requester as initial club admin.
- [x] On rejection, retain the reviewed request without creating a club.

### Other centrally managed information

- [x] Add admin sections for other content only where the finalized overall system design explicitly assigns management responsibility to Admin.
- [x] Do not add unapproved administrative capabilities simply because CRUD is technically possible.

### Admin frontend completion

- [x] Admin-only route behavior works with mock auth.
- [x] Transport management screens complete.
- [x] News/announcement management screens complete.
- [x] Community-report moderation screens complete.

---

# PHASE 5 — Complete Frontend Review Before Backend Work

Do not begin feature backend implementation until the complete UI can be navigated and reviewed.

## 5.1 Full frontend walkthrough

- [ ] Register using mock flow.
- [ ] Verify mock OTP.
- [ ] Login.
- [ ] Confirm `/` is the public Home landing page with only Login/Sign up navigation while signed out.
- [ ] Confirm every non-public route redirects signed-out visitors to authentication.
- [ ] Visit Home.
- [ ] Visit every department.
- [ ] Visit Campus Explorer.
- [ ] Browse clubs/events.
- [ ] Submit a mock club-creation request as a student.
- [ ] Open a club administered by the current student.
- [ ] Add and remove a mock student club admin.
- [ ] Add, edit, and delete a club event as a Club Admin.
- [ ] Configure free and paid event registration.
- [ ] Submit a free and paid mock event registration.
- [ ] Verify the displayed event registration count updates.
- [ ] Mark event Interested/Going.
- [ ] Check mock notification.
- [ ] Send mock resource request.
- [ ] Accept mock request.
- [ ] Open chat.
- [ ] Browse Transport.
- [ ] Browse Drivers.
- [ ] Create mock forum post/comment/report.
- [ ] Browse news.
- [ ] Use mock AI Assistant.
- [ ] Login as mock Admin.
- [ ] Manage mock transport data.
- [ ] Manage mock announcements.
- [ ] Review mock reported post.
- [ ] Approve and reject mock club-creation requests as App Admin.
- [ ] Verify an approved club becomes public with the requester as initial admin.
- [ ] Verify a request survives student logout and App Admin login in the mock flow.
- [ ] Verify a club admin cannot manage a different club or remove the last admin.

## 5.2 Frontend cleanup

- [ ] Remove duplicated UI.
- [ ] Consolidate reusable components.
- [ ] Verify TypeScript types.
- [ ] Verify responsive layout.
- [ ] Verify forms.
- [ ] Verify loading states.
- [ ] Verify errors.
- [ ] Verify empty states.
- [ ] Ensure API-facing types/interfaces are centralized.
- [ ] Create a clear mapping from each mock service to the future backend endpoint.

---

# PHASE 6 — Backend Foundation

## 6.1 Initialize FastAPI

Create the backend after the frontend flow is stable.

Suggested modular structure:

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── home/
│   │   ├── directory/
│   │   ├── campus_explorer/
│   │   ├── clubs_events/
│   │   ├── resources/
│   │   ├── messaging/
│   │   ├── transport/
│   │   ├── forum/
│   │   ├── news/
│   │   ├── notifications/
│   │   ├── assistant/
│   │   └── admin/
│   └── shared/
├── migrations/
├── tests/
└── ...
```

Tasks:

- [x] Initialize Python environment/project with Python 3.12 and `backend/pyproject.toml`.
- [x] Install FastAPI in the ignored backend virtual environment.
- [x] Configure Uvicorn ASGI entry point and run instructions.
- [x] Configure backend-only settings/environment loader.
- [x] Configure stdout logging without request-body or secret logging.
- [x] Add centralized application, HTTP, validation, and unexpected-error handling.
- [x] Add `/health` liveness endpoint.
- [x] Reserve `/api/v1` for feature endpoints and OpenAPI JSON.
- [x] Configure explicit development CORS origins.
- [x] Configure request validation and a consistent 422 error response.
- [x] Create reusable success/error response conventions.

---

## 6.2 PostgreSQL + ORM + migrations

At the time Phase 6.2 was completed, there was no project ERD, so it established
infrastructure only. The [working ERD](docs/design/ERD.md) was added afterward;
the baseline migration still creates only Alembic's version table. Feature
tables and their data seeds remain Phase 7 work.

- [x] Create a dedicated local development PostgreSQL role and database (`unicircle_dev`).
- [x] Configure a backend-only PostgreSQL connection and request-scoped sessions.
- [x] Configure SQLAlchemy 2 Declarative Base and constraint naming without inventing domain models.
- [x] Configure Alembic with the backend settings and model metadata.
- [x] Add an opt-in timestamp audit mixin; feature IDs/relationships were deferred until the working ERD was created.
- [x] Create an intentionally empty, reviewed baseline revision as the initial migration strategy.
- [x] Review the baseline revision and offline SQL before applying it to the development database; review future autogenerated revisions before application.
- [x] Document development-only, idempotent seeding strategy for when Phase 7 creates domain tables.

---

## 6.3 Common backend services

The shared services are implemented as storage-agnostic foundations. Phase 7
must connect them to approved user, OTP, and notification models/repositories;
the test-only in-memory stores are not production persistence.

- [x] Authentication/security utilities.
- [x] JWT utilities.
- [x] Password hashing.
- [x] Current-user dependency (identity lookup is supplied in Phase 7).
- [x] Admin authorization dependency (checks the current persisted role).
- [x] SMTP/email service (requires configured TLS credentials).
- [x] OTP service (requires atomic persistent store in Phase 7).
- [x] Notification service foundation (requires repository in Phase 7).
- [x] Pagination utilities where needed.
- [x] Common validation/error utilities.
- [x] Shared test fixtures.

---

# PHASE 7 — BACKEND FEATURE IMPLEMENTATION + FRONTEND CONNECTION

The owner-authorized [project ERD](docs/design/ERD.md) now supplies the working
entity and security design for Phase 7. Review concrete migrations against it.
The local `.env` contains only ignored, nonfunctional security placeholders;
real secrets and Admin credentials are not committed.

> For every feature below, use the same mini-cycle:
>
> ```text
> Confirm feature LLD
> → create/update DB migration
> → create ORM model(s)
> → create Pydantic schemas
> → create repository/data access
> → create service/business logic
> → create API routes
> → write backend unit/API tests
> → test endpoint manually
> → implement frontend API service
> → replace mock service
> → verify complete feature flow
> ```

---

# Backend Feature 1 — Authentication

Implementation completed in code with migration `20260921_0002`, FastAPI auth
routes, PostgreSQL-backed OTP/session storage, restricted Admin provisioning, and
the same-origin Next.js auth BFF. Automated route tests use a fake mailer and pass.
**Live completion remains unverified:** SMTP configuration and authentication
have passed local checks, but delivery to a real CUET inbox and a live
registration-to-login journey have not yet been confirmed.

## 7.1 Database

- [x] Create user/account model according to final ERD.
- [x] Store username.
- [x] Store CUET email.
- [x] Store hashed password only.
- [x] Store role.
- [x] Store appropriate Student/Teacher/Staff identifier according to approved model.
- [x] Store verification state.
- [x] Create required unique constraints.
- [x] Create OTP-related persistence only if required by approved OTP design.
- [x] Create migration.

## 7.2 Registration service

- [x] Validate registration payload.
- [x] Reject non-CUET email addresses.
- [x] Accept `@cuet.ac.bd` and `@student.cuet.ac.bd` for registration, OTP, and login.
- [x] Validate role.
- [x] Validate required role-specific ID (format awaits approved design).
- [x] Check username uniqueness.
- [x] Check email uniqueness.
- [x] Hash password during registration preparation and store only its hash.
- [x] Create pending/unverified account.
- [x] Generate OTP.
- [x] Apply OTP expiry.
- [x] Send OTP through configured Python SMTP/email service (fake-mailer test; live SMTP pending).
- [x] Prevent OTP from being logged in production.
- [x] Implement resend rules.

## 7.3 OTP verification

- [x] Verify OTP.
- [x] Reject invalid OTP.
- [x] Reject expired OTP.
- [x] Mark user as verified.
- [x] Prevent/restrict login before verification according to final auth design.

## 7.4 Login/JWT

- [x] Support username or CUET email login for General Users.
- [x] Validate password.
- [x] Issue JWT according to approved token strategy.
- [x] Implement token expiry.
- [x] Implement authenticated-user endpoint.
- [x] Implement logout behavior according to chosen JWT/session design.
- [x] Implement Admin authentication using the approved superuser/admin strategy.
- [x] Keep Club Admin as per-club membership for a student User ID, not as a separate global login role or a client-trusted JWT claim.
- [x] Never hard-code production Admin secrets in repository source.

## 7.5 Connect Authentication frontend

- [x] Replace mock registration call.
- [x] Connect OTP submission.
- [x] Connect resend OTP.
- [x] Connect login.
- [x] Store authentication state according to approved security design.
- [x] Connect protected-route logic.
- [x] Keep Home public with Login/Sign up entry links and redirect authenticated General Users back to Home after login.
- [x] Protect every non-public feature route with backend/session-aware checks, not only client-side hiding.
- [x] Connect Admin route protection.
- [x] Connect logout.
- [x] Verify expired/invalid token behavior.

### Feature 1 backend/integration done when

- [ ] Real user can register.
- [x] CUET email restriction works.
- [ ] OTP email is delivered.
- [x] OTP verification works with the test mailer.
- [x] Verified user can login in integration tests.
- [x] JWT-protected API works in integration tests.
- [x] Admin authorization works in integration tests.
- [x] Frontend no longer uses auth mocks.

---

# Backend Feature 2 — Home Page

First decide from the approved design whether Home content is static frontend content or database-managed content.

Decision: Home content is intentionally static and ships with the frontend. No
Home database model, seed, read API, or Admin editing API is needed unless a
future product decision introduces a CMS. The database-managed path below is
therefore not applicable to this implementation.

If database-managed in a future CMS phase:

- [ ] Create Home content model(s).
- [ ] Add seed/default content.
- [ ] Create read endpoint.
- [ ] Create Admin update endpoints only if the approved design requires Admin-managed Home content.
- [ ] Connect Home frontend service.
- [ ] Remove Home mock data.

If intentionally static:

- [x] Document that decision.
- [x] Keep stable static content in frontend/content files.
- [x] Ensure media assets are handled according to production asset strategy.

---

# Backend Feature 3 — Department & Faculty Directory

## 7.6 Data layer

- [x] Create Department model.
- [x] Create Faculty/Teacher directory model according to ERD.
- [x] Create relationship between faculty and department.
- [x] Add contact fields required by design; leave unavailable CUET values null.
- [x] Create migration.
- [x] Seed CSE, EEE, ME, CE, ETE, BME, MME, MIE, PME, WRE, Architecture, and URP from the official CUET directory snapshot (21 September 2026).

## 7.7 API

- [x] Get all departments.
- [x] Get one department.
- [x] Get faculty for department.
- [x] Get faculty details if required by frontend.
- [x] Admin management endpoints not required by the current read-only directory design.
- [x] Add validation.

## 7.8 Frontend connection

- [x] Replace department mocks.
- [x] Replace faculty mocks.
- [x] Connect loading state.
- [x] Connect not-found/empty state.
- [x] Verify all 12 department selections against the seeded data.
- [x] Open faculty details within UniCircle; fetch public details from each corresponding CUET profile on demand and show saved directory information when CUET is unavailable.

---

# Backend Feature 4 — Campus Explorer

## 7.9 Data/API

- [ ] Create Campus Location model.
- [ ] Store name.
- [ ] Store address/location description.
- [ ] Store details.
- [ ] Store map-related/reference information required by final design.
- [ ] Store image/media reference if database-managed.
- [ ] Create migration.
- [ ] Create list endpoint.
- [ ] Create details endpoint.
- [ ] Add Admin CRUD only if approved design requires it.

## 7.10 Frontend connection

- [ ] Replace location mocks.
- [ ] Connect explorer list.
- [ ] Connect location details.
- [ ] Connect image/media URL strategy.
- [ ] Verify selected-location behavior.

---

# Backend Feature 5 — Club & Event Hub

## 7.11 Club data

- [ ] Create Club model.
- [ ] Create club-member information model/relationship according to ERD.
- [ ] Create a many-to-many Club Admin relationship between Club and registered Student User IDs.
- [ ] Support one student administering multiple clubs and one club having multiple admins.
- [ ] Add constraints preventing a club from losing its final admin.
- [ ] Create Club Creation Request model with requester, proposed club data, purpose, activities, status, and review timestamps.
- [ ] Define request states: Pending, Approved, and Rejected.
- [ ] On approval, atomically create the Club and assign the requester as its initial Club Admin.
- [ ] Prevent unapproved club requests from appearing in the public club list.
- [ ] Create activity/event relationships.
- [ ] Create migrations.

## 7.12 Event data

- [ ] Create Event model.
- [ ] Store start/end dates.
- [ ] Store status or derive it consistently.
- [ ] Link event to club where appropriate.
- [ ] Create user-event interest/attendance-intention relationship for:
  - [ ] Interested
  - [ ] Going
- [ ] Add uniqueness rules so a user does not create duplicate status entries for the same event.
- [ ] Add per-event registration settings: enabled/disabled, free/paid, fee, and bKash number.
- [ ] Create Event Registration model linked to Event and User.
- [ ] Store participant name, CUET email, Student ID, department, and optional bKash transaction ID.
- [ ] Keep registration records private to their club admins and authorized backend staff; expose only totals publicly.
- [ ] Decide how paid registrations are reviewed or verified; a submitted bKash transaction ID must not be treated as confirmed payment automatically.
- [ ] Require a transaction ID only when the event is paid.
- [ ] Add uniqueness rules preventing duplicate registration by one user for the same event.
- [ ] Define how the total registration count is calculated efficiently and consistently.

## 7.13 Club/Event API

- [ ] List clubs.
- [ ] Club details.
- [ ] Club members/details required by frontend.
- [ ] Club events.
- [ ] List ongoing events.
- [ ] List upcoming events.
- [ ] List recently finished events.
- [ ] Set/update Interested status.
- [ ] Set/update Going status.
- [ ] Return current user’s event status.
- [ ] Submit a club-creation request as a registered student.
- [ ] Return the current student's club-request history/status.
- [ ] Expose a paginated pending/reviewed club-request queue to the main App Admin only.
- [ ] Let the main App Admin approve or reject a pending club request exactly once; record reviewer and review time.
- [ ] Make approval idempotent and transactional so retries cannot create duplicate clubs.
- [ ] Return clubs administered by the current student.
- [ ] Update club details only when the current user is a mapped admin of that club.
- [ ] Add/remove club admins only when the current user is a mapped admin of that club.
- [ ] Create/update/delete club events only when the current user is a mapped admin of that club.
- [ ] Return event registration configuration and total registration count.
- [ ] Submit event registration and return the current user's registration state.
- [ ] Restrict registration to authenticated students and validate all participant fields, including the CUET email domain.
- [ ] Validate paid-event bKash configuration and registration transaction IDs.
- [ ] Prevent registrations after the event or registration window closes.

## 7.14 Event notifications

- [ ] Define how “event started” is detected.
- [ ] Define how “event finished” is detected.
- [ ] Create notification records for relevant users.
- [ ] Prevent duplicate start/end notifications.
- [ ] Decide scheduler/background execution mechanism during detailed implementation.
- [ ] Test boundary times.

## 7.15 Frontend connection

- [ ] Replace club mocks.
- [ ] Replace event mocks.
- [ ] Connect Interested/Going buttons.
- [ ] Connect Club Admin membership and permission-aware controls.
- [ ] Connect club detail/admin update actions.
- [ ] Connect new-club request submission and request-status UI.
- [ ] Connect event create/edit/delete actions.
- [ ] Connect optional free/paid event registration and registration totals.
- [ ] Connect event-status rendering.
- [ ] Connect real notification list.
- [ ] Verify event start/finish notification behavior.

---

# Backend Feature 6 — Resource Sharing + Chat

## 7.16 Resource request data

- [ ] Create user-to-user Resource Request model.
- [ ] Store requester.
- [ ] Store requested user.
- [ ] Store requested resource description/category.
- [ ] Store status:
  - [ ] Pending
  - [ ] Accepted
  - [ ] Rejected
- [ ] Store timestamps.
- [ ] Create constraints preventing invalid self-requests if required.
- [ ] Create migration.

## 7.17 Resource API

- [ ] List/discover users according to approved rules.
- [ ] Send resource request.
- [ ] View sent requests.
- [ ] View received requests.
- [ ] Accept request.
- [ ] Reject request.
- [ ] Authorize request updates so only the intended recipient can accept/reject.

## 7.18 Chat data

- [ ] Create Conversation model.
- [ ] Create Message model.
- [ ] Link conversation to accepted resource request if that is the approved design.
- [ ] Create migration.
- [ ] Prevent chat creation before request acceptance.
- [ ] Store sender.
- [ ] Store recipient/conversation.
- [ ] Store message text.
- [ ] Store timestamps.

## 7.19 Chat API/realtime behavior

- [ ] Create conversation list endpoint.
- [ ] Create message-history endpoint.
- [ ] Create message-send mechanism.
- [ ] Decide whether the approved architecture uses:
  - [ ] REST + refresh/polling, or
  - [ ] WebSocket/realtime connection.
- [ ] Do not claim cryptographic end-to-end encryption unless it is formally designed and implemented.
- [ ] Authorize conversation access.

## 7.20 Frontend connection

- [ ] Replace discovered-user mocks.
- [ ] Connect request creation.
- [ ] Connect accept/reject.
- [ ] Unlock chat only after accepted request.
- [ ] Connect conversations.
- [ ] Connect message history.
- [ ] Connect message sending.
- [ ] Implement realtime/polling behavior according to chosen architecture.

---

# Backend Feature 7 — Transport

## 7.21 Data models

- [ ] Create Bus model if required by ERD.
- [ ] Create Bus Driver model.
- [ ] Create Route model if separate.
- [ ] Create Transport Schedule model.
- [ ] Store schedule date.
- [ ] Store bus name/reference.
- [ ] Store driver.
- [ ] Store bus type.
- [ ] Store route.
- [ ] Store schedule/times.
- [ ] Create migrations.

## 7.22 General User API

- [ ] Get schedule for date.
- [ ] Get current/upcoming available dates.
- [ ] Prevent normal endpoint from returning past schedules according to workflow requirement.
- [ ] List bus drivers.
- [ ] Return driver contact number.

## 7.23 Admin API

- [ ] Admin create schedule.
- [ ] Admin update schedule.
- [ ] Admin delete schedule where allowed.
- [ ] Admin manage route.
- [ ] Admin manage bus information where required.
- [ ] Admin manage driver information.
- [ ] Support weekly/monthly schedule maintenance workflow.
- [ ] Protect every write endpoint with Admin authorization.

## 7.24 Frontend connection

- [ ] Replace schedule mocks.
- [ ] Connect date selector.
- [ ] Connect schedule view.
- [ ] Connect drivers tab.
- [ ] Connect Admin schedule forms.
- [ ] Connect Admin driver/route forms.
- [ ] Verify past schedule is not exposed in normal user UI/API.

---

# Backend Feature 8 — Community Discussion Forum

## 7.25 Data models

- [ ] Create Post model.
- [ ] Create Comment model.
- [ ] Create Report model.
- [ ] Store text-only post content.
- [ ] Store author.
- [ ] Store timestamps.
- [ ] Relate comments to posts and authors.
- [ ] Relate reports to reporter and reported post.
- [ ] Create migrations.

## 7.26 General User API

- [ ] Create text post.
- [ ] List posts.
- [ ] Get post if required.
- [ ] Add comment.
- [ ] List comments.
- [ ] Report post.
- [ ] Validate text-only payloads.
- [ ] Do not implement image/video upload for forum.
- [ ] Do not implement reactions.

## 7.27 Admin moderation API

- [ ] List reported posts.
- [ ] Show report details.
- [ ] Remove reported post.
- [ ] Handle related comments according to deletion strategy.
- [ ] Resolve/dismiss report if part of final design.
- [ ] Protect moderation endpoints with Admin authorization.

## 7.28 Frontend connection

- [ ] Replace feed mocks.
- [ ] Connect post creation.
- [ ] Connect comments.
- [ ] Connect reporting.
- [ ] Connect Admin report queue.
- [ ] Connect Admin post removal.
- [ ] Verify removed posts disappear from user feed.

---

# Backend Feature 9 — Campus News and Announcements

## 7.29 Data model

- [ ] Create News/Announcement model according to ERD.
- [ ] Store type/category if required.
- [ ] Store title.
- [ ] Store content.
- [ ] Store publication timestamp.
- [ ] Store author/Admin reference.
- [ ] Create migration.

## 7.30 API

General User:

- [ ] List published news/updates/announcements.
- [ ] Sort newest first.
- [ ] Get item details if required.

Admin:

- [ ] Create item.
- [ ] Update item.
- [ ] Delete item.
- [ ] Publish/unpublish only if included in approved design.
- [ ] Protect Admin writes.

## 7.31 Announcement notifications

- [ ] Create user notifications for new updates/announcements according to requirement.
- [ ] Prevent duplicate notification creation.
- [ ] Link notification to announcement.
- [ ] Support read/unread status.

## 7.32 Frontend connection

- [ ] Replace news mocks.
- [ ] Connect newest-first list.
- [ ] Connect details.
- [ ] Connect notification entries.
- [ ] Connect Admin create/edit/delete UI.

---

# Backend Feature 10 — Campus AI Assistant / RAG

The workflow says the knowledge base will be created from CUET’s main website and related CUET websites/articles, and answers must be based on the knowledge base.

## 7.33 RAG ingestion foundation

- [ ] Finalize approved knowledge-source list.
- [ ] Define “official/acceptable CUET source” policy.
- [ ] Create ingestion module.
- [ ] Fetch/load approved campus content.
- [ ] Clean/extract useful text.
- [ ] Split content into chunks.
- [ ] Generate embeddings.
- [ ] Store vectors in the approved vector store.
- [ ] Store source metadata.
- [ ] Store source URL/title/date metadata where available.
- [ ] Prevent uncontrolled ingestion of unrelated sources.
- [ ] Create refresh/update strategy.

## 7.34 RAG query pipeline

- [ ] Accept user question through FastAPI.
- [ ] Validate input.
- [ ] Retrieve relevant chunks.
- [ ] Construct context.
- [ ] Construct controlled prompt.
- [ ] Call OpenAI from backend only.
- [ ] Generate grounded answer.
- [ ] Return answer.
- [ ] Return source metadata if supported by final design.
- [ ] Handle no relevant context.
- [ ] Handle OpenAI failure.
- [ ] Add rate/cost safeguards according to approved architecture.

## 7.35 Frontend connection

- [ ] Replace AI mock service.
- [ ] Connect question endpoint.
- [ ] Connect loading state.
- [ ] Connect answer.
- [ ] Connect no-answer state.
- [ ] Connect source display if returned.
- [ ] Connect API error handling.
- [ ] Verify OpenAI key is never exposed in browser.

---

# Backend Shared Feature — Notifications

Because notifications are used by multiple features, consolidate them into one shared backend capability.

## 7.36 Notification model/API

- [ ] Create Notification model.
- [ ] Store recipient.
- [ ] Store notification type.
- [ ] Store message/title.
- [ ] Store related-object reference according to approved design.
- [ ] Store read/unread state.
- [ ] Store creation timestamp.
- [ ] List current user notifications.
- [ ] Mark one as read.
- [ ] Mark all as read if included in frontend.
- [ ] Authorize users to access only their own notifications.

Notification sources currently required:

- [ ] Event started.
- [ ] Event finished.
- [ ] Campus update/announcement.

---

# Backend Special Feature — Admin Page Integration

- [ ] Ensure Admin identity cannot be self-registered.
- [ ] Protect all Admin endpoints server-side.
- [ ] Never rely only on hidden frontend buttons.
- [ ] Connect every Admin page to its actual API.
- [ ] Connect the club-request review queue, approve/reject actions, and reviewed history to App Admin APIs.
- [ ] Ensure a club admin cannot access another club's management endpoints.
- [ ] Add audit/logging strategy for sensitive Admin operations if approved.
- [ ] Verify normal General User receives `403`/appropriate denial for Admin endpoints.

---

# PHASE 8 — Cross-Feature Integration Review

After all feature backend integrations are complete:

## 8.1 Remove mocks

- [ ] Search frontend for mock imports.
- [ ] Remove feature mocks no longer needed.
- [ ] Keep mock/test fixtures only inside test/development tooling.
- [ ] Verify production build cannot accidentally use mock data.

## 8.2 Complete user journey

- [ ] Land on public Home before authentication; only Login/Sign up is available.
- [ ] Register.
- [ ] Receive OTP email.
- [ ] Verify account.
- [ ] Login.
- [ ] Browse Home.
- [ ] Browse departments/faculty.
- [ ] Browse campus locations.
- [ ] Browse clubs/events.
- [ ] Submit a club-creation request; see its pending status.
- [ ] After App Admin approval, see the new club in the public directory and manage it as initial admin.
- [ ] Add a second registered student as club admin and verify both students can manage it.
- [ ] Create free and paid events, register once for each, and see the registration totals update.
- [ ] Set Interested/Going.
- [ ] Receive event notification.
- [ ] Request resource.
- [ ] Other user accepts.
- [ ] Chat.
- [ ] Browse transport schedule.
- [ ] Browse drivers.
- [ ] Create forum post.
- [ ] Comment.
- [ ] Report post.
- [ ] Browse news/announcement.
- [ ] Receive announcement notification.
- [ ] Ask Campus AI Assistant.
- [ ] Logout.

## 8.3 Complete Admin journey

- [ ] Admin login.
- [ ] Access Admin page.
- [ ] Update transport schedule.
- [ ] Update route/driver information.
- [ ] Publish news/announcement.
- [ ] Verify user receives notification.
- [ ] Review reported forum post.
- [ ] Approve one club request and reject another; only the approved club becomes public.
- [ ] Remove inappropriate reported post.
- [ ] Verify normal user cannot access Admin API or page.

---

# PHASE 9 — TESTING PLAN

Testing should exist during backend implementation, but this phase performs the **complete systematic test pass** before Docker/CD/deployment.

# 9.1 Frontend unit/component tests

Suggested targets:

- [ ] Registration validation.
- [ ] CUET email validation presentation.
- [ ] Role-specific ID field switching.
- [ ] OTP form.
- [ ] Login form.
- [ ] Navbar permissions.
- [ ] Notification unread/read UI.
- [ ] Department tabs.
- [ ] Event Interested/Going controls.
- [ ] Club request form and status UI.
- [ ] Club-admin membership editor and permission-aware controls.
- [ ] Free/paid event-registration form validation and count UI.
- [ ] Resource request status controls.
- [ ] Chat input behavior.
- [ ] Transport date selection.
- [ ] Forum text-only form.
- [ ] Comment form.
- [ ] Admin route guard UI.
- [ ] AI Assistant states.

Focus on behavior rather than testing implementation details.

---

# 9.2 Backend unit tests

Test business/service logic independently where practical.

Authentication:

- [ ] CUET email validation.
- [ ] Role-specific ID validation.
- [ ] Password hashing/verification.
- [ ] OTP creation.
- [ ] OTP expiry.
- [ ] OTP verification.
- [ ] JWT creation/validation.

Club/Event:

- [ ] Club request approval is transactional and creates one club with its requester as initial admin.
- [ ] Rejecting a club request leaves no public club.
- [ ] Final club admin cannot be removed.
- [ ] Event management requires membership in that specific club.
- [ ] Paid event configuration requires a fee and bKash number.
- [ ] Paid registration requires a bKash transaction ID; free registration does not.
- [ ] Duplicate event registration by the same student is rejected.
- [ ] Upcoming/ongoing/finished classification.
- [ ] Interested/Going transition logic.
- [ ] Notification deduplication.

Resources:

- [ ] Resource request state transitions.
- [ ] Cannot accept someone else’s request.
- [ ] Chat only after accepted request.

Transport:

- [ ] Past schedules excluded from normal-user result.
- [ ] Date filtering.
- [ ] Bus-type validation.

Forum:

- [ ] Empty post rejected.
- [ ] Report behavior.
- [ ] Moderation authorization.

News:

- [ ] Newest-first ordering.
- [ ] Announcement notification creation.

RAG:

- [ ] Text preprocessing utilities.
- [ ] Chunking behavior.
- [ ] Retrieval helper behavior.
- [ ] No-context fallback logic.

---

# 9.3 API tests

Use FastAPI test tooling/HTTP client against a test database.

Authentication:

- [ ] Register valid user.
- [ ] Reject non-CUET email.
- [ ] Reject duplicate username.
- [ ] Reject duplicate email.
- [ ] OTP verification.
- [ ] Login.
- [ ] Reject invalid password.
- [ ] Protected endpoint requires JWT.
- [ ] Admin endpoint rejects General User.

Directory:

- [ ] List departments.
- [ ] Get department faculty.
- [ ] Invalid department handling.

Explorer:

- [ ] List locations.
- [ ] Get location.

Clubs/Events:

- [ ] List clubs.
- [ ] List events.
- [ ] Student submits club request and sees only their own request history.
- [ ] General User cannot use App Admin request-review endpoints.
- [ ] App Admin approves/rejects once; approval publishes club with requester as initial admin.
- [ ] Club admin can add/remove only registered student admins for their own club.
- [ ] Non-admin and another club's admin cannot create/edit/delete this club's events.
- [ ] Free and paid registration validate fields and enforce one registration per student/event.
- [ ] Public event response exposes the registration total but not private participant data.
- [ ] Set Interested.
- [ ] Set Going.
- [ ] Prevent unauthorized action.

Resources/Chat:

- [ ] Send request.
- [ ] Accept/reject.
- [ ] Reject unauthorized state change.
- [ ] Chat blocked before acceptance.
- [ ] Send/read message after acceptance.

Transport:

- [ ] Get current/future schedule.
- [ ] Verify past schedule does not appear.
- [ ] List drivers.
- [ ] Admin CRUD authorization.

Forum:

- [ ] Create post.
- [ ] Create comment.
- [ ] Report post.
- [ ] Admin removes reported post.
- [ ] General User cannot use moderation endpoint.

News:

- [ ] List.
- [ ] Admin creates.
- [ ] Notification generated.
- [ ] General User cannot create.

AI:

- [ ] Valid question.
- [ ] Empty question.
- [ ] No relevant context.
- [ ] External model failure handled safely.

---

# 9.4 Database integration tests

- [ ] Club-admin many-to-many relation supports multiple admins per club and multiple clubs per student.
- [ ] Concurrent club approvals and event registrations remain unique and consistent.
- [ ] Test migrations on clean test database.
- [ ] Test required unique constraints.
- [ ] Test foreign-key constraints.
- [ ] Test cascade/restrict behavior.
- [ ] Test transaction rollback.
- [ ] Test important indexes/query paths if needed.
- [ ] Test concurrent/duplicate actions where race conditions matter.

---

# 9.5 Feature integration tests

Examples:

Authentication integration:

```text
Register
→ user persisted
→ OTP generated
→ verification
→ login
→ JWT
→ protected endpoint
```

- [ ] Test full authentication chain.

Event integration:

```text
User selects Going
→ database record
→ event reaches start
→ notification created
→ frontend notification endpoint returns it
```

- [ ] Test full event-notification chain.

Club creation integration:

```text
Student submits proposal
→ App Admin approves
→ club becomes public
→ requester becomes initial club admin
→ requester adds another student admin
```

- [ ] Test full club-request and administration chain, including rejection and unauthorized attempts.

Event registration integration:

```text
Club admin enables paid registration and sets bKash number
→ student submits details and transaction ID
→ one registration is stored
→ public total increases without exposing participant details
```

- [ ] Test free/paid registration, duplicate prevention, and registration total consistency.

Resource integration:

```text
User A requests resource from User B
→ User B accepts
→ conversation becomes available
→ A/B exchange messages
```

- [ ] Test full resource/chat chain.

Forum moderation integration:

```text
User creates post
→ another user reports
→ Admin sees report
→ Admin removes post
→ post disappears from feed
```

- [ ] Test full moderation chain.

Announcement integration:

```text
Admin publishes announcement
→ item appears in list
→ notification created
→ user receives notification
```

- [ ] Test full announcement chain.

---

# 9.6 End-to-End (E2E) browser testing

Automate the most important user journeys, not every visual detail.

- [ ] Registration → OTP test flow using test email strategy.
- [ ] Login → Home.
- [ ] Public Home → Login/Sign up → authenticated Home; signed-out protected-route redirect.
- [ ] Student club request → App Admin approval → new public club → requester admin controls.
- [ ] Club admin event creation → optional free/paid registration → student submission → total update.
- [ ] Directory navigation.
- [ ] Club/event → Going.
- [ ] Resource request → acceptance → chat.
- [ ] Forum post → comment → report.
- [ ] Admin login → transport update.
- [ ] Admin login → announcement publish.
- [ ] Admin moderation flow.
- [ ] AI question/answer flow using controlled test/stub for external AI where appropriate.

---

# 9.7 Security testing checklist

- [ ] Passwords are never stored plain text.
- [ ] JWT secret is not committed.
- [ ] SMTP password is not committed.
- [ ] OpenAI API key is backend-only.
- [ ] Admin endpoints enforce server-side authorization.
- [ ] Club-management endpoints enforce per-club student-admin membership server-side.
- [ ] Club-request review endpoints require main App Admin authority server-side.
- [ ] Event registration records and bKash transaction IDs are not exposed in public responses or logs.
- [ ] Users cannot read another user’s private chat without authorization.
- [ ] Users cannot accept/reject requests addressed to another user.
- [ ] Users cannot mark another user’s notifications.
- [ ] SQL injection protections verified through ORM/parameterized queries.
- [ ] Input validation exists.
- [ ] XSS-risk content is handled safely.
- [ ] CORS configured narrowly in production.
- [ ] Rate limiting/abuse protections reviewed for auth and AI.
- [ ] OTP has expiry.
- [ ] OTP resend abuse protection considered.
- [ ] Sensitive values are not written to logs.

---

# 9.8 RAG evaluation plan

Create a small CUET-specific evaluation dataset.

For each question store:

```text
Question
Expected source/document
Expected key facts
Whether answer should be possible
```

Test:

- [ ] Correct source retrieval.
- [ ] Relevant chunks ranked high enough.
- [ ] Answer grounded in retrieved context.
- [ ] Unsupported question handled safely.
- [ ] Campus-unrelated question behavior.
- [ ] Outdated information strategy.
- [ ] Source metadata/citation behavior if implemented.
- [ ] Response latency.
- [ ] External API error handling.

---

# 9.9 Performance/basic load checks

Focus on likely bottlenecks.

- [ ] Home/directory list response.
- [ ] Forum feed pagination.
- [ ] Message history.
- [ ] Transport schedule query.
- [ ] Notifications list.
- [ ] RAG query latency.
- [ ] Database connection behavior.
- [ ] Verify list endpoints use pagination where required.

---

# 9.10 Testing exit criteria

Before Dockerized production preparation:

- [ ] All critical unit tests pass.
- [ ] All API tests pass.
- [ ] All required integration tests pass.
- [ ] Critical E2E journeys pass.
- [ ] No known critical/high-severity security defect.
- [ ] Database migrations work from clean database.
- [ ] RAG evaluation meets the team’s agreed quality criteria.
- [ ] Test commands are documented.
- [ ] CI-ready test commands exist for frontend and backend.

---

# PHASE 10 — DOCKERIZATION

Dockerization comes after the application is functionally integrated and tested.

# 10.1 Backend Docker image

- [ ] Create backend `Dockerfile`.
- [ ] Use production-appropriate Python base image.
- [ ] Install dependencies reproducibly.
- [ ] Copy application.
- [ ] Run as non-root where practical.
- [ ] Expose application port.
- [ ] Add health-check strategy.
- [ ] Configure production ASGI startup command.
- [ ] Ensure secrets are passed at runtime, not baked into image.
- [ ] Add `.dockerignore`.
- [ ] Build image locally.
- [ ] Run backend container locally.
- [ ] Test `/health`.

---

# 10.2 Frontend Docker image

- [ ] Create frontend `Dockerfile`.
- [ ] Use a multi-stage production build where appropriate.
- [ ] Install dependencies reproducibly.
- [ ] Build Next.js production output.
- [ ] Keep runtime image minimal.
- [ ] Run as non-root where practical.
- [ ] Add `.dockerignore`.
- [ ] Pass only safe/public build variables appropriately.
- [ ] Build locally.
- [ ] Run frontend container locally.

---

# 10.3 PostgreSQL for local Docker environment

- [ ] Add PostgreSQL service to `compose.yaml`.
- [ ] Configure database environment variables.
- [ ] Add persistent development volume.
- [ ] Add health check.
- [ ] Ensure backend waits/retries appropriately for database readiness.
- [ ] Do not use development database credentials in production.

---

# 10.4 Docker Compose integration

Create services similar to:

```text
frontend
backend
postgres
```

Plus other infrastructure only if required by the finalized architecture.

- [ ] Create shared network.
- [ ] Configure service names.
- [ ] Configure backend → PostgreSQL connection.
- [ ] Configure frontend → backend URL.
- [ ] Configure volumes.
- [ ] Configure health checks.
- [ ] Verify application starts from a clean clone using documented commands.
- [ ] Apply database migrations in the Docker workflow.
- [ ] Verify all main user flows in Docker environment.

---

# 10.5 Production Docker hardening

- [ ] Minimize image sizes.
- [ ] Pin/reproduce dependencies.
- [ ] Remove development-only tools from production image where possible.
- [ ] Run containers as non-root where practical.
- [ ] Configure production logging to stdout/stderr.
- [ ] Configure graceful shutdown.
- [ ] Verify health endpoints.
- [ ] Verify no `.env`/secret file is copied into image.
- [ ] Scan/review dependencies and images.
- [ ] Tag images using commit SHA/version.

---

# PHASE 11 — CI PIPELINE WITH GITHUB ACTIONS

Create CI before automatic production deployment.

# 11.1 Pull-request CI

Trigger on pull requests.

Frontend job:

- [ ] Install dependencies.
- [ ] Lint.
- [ ] Type-check.
- [ ] Run frontend unit/component tests.
- [ ] Build Next.js production bundle.

Backend job:

- [ ] Install Python dependencies.
- [ ] Lint/format check according to team standard.
- [ ] Run backend unit tests.
- [ ] Start test PostgreSQL service.
- [ ] Run migration.
- [ ] Run API/integration tests.

Docker job:

- [ ] Build backend image.
- [ ] Build frontend image.
- [ ] Fail CI if Docker build fails.

Optional later:

- [ ] Dependency/security scan.
- [ ] Coverage report.
- [ ] Upload test artifacts/reports.

---

# 11.2 CI branch protection

- [ ] Require CI before merge to `main`.
- [ ] Require appropriate review.
- [ ] Prevent direct production deployment from unreviewed feature branches.
- [ ] Keep production secrets unavailable to pull requests from untrusted contexts.

---

# PHASE 12 — CD PIPELINE

# 12.1 Decide release trigger

Recommended options:

```text
Merge to main
or
Version tag / GitHub Release
```

Tasks:

- [ ] Choose one release strategy.
- [ ] Document it.

---

## 12.2 CD workflow stages

```text
main/tag
→ CI validation
→ build production images/artifacts
→ publish image if registry is used
→ prepare database migration
→ deploy backend
→ deploy frontend
→ health checks
→ smoke tests
→ release complete
```

Tasks:

- [ ] Store production secrets in GitHub/environment secret management.
- [ ] Never place secrets directly in workflow YAML.
- [ ] Build versioned image.
- [ ] Push image to selected registry if deployment platform requires it.
- [ ] Deploy backend.
- [ ] Run/apply Alembic migrations using a controlled strategy.
- [ ] Deploy frontend.
- [ ] Verify backend health.
- [ ] Verify frontend availability.
- [ ] Run post-deployment smoke tests.
- [ ] Define rollback procedure.

---

# PHASE 13 — PRODUCTION DEPLOYMENT PLAN

> Select the concrete provider based on the finalized deployment design, course constraints, budget/free-tier limits, Docker support, database support, storage needs, and RAG/vector-store requirements.

# 13.1 Production infrastructure

Prepare:

```text
Frontend hosting
Backend/container hosting
Managed PostgreSQL
Vector storage (if separate)
File/media storage (if required)
Domain/DNS
HTTPS
Secret management
Logging/monitoring
```

Tasks:

- [ ] Create production project/account/resources.
- [ ] Create production PostgreSQL database.
- [ ] Configure backup policy.
- [ ] Configure database SSL if required.
- [ ] Create production application secrets.
- [ ] Configure SMTP production credentials.
- [ ] Configure OpenAI API key.
- [ ] Configure production vector store.
- [ ] Configure media/storage if used.
- [ ] Configure frontend production URL.
- [ ] Configure backend production URL.
- [ ] Configure production CORS.
- [ ] Configure HTTPS.
- [ ] Configure domain/DNS if using custom domain.

---

# 13.2 Production database release

- [ ] Apply migrations against production using controlled migration job/process.
- [ ] Verify migration success.
- [ ] Seed only required base data.
- [ ] Create/configure Admin account through a secure method.
- [ ] Verify required departments/base reference data.
- [ ] Never load development/test users into production.

---

# 13.3 Production backend release

- [ ] Deploy production backend image.
- [ ] Configure environment variables.
- [ ] Verify database connectivity.
- [ ] Verify SMTP connectivity.
- [ ] Verify OpenAI/RAG dependencies.
- [ ] Verify `/health`.
- [ ] Verify logs.
- [ ] Verify Admin authentication.

---

# 13.4 Production frontend release

- [ ] Deploy production Next.js application.
- [ ] Configure correct backend API URL.
- [ ] Verify no mock mode is enabled.
- [ ] Verify no development secret is bundled.
- [ ] Verify static/media assets.
- [ ] Verify responsive UI.

---

# 13.5 Production smoke test

General User:

- [ ] Registration.
- [ ] OTP.
- [ ] Login.
- [ ] Home.
- [ ] Directory.
- [ ] Campus Explorer.
- [ ] Clubs/Events.
- [ ] Interested/Going.
- [ ] Resource request.
- [ ] Chat.
- [ ] Transport.
- [ ] Forum.
- [ ] News.
- [ ] Notifications.
- [ ] AI Assistant.
- [ ] Logout.

Admin:

- [ ] Admin login.
- [ ] Admin route access.
- [ ] Update transport.
- [ ] Publish announcement.
- [ ] Verify notification.
- [ ] Moderate reported post.

---

# PHASE 14 — Production Observability and Maintenance

## 14.1 Logging

- [ ] Application startup/shutdown logs.
- [ ] Server errors.
- [ ] Database errors.
- [ ] SMTP errors.
- [ ] Authentication failures without leaking credentials.
- [ ] Admin-operation logs where appropriate.
- [ ] RAG/OpenAI failures.
- [ ] Background/scheduled notification failures.

Do **not** log:

- [ ] Passwords.
- [ ] JWTs.
- [ ] OTP values in production.
- [ ] SMTP password.
- [ ] OpenAI API key.
- [ ] Sensitive private-chat contents unless specifically required and approved.

---

## 14.2 Monitoring

- [ ] Frontend availability.
- [ ] Backend availability.
- [ ] HTTP 5xx rate.
- [ ] Backend latency.
- [ ] PostgreSQL availability.
- [ ] Storage/vector service availability.
- [ ] OpenAI/RAG failures.
- [ ] CI failures.
- [ ] CD/deployment failures.

---

## 14.3 Backup and recovery

- [ ] Database backup plan.
- [ ] Restore test.
- [ ] Vector knowledge-base rebuild/backup strategy.
- [ ] File/media backup strategy if used.
- [ ] Rollback plan for application deployment.
- [ ] Rollback/forward-fix strategy for database migrations.

---

# PHASE 15 — Final Documentation and Release

## 15.1 README

Include:

- [ ] Project description.
- [ ] Main features.
- [ ] Technology stack.
- [ ] Architecture overview.
- [ ] Local setup.
- [ ] Environment variables.
- [ ] Running frontend.
- [ ] Running backend.
- [ ] Running with Docker.
- [ ] Database migration commands.
- [ ] Testing commands.
- [ ] CI/CD overview.
- [ ] Deployment overview.

---

## 15.2 Technical documentation

Complete:

- [x] System Architecture ([working HLD](docs/design/HLD.md)).
- [x] HLD ([working design](docs/design/HLD.md)).
- [x] LLD ([working design](docs/design/LLD.md); refine feature contracts during implementation).
- [x] DFDs ([logical data flows](docs/design/Data_Flow_Diagram.md)).
- [x] ERD ([working design](docs/design/ERD.md); refine through reviewed migrations).
- [x] Document flow diagram ([business and development records](docs/design/Document_Flow_Diagram.md)).
- [x] Sequence diagrams ([critical feature journeys](docs/design/Sequence_Diagram.md)).
- [x] Use-case diagrams ([actors and permissions](docs/design/Use_Case_Diagram.md)).
- [ ] API documentation.
- [x] Authentication flow ([sequence and LLD](docs/design/Sequence_Diagram.md#registration-verification-and-login)).
- [x] RAG flow ([assistant sequence](docs/design/Sequence_Diagram.md#campus-assistant-query); provider choices pending).
- [ ] Docker documentation.
- [ ] Testing strategy/results.
- [ ] CI/CD documentation.
- [ ] Deployment architecture.
- [ ] Known limitations.

---

# FINAL FEATURE-WISE IMPLEMENTATION ORDER

Use this as the main execution queue.

## A. Foundation

- [ ] Repository structure.
- [ ] Git workflow.
- [ ] Environment strategy.
- [ ] Next.js foundation.
- [ ] Shared frontend shell.
- [ ] Mock service architecture.

## B. Complete Frontend — Feature by Feature

1. [x] Authentication.
2. [x] Home.
3. [ ] Department & Faculty Directory.
4. [ ] Campus Explorer.
5. [ ] Club & Event Hub.
6. [ ] Resource Sharing.
7. [ ] Chat UI.
8. [ ] Transport.
9. [ ] Community Discussion Forum.
10. [ ] Campus News & Announcements.
11. [ ] Campus AI Assistant.
12. [ ] Notifications.
13. [ ] Admin Page.
14. [ ] Full frontend walkthrough and cleanup.

## C. Backend Foundation

- [ ] FastAPI.
- [ ] PostgreSQL.
- [ ] SQLAlchemy.
- [ ] Alembic.
- [ ] Config.
- [ ] Logging.
- [ ] Errors.
- [ ] Auth/security utilities.
- [ ] SMTP foundation.
- [ ] Test foundation.

## D. Backend + Frontend Connection — Feature by Feature

1. [ ] Authentication + OTP + JWT → connect frontend.
2. [ ] Home content strategy/API → connect frontend if required.
3. [ ] Department & Faculty Directory → connect frontend.
4. [ ] Campus Explorer → connect frontend.
5. [ ] Club & Event Hub → connect frontend.
6. [ ] Event Interested/Going + notifications → connect frontend.
7. [ ] Resource Requests → connect frontend.
8. [ ] User-to-user Chat → connect frontend.
9. [ ] Transport + Bus Drivers + Admin transport management → connect frontend.
10. [ ] Community Forum + Comments + Reports + Admin moderation → connect frontend.
11. [ ] Campus News/Announcements + notifications + Admin management → connect frontend.
12. [ ] Shared Notification system → finalize frontend connection.
13. [ ] Campus AI Assistant/RAG → connect frontend.
14. [ ] Admin authorization/integration review.
15. [ ] Remove production mock dependencies.
16. [ ] Full integration walkthrough.

## E. Testing

- [ ] Frontend unit/component tests.
- [ ] Backend unit tests.
- [ ] API tests.
- [ ] Database integration tests.
- [ ] Feature integration tests.
- [ ] E2E tests.
- [ ] Authentication/security tests.
- [ ] Authorization tests.
- [ ] RAG evaluation.
- [ ] Basic performance tests.
- [ ] Regression test pass.

## F. Docker

- [ ] Backend Dockerfile.
- [ ] Frontend Dockerfile.
- [ ] PostgreSQL Compose service.
- [ ] Full Docker Compose stack.
- [ ] Production image hardening.
- [ ] Docker smoke tests.

## G. CI/CD

- [ ] GitHub Actions frontend CI.
- [ ] GitHub Actions backend CI.
- [ ] Database/API CI tests.
- [ ] Docker build validation.
- [ ] Branch protection.
- [ ] Production CD workflow.
- [ ] Migration step.
- [ ] Health checks.
- [ ] Post-deployment smoke test.
- [ ] Rollback plan.

## H. Production

- [ ] Provision production services.
- [ ] Configure secrets.
- [ ] Configure PostgreSQL.
- [ ] Configure vector/RAG infrastructure.
- [ ] Configure SMTP.
- [ ] Deploy backend.
- [ ] Deploy frontend.
- [ ] Run migrations.
- [ ] Configure HTTPS/domain.
- [ ] Production smoke test.
- [ ] Monitoring/logging.
- [ ] Backup/recovery.
- [ ] Final documentation.
- [ ] Release.

---

# Definition of Done for Every Backend Feature

A backend-connected feature is not complete until:

- [ ] Requirement is implemented.
- [ ] Database migration exists where needed.
- [ ] Data model is reviewed.
- [ ] Pydantic/request-response schema is defined.
- [ ] Business logic is in the proper module/service.
- [ ] API route is implemented.
- [ ] Authentication is applied where required.
- [ ] Authorization is applied where required.
- [ ] Validation exists.
- [ ] Error cases are handled.
- [ ] Backend tests pass.
- [ ] API is manually/API-test verified.
- [ ] Frontend mock has been replaced.
- [ ] Loading/error/empty frontend states use real API behavior.
- [ ] Feature integration test passes.
- [ ] Documentation is updated.
- [ ] Pull request CI passes.

---

# Recommended Working Method With AI

For learning, do not ask AI to generate a whole feature in one request.

For each feature:

```text
1. Read the approved design yourself.
2. Decide the next small task.
3. Ask AI to explain the concept.
4. Implement the task yourself.
5. Ask AI to review your code.
6. Fix issues yourself.
7. Run tests.
8. Commit.
9. Move to the next small task.
```

Useful AI prompts:

```text
"Explain the responsibility of this component without writing the code."

"Review my implementation against this LLD. Point out problems but do not rewrite it."

"Explain why this FastAPI dependency is needed."

"Help me design the test cases before I implement the endpoint."

"Here is my error. Explain the root cause first, then show the smallest fix."

"Review this migration for data-integrity risks."

"Check whether this frontend component is mixing presentation and API responsibilities."
```

Avoid:

```text
"Build the entire UniCircle project for me."
```

The goal is to use AI as a **teacher, reviewer, pair programmer, and debugger** while keeping the architecture and implementation understandable to the project team.
