# Tasks: Split Bill & Payment Tracker

**Input**: Design documents from `/specs/001-bill-tracker/`

**Prerequisites**: [plan.md](file:///Users/alexleong/repos/splitsavvy/specs/001-bill-tracker/plan.md), [spec.md](file:///Users/alexleong/repos/splitsavvy/specs/001-bill-tracker/spec.md), [research.md](file:///Users/alexleong/repos/splitsavvy/specs/001-bill-tracker/research.md), [data-model.md](file:///Users/alexleong/repos/splitsavvy/specs/001-bill-tracker/data-model.md), [actions.md](file:///Users/alexleong/repos/splitsavvy/specs/001-bill-tracker/contracts/actions.md)

**Tests**: Vitest for unit/integration tests and Playwright for E2E tests are included as per the implementation plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Next.js project with Tailwind CSS and TypeScript
- [X] T002 [P] Install core dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `nanoid`, `shadcn/ui` components
- [X] T003 [P] Configure Vitest and Playwright testing frameworks
- [X] T004 [P] Setup linting and formatting (ESLint, Prettier)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T005 Create Supabase client utilities in `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`
- [X] T006 [P] Define TypeScript interfaces in `src/types/index.ts` based on `data-model.md` and `actions.md`
- [X] T007 [P] Implement shared UI components: Button, Input, Card, Progress in `src/components/ui/`
- [X] T008 Setup middleware for session management in `src/middleware.ts`
- [X] T009 Create utility functions (e.g., currency formatting) in `src/lib/utils.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Bill Creation & Sharing (Priority: P1) 🎯 MVP

**Goal**: Organizer can create a bill with participants and get a shareable link.

**Independent Test**: Organizer completes the creation form and is redirected to a success page with a copyable short link.

### Implementation for User Story 1

- [X] T010 [P] [US1] Create database migration for `bills` and `participants` tables in Supabase
- [X] T011 [US1] Implement `createBill` server action in `src/app/actions/bill-actions.ts`
- [X] T012 [P] [US1] Create Bill Creation form component in `src/components/bill/BillCreateForm.tsx`
- [X] T013 [US1] Implement Bill Creation page in `src/app/(organizer)/create/page.tsx`
- [X] T014 [US1] Create Success/Share page in `src/app/(organizer)/create/success/[id]/page.tsx`
- [X] T015 [US1] Add unit tests for `createBill` action in `tests/unit/bill-actions.test.ts`
- [X] T016 [US1] Add E2E test for bill creation flow in `tests/e2e/bill-creation.spec.ts`

**Checkpoint**: User Story 1 functional - Organizers can create and share bills.

---

## Phase 4: User Story 2 - Member Payment Confirmation (Priority: P1)

**Goal**: Participants can view bill details and mark their payment as done.

**Independent Test**: Participant opens short link, selects their name, clicks "Confirm Payment", and sees status update to "Paid".

### Implementation for User Story 2

- [X] T017 [US1] Implement `getBillDetails` query in `src/app/actions/bill-actions.ts`
- [X] T018 [US2] Implement `confirmPayment` server action in `src/app/actions/bill-actions.ts`
- [X] T019 [US2] Create Participant Bill View component in `src/components/bill/ParticipantBillView.tsx`
- [X] T020 [US2] Implement Public Bill page in `src/app/bill/[shortId]/page.tsx`
- [X] T021 [US2] Add unit tests for `confirmPayment` action in `tests/unit/payment-actions.test.ts`
- [X] T022 [US2] Add E2E test for participant payment flow in `tests/e2e/payment-confirmation.spec.ts`

**Checkpoint**: User Story 2 functional - Participants can view and confirm payments.

---

## Phase 5: User Story 3 - Organizer Tracking Dashboard (Priority: P1)

**Goal**: Organizer can track overall progress and individual payment statuses.

**Independent Test**: Dashboard displays a progress bar showing % collected and a list of all participants with their paid/unpaid status.

### Implementation for User Story 3

- [X] T023 [US3] Implement `getOrganizerBills` query in `src/app/actions/bill-actions.ts`
- [X] T024 [P] [US3] Create Dashboard Summary component (stats cards) in `src/components/bill/DashboardSummary.tsx`
- [X] T025 [P] [US3] Create Participant Status List component in `src/components/bill/ParticipantStatusList.tsx`
- [X] T026 [US3] Implement Organizer Dashboard page in `src/app/(organizer)/dashboard/page.tsx`
- [X] T027 [US3] Implement Bill Detail Dashboard page in `src/app/(organizer)/dashboard/[id]/page.tsx`
- [X] T028 [US3] Add E2E test for organizer dashboard tracking in `tests/e2e/organizer-dashboard.spec.ts`

**Checkpoint**: User Story 3 functional - Organizers can track collections.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T029 Implement responsive layout optimizations for mobile/WhatsApp view
- [X] T030 Add "Fintech" visual theme (dark mode support, animations) using Tailwind and Framer Motion
- [X] T031 [P] Implement `deleteBill` server action and UI in `src/app/actions/bill-actions.ts`
- [X] T032 Final security audit of Supabase RLS policies
- [X] T033 Run and pass all tests (Vitest & Playwright)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Must be completed first.
- **Foundational (Phase 2)**: Depends on Phase 1. Blocks all User Stories.
- **User Stories (Phases 3-5)**: Depend on Phase 2. Can proceed in parallel but recommended sequence is US1 → US2 → US3.
- **Polish (Phase 6)**: Final phase.

### Parallel Opportunities

- T002, T003, T004 (Setup phase)
- T006, T007 (Foundational phase)
- T010, T012 (User Story 1)
- T024, T025 (User Story 3)
- Once Phase 2 is complete, US1 and US2 can theoretically start in parallel if independent paths are followed.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup & Foundation.
2. Implement Bill Creation (US1).
3. Verify that a bill can be created and a link generated.

### Incremental Delivery

1. Deliver US1 (Creation).
2. Deliver US2 (Payment Confirmation).
3. Deliver US3 (Dashboard Tracking).
4. Final Polish & Theme.
