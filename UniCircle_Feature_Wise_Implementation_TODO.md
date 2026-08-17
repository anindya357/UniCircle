# UniCircle — Feature-wise Implementation TODO Plan

> **Basis:** This implementation plan follows the supplied **Project Workflow Description** and the agreed technology stack:
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

- [ ] Create the project repository.
- [ ] Add a meaningful repository description.
- [ ] Add `.gitignore`.
- [ ] Create `README.md`.
- [ ] Create `.env.example`.
- [ ] Protect sensitive values from Git.
- [ ] Decide branch strategy.
- [ ] Recommended branches:
  - [ ] `main` — production-ready code.
  - [ ] `develop` — integrated development branch, if the team wants one.
  - [ ] `feature/<feature-name>` — feature development.
  - [ ] `fix/<issue-name>` — fixes.
- [ ] Decide pull-request rules.
- [ ] Require review before merging important branches.
- [ ] Add issue templates if useful.
- [ ] Add pull-request template with testing checklist.

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

- [ ] Create `frontend/`.
- [ ] Create `backend/`.
- [ ] Create `docs/`.
- [ ] Create `docker/`.
- [ ] Create `.github/workflows/`.
- [ ] Add project setup instructions to `README.md`.
- [ ] Add architecture/design documents already created during the system-design phase under `docs/design/`.

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

- [ ] Create `.env.example`.
- [ ] Never commit `.env`.
- [ ] Document every environment variable.
- [ ] Decide which variables belong to frontend.
- [ ] Decide which variables belong only to backend.
- [ ] Ensure secrets never become public Next.js environment variables.

---

# PHASE 2 — Frontend Foundation

> During the complete frontend phase, use **mock data and a mock service layer**.  
> Do not scatter hard-coded demo data directly through page components.

## 2.1 Initialize Next.js

- [ ] Create the Next.js application.
- [ ] Enable TypeScript.
- [ ] Configure linting.
- [ ] Configure formatting.
- [ ] Define import aliases.
- [ ] Create environment configuration.
- [ ] Create the application route structure.
- [ ] Create shared layouts.
- [ ] Create a global error UI.
- [ ] Create loading UI conventions.
- [ ] Create empty-state conventions.
- [ ] Create reusable form-error presentation.

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

- [ ] Keep feature-specific components inside their feature modules.
- [ ] Keep truly reusable UI inside shared/UI folders.
- [ ] Create TypeScript domain types.
- [ ] Create a mock repository/service layer.
- [ ] Make mock service interfaces similar to the expected future API service interfaces.
- [ ] Avoid importing mock JSON directly inside page components.

---

# PHASE 3 — Shared Frontend Shell

## 3.1 Navbar

The workflow requires navigation across all pages and a notification button.

- [ ] Create the top Navbar/Navmenu.
- [ ] Add links for all General User pages.
- [ ] Add user/profile area.
- [ ] Add notification button.
- [ ] Add active-route indication.
- [ ] Add responsive/mobile navigation.
- [ ] Hide Admin links from normal users.
- [ ] Add logout control.
- [ ] Prepare Navbar to consume authenticated-user data later.

### Frontend acceptance check

- [ ] Every main page can be reached from navigation.
- [ ] Navigation works on desktop.
- [ ] Navigation works on mobile.
- [ ] Admin-only navigation is visually separated.
- [ ] Notification control is globally available after login.

---

## 3.2 Notification UI

Notifications will later support event state changes and campus announcements/updates.

- [ ] Create notification dropdown/page.
- [ ] Create notification item component.
- [ ] Support unread/read visual state.
- [ ] Support notification timestamp.
- [ ] Support notification type.
- [ ] Prepare mock event notifications.
- [ ] Prepare mock campus-news/announcement notifications.
- [ ] Add “mark as read” UI behavior using mock state.
- [ ] Add empty notification state.

---

# PHASE 4 — FRONTEND FEATURE IMPLEMENTATION

# Feature 1 — Authentication Frontend

The workflow requires General User registration with CUET email, role selection, role-specific ID, OTP verification, normal-user login, and separate Admin credentials.

## 4.1 Registration page

- [ ] Create registration route/page.
- [ ] Add username field.
- [ ] Add CUET email field.
- [ ] Add password field.
- [ ] Add password confirmation field.
- [ ] Add role selection:
  - [ ] Student
  - [ ] Teacher
  - [ ] Staff
- [ ] Dynamically show the required role-specific ID field:
  - [ ] Student ID
  - [ ] Teacher ID
  - [ ] Staff ID
- [ ] Validate required fields on frontend.
- [ ] Validate CUET email format/domain according to the finalized requirement.
- [ ] Add password validation feedback.
- [ ] Add submit/loading state.
- [ ] Add registration error state.
- [ ] Mock successful registration response.

## 4.2 OTP verification page

- [ ] Create OTP verification screen.
- [ ] Show the verified email target.
- [ ] Create OTP input.
- [ ] Add submit state.
- [ ] Add invalid OTP state.
- [ ] Add expired OTP state.
- [ ] Add resend OTP UI.
- [ ] Add resend cooldown UI if required by final design.
- [ ] Mock successful verification.
- [ ] Navigate verified user to login or logged-in destination according to final auth flow.

## 4.3 Login page

- [ ] Create General User login.
- [ ] Allow username or CUET email identifier.
- [ ] Add password input.
- [ ] Add validation errors.
- [ ] Add invalid-credential state.
- [ ] Add loading state.
- [ ] Mock successful authentication.
- [ ] Redirect successful General User login to Home.

## 4.4 Admin login UI

- [ ] Decide whether Admin uses the same login screen or a dedicated route according to the approved design.
- [ ] Support Admin ID.
- [ ] Support Admin password.
- [ ] Mock Admin session.
- [ ] Redirect Admin to Admin Page.
- [ ] Prevent normal-user mock session from entering Admin pages.

### Feature 1 frontend completion

- [ ] Registration UI complete.
- [ ] Role-dependent fields complete.
- [ ] OTP UI complete.
- [ ] General User login complete.
- [ ] Admin login complete.
- [ ] Protected-route mock behavior complete.
- [ ] Responsive behavior checked.

---

# Feature 2 — Home Page Frontend

The workflow specifies a post-login Home page with welcome text and CUET information such as history, achievements, facilities, images, and videos.

## 4.5 Home page

- [ ] Create Home route.
- [ ] Add “Welcome to CUET Campus” hero/header area.
- [ ] Add CUET basic-information section.
- [ ] Add history section.
- [ ] Add achievements section.
- [ ] Add facilities section.
- [ ] Add image/gallery area.
- [ ] Add video/embed area.
- [ ] Ensure every authenticated General User can view it.
- [ ] Prepare content using mock/static frontend data until backend/content strategy is connected.
- [ ] Optimize layout for mobile and desktop.

### Feature 2 frontend completion

- [ ] All required information categories represented.
- [ ] Images/videos have proper loading/fallback behavior.
- [ ] Navigation works.
- [ ] Page is responsive.

---

# Feature 3 — Department and Faculty Directory Frontend

## 4.6 Department list/tabs

Create entries for the departments specified in the workflow:

- [ ] CSE
- [ ] EEE
- [ ] ME
- [ ] CE
- [ ] ETE
- [ ] BME
- [ ] MME
- [ ] MIE
- [ ] PME
- [ ] Architecture
- [ ] URP

## 4.7 Department details

- [ ] Create department tab/list component.
- [ ] Create department details view.
- [ ] Display department description/information.
- [ ] Add loading state.
- [ ] Add no-data state.

## 4.8 Faculty directory

- [ ] Display teachers/faculty belonging to selected department.
- [ ] Create faculty card/list.
- [ ] Show required contact information.
- [ ] Add faculty-detail presentation if included in approved UI design.
- [ ] Use typed mock department/faculty data.

### Feature 3 frontend completion

- [ ] Every listed department can be selected.
- [ ] Correct department data appears.
- [ ] Faculty data changes with department.
- [ ] Contact information is readable.
- [ ] Empty-state behavior exists.

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

## 4.10 Club section

- [ ] Create Club & Event Hub route.
- [ ] Create club tabs/list.
- [ ] Create club details view.
- [ ] Show club information.
- [ ] Show member information.
- [ ] Show activities.
- [ ] Show ongoing events.
- [ ] Show upcoming events.
- [ ] Show recently finished events.

## 4.11 Events section

- [ ] Create separate events section/tab.
- [ ] Display ongoing events.
- [ ] Display upcoming events.
- [ ] Create event details view/card.
- [ ] Add `Interested` action.
- [ ] Add `Going` action.
- [ ] Show selected interest state.
- [ ] Add event start date/time.
- [ ] Add event end date/time/status.
- [ ] Mock event-start notification.
- [ ] Mock event-finish notification.
- [ ] Connect mock notifications to the global notification UI.

### Feature 5 frontend completion

- [ ] Clubs are selectable.
- [ ] Club-specific events are visible.
- [ ] Global event list is available.
- [ ] Interested/Going UI works with mock state.
- [ ] Notification UI can represent start/end event notifications.

---

# Feature 6 — Resource Sharing Platform Frontend

The workflow describes a people-discovery style list where users request physical/academic resources from other users. Chat becomes available after the other user accepts the request.

## 4.12 User/resource discovery UI

- [ ] Create Resource Sharing route.
- [ ] Create “people you may know”-style user list.
- [ ] Create user resource/request card.
- [ ] Support resource request categories/examples such as:
  - [ ] Notebook
  - [ ] Lab report
  - [ ] T-scale
  - [ ] Bicycle
  - [ ] Other approved resource
- [ ] Create resource request form/modal.
- [ ] Add request message/details field if included in approved design.
- [ ] Add request submit UI.
- [ ] Display request status:
  - [ ] Pending
  - [ ] Accepted
  - [ ] Rejected
- [ ] Create received-request UI.
- [ ] Create accept action.
- [ ] Create reject action.
- [ ] Mock all request-state transitions.

## 4.13 User-to-user chat frontend

> The workflow wording “end to end chat system” is treated here as a chat between the two users. Do not assume cryptographic end-to-end encryption unless that is separately added as a formal requirement.

- [ ] Create conversation list.
- [ ] Create chat screen.
- [ ] Create message list.
- [ ] Create message input.
- [ ] Add message send behavior using mock state.
- [ ] Add timestamps.
- [ ] Add current-user vs other-user message presentation.
- [ ] Disable/prevent chat before resource request is accepted.
- [ ] Show chat access after accepted request.
- [ ] Add empty conversation state.

### Feature 6 frontend completion

- [ ] Users can be browsed.
- [ ] Resource request can be composed.
- [ ] Pending/accepted/rejected UI works.
- [ ] Accepted request unlocks chat UI.
- [ ] Chat UI is usable and responsive.

---

# Feature 7 — Transport Section Frontend

## 4.14 Schedule interface

- [ ] Create Transport route.
- [ ] Display one selected day’s schedule within one page/view.
- [ ] Add date/day selector.
- [ ] Prevent past schedules from appearing in normal user UI.
- [ ] Display:
  - [ ] Date
  - [ ] Bus Name
  - [ ] Driver
  - [ ] Bus Type
  - [ ] Route information
  - [ ] Schedule/times
- [ ] Support bus types defined by requirements:
  - [ ] Student Bus
  - [ ] Teacher Bus
  - [ ] Staff Bus
- [ ] Add no-schedule state.
- [ ] Use future/current mock schedule data.

## 4.15 Bus Drivers tab

- [ ] Create “Bus Drivers” tab.
- [ ] List driver names.
- [ ] Display contact numbers.
- [ ] Add empty state.

### Feature 7 frontend completion

- [ ] User can change date/day.
- [ ] Selected day shows correct mocked schedule.
- [ ] Past schedules are hidden.
- [ ] Driver list is accessible.

---

# Feature 8 — Community Discussion Forum Frontend

The workflow allows text-only community posts, comments, and reporting. There are no reactions and no image/video posts.

## 4.16 Post creation

- [ ] Create Community Forum route.
- [ ] Create post composer at top of page.
- [ ] Accept text only.
- [ ] Do not add image/video upload.
- [ ] Add validation for empty post.
- [ ] Add submit state.
- [ ] Mock new post creation.

## 4.17 Feed

- [ ] Create scrollable community post feed.
- [ ] Display author.
- [ ] Display post text.
- [ ] Display timestamp.
- [ ] Do not add reaction buttons.
- [ ] Add comments section.
- [ ] Add text-comment input.
- [ ] Add comment list.
- [ ] Mock comment creation.

## 4.18 Reporting

- [ ] Add “Report to Admin” option.
- [ ] Add report confirmation UI.
- [ ] Mock reported state.
- [ ] Prevent accidental repeated reporting if that matches final design.

### Feature 8 frontend completion

- [ ] Text posts can be mocked.
- [ ] Comments work in mock state.
- [ ] No reaction UI exists.
- [ ] No image/video post UI exists.
- [ ] Report action is available.

---

# Feature 9 — Campus News and Announcements Frontend

## 4.19 News/announcement page

- [ ] Create News & Announcements route.
- [ ] Display latest items in serial/list order.
- [ ] Differentiate content types if desired:
  - [ ] News
  - [ ] Update
  - [ ] Announcement
- [ ] Add title.
- [ ] Add content/summary.
- [ ] Add publication date/time.
- [ ] Add details view if required.
- [ ] Add empty state.
- [ ] Mock newest-first ordering.

## 4.20 Notification connection

- [ ] Generate mock notification when a new update/announcement is inserted into mock state.
- [ ] Display it in notification area.
- [ ] Link notification to relevant item where appropriate.

### Feature 9 frontend completion

- [ ] List ordering is correct.
- [ ] News/updates/announcements are readable.
- [ ] Notification UI supports these items.

---

# Feature 10 — Campus AI Assistant Frontend

## 4.21 Chatbot UI

- [ ] Create Campus AI Assistant route.
- [ ] Create chat-style interface.
- [ ] Add question input.
- [ ] Add send button.
- [ ] Add user message bubble.
- [ ] Add assistant response bubble.
- [ ] Add loading/“thinking” state.
- [ ] Add API-error state.
- [ ] Add “information not found” response state.
- [ ] Prepare a source/reference display area if the approved RAG design returns source information.
- [ ] Use mocked campus-related responses for frontend implementation.
- [ ] Do not call OpenAI directly from frontend.

### Feature 10 frontend completion

- [ ] Complete chatbot interaction can be demonstrated with mock service.
- [ ] Loading/error/no-answer states exist.
- [ ] UI is ready to connect to FastAPI RAG endpoint later.

---

# Special Feature — Admin Page Frontend

The Admin Page is visible only to the App Admin and controls information required to operate the application.

## 4.22 Admin shell

- [ ] Create protected Admin route/layout.
- [ ] Create Admin dashboard.
- [ ] Create Admin-only navigation.
- [ ] Add unauthorized-access page/state.
- [ ] Prepare role guard using mock auth.

## 4.23 Admin management sections

Implement admin UI for workflow-defined responsibilities.

### Transport management

- [ ] Create schedule list.
- [ ] Create schedule form.
- [ ] Create route-management UI.
- [ ] Create driver-management UI.
- [ ] Support add/edit/remove UI states.
- [ ] Support weekly/monthly schedule entry workflow.

### News/updates/announcements

- [ ] Create list.
- [ ] Create add form.
- [ ] Create edit UI.
- [ ] Create delete UI.
- [ ] Create publish state if included in approved design.

### Community reports

- [ ] Create reported-post queue.
- [ ] Show report/post information.
- [ ] Add remove-post action.
- [ ] Add dismiss/resolve-report action if included in approved design.

### Other centrally managed information

- [ ] Add admin sections for other content only where the finalized overall system design explicitly assigns management responsibility to Admin.
- [ ] Do not add unapproved administrative capabilities simply because CRUD is technically possible.

### Admin frontend completion

- [ ] Admin-only route behavior works with mock auth.
- [ ] Transport management screens complete.
- [ ] News/announcement management screens complete.
- [ ] Community-report moderation screens complete.

---

# PHASE 5 — Complete Frontend Review Before Backend Work

Do not begin feature backend implementation until the complete UI can be navigated and reviewed.

## 5.1 Full frontend walkthrough

- [ ] Register using mock flow.
- [ ] Verify mock OTP.
- [ ] Login.
- [ ] Visit Home.
- [ ] Visit every department.
- [ ] Visit Campus Explorer.
- [ ] Browse clubs/events.
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

- [ ] Initialize Python environment/project.
- [ ] Install FastAPI.
- [ ] Configure ASGI server.
- [ ] Configure settings/environment loader.
- [ ] Configure logging.
- [ ] Add centralized exception handling.
- [ ] Add `/health` endpoint.
- [ ] Decide `/api/v1` versioning.
- [ ] Configure CORS for development.
- [ ] Configure request validation.
- [ ] Create reusable response/error conventions.

---

## 6.2 PostgreSQL + ORM + migrations

- [ ] Create development PostgreSQL database.
- [ ] Configure database connection.
- [ ] Configure SQLAlchemy according to approved design.
- [ ] Configure Alembic.
- [ ] Implement base models/audit fields according to design.
- [ ] Create the initial migration strategy.
- [ ] Review generated migrations before applying them.
- [ ] Create seed strategy for development content where needed.

---

## 6.3 Common backend services

- [ ] Authentication/security utilities.
- [ ] JWT utilities.
- [ ] Password hashing.
- [ ] Current-user dependency.
- [ ] Admin authorization dependency.
- [ ] SMTP/email service.
- [ ] OTP service.
- [ ] Notification service foundation.
- [ ] Pagination utilities where needed.
- [ ] Common validation/error utilities.
- [ ] Shared test fixtures.

---

# PHASE 7 — BACKEND FEATURE IMPLEMENTATION + FRONTEND CONNECTION

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

## 7.1 Database

- [ ] Create user/account model according to final ERD.
- [ ] Store username.
- [ ] Store CUET email.
- [ ] Store hashed password only.
- [ ] Store role.
- [ ] Store appropriate Student/Teacher/Staff identifier according to approved model.
- [ ] Store verification state.
- [ ] Create required unique constraints.
- [ ] Create OTP-related persistence only if required by approved OTP design.
- [ ] Create migration.

## 7.2 Registration service

- [ ] Validate registration payload.
- [ ] Reject non-CUET email addresses.
- [ ] Validate role.
- [ ] Validate required role-specific ID.
- [ ] Check username uniqueness.
- [ ] Check email uniqueness.
- [ ] Hash password.
- [ ] Create pending/unverified account.
- [ ] Generate OTP.
- [ ] Apply OTP expiry.
- [ ] Send OTP through configured Python SMTP/email service.
- [ ] Prevent OTP from being logged in production.
- [ ] Implement resend rules.

## 7.3 OTP verification

- [ ] Verify OTP.
- [ ] Reject invalid OTP.
- [ ] Reject expired OTP.
- [ ] Mark user as verified.
- [ ] Prevent/restrict login before verification according to final auth design.

## 7.4 Login/JWT

- [ ] Support username or CUET email login for General Users.
- [ ] Validate password.
- [ ] Issue JWT according to approved token strategy.
- [ ] Implement token expiry.
- [ ] Implement authenticated-user endpoint.
- [ ] Implement logout behavior according to chosen JWT/session design.
- [ ] Implement Admin authentication using the approved superuser/admin strategy.
- [ ] Never hard-code production Admin secrets in repository source.

## 7.5 Connect Authentication frontend

- [ ] Replace mock registration call.
- [ ] Connect OTP submission.
- [ ] Connect resend OTP.
- [ ] Connect login.
- [ ] Store authentication state according to approved security design.
- [ ] Connect protected-route logic.
- [ ] Connect Admin route protection.
- [ ] Connect logout.
- [ ] Verify expired/invalid token behavior.

### Feature 1 backend/integration done when

- [ ] Real user can register.
- [ ] CUET email restriction works.
- [ ] OTP email is delivered.
- [ ] OTP verification works.
- [ ] Verified user can login.
- [ ] JWT-protected API works.
- [ ] Admin authorization works.
- [ ] Frontend no longer uses auth mocks.

---

# Backend Feature 2 — Home Page

First decide from the approved design whether Home content is static frontend content or database-managed content.

If database-managed:

- [ ] Create Home content model(s).
- [ ] Add seed/default content.
- [ ] Create read endpoint.
- [ ] Create Admin update endpoints only if the approved design requires Admin-managed Home content.
- [ ] Connect Home frontend service.
- [ ] Remove Home mock data.

If intentionally static:

- [ ] Document that decision.
- [ ] Keep stable static content in frontend/content files.
- [ ] Ensure media assets are handled according to production asset strategy.

---

# Backend Feature 3 — Department & Faculty Directory

## 7.6 Data layer

- [ ] Create Department model.
- [ ] Create Faculty/Teacher directory model according to ERD.
- [ ] Create relationship between faculty and department.
- [ ] Add contact fields required by design.
- [ ] Create migration.
- [ ] Seed required departments.

## 7.7 API

- [ ] Get all departments.
- [ ] Get one department.
- [ ] Get faculty for department.
- [ ] Get faculty details if required by frontend.
- [ ] Add Admin management endpoints only if system design requires editable directory information.
- [ ] Add validation.

## 7.8 Frontend connection

- [ ] Replace department mocks.
- [ ] Replace faculty mocks.
- [ ] Connect loading state.
- [ ] Connect not-found state.
- [ ] Verify all department tabs.

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

- [ ] Register.
- [ ] Receive OTP email.
- [ ] Verify account.
- [ ] Login.
- [ ] Browse Home.
- [ ] Browse departments/faculty.
- [ ] Browse campus locations.
- [ ] Browse clubs/events.
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

- [ ] System Architecture.
- [ ] HLD.
- [ ] LLD.
- [ ] DFDs.
- [ ] ERD.
- [ ] API documentation.
- [ ] Authentication flow.
- [ ] RAG flow.
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

1. [ ] Authentication.
2. [ ] Home.
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
