# Tasks: Split Bill & Payment Tracker

**Input**: Design documents from `/specs/001-bill-tracker/`

**Prerequisites**: [plan.md](file:///Users/alexleong/repos/splitsavvy/specs/001-bill-tracker/plan.md), [spec.md](file:///Users/alexleong/repos/splitsavvy/specs/001-bill-tracker/spec.md), [research.md](file:///Users/alexleong/repos/splitsavvy/specs/001-bill-tracker/research.md), [data-model.md](file:///Users/alexleong/repos/splitsavvy/specs/001-bill-tracker/data-model.md), [actions.md](file:///Users/alexleong/repos/splitsavvy/specs/001-bill-tracker/contracts/actions.md)

**Tests**: Include Vitest + Playwright tasks because testing is part of the technical plan and user scenarios are explicitly defined in spec.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Validate Next.js + TypeScript + Tailwind baseline setup in package.json and src/app/ directory
- [ ] T002 [P] Validate linting + formatting configuration (ESLint/Prettier) via package.json scripts
- [ ] T003 [P] Validate Vitest + Playwright configuration via tests/setup.ts and playwright config (if present)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Apply schema + RLS policies in specs/001-bill-tracker/data-model.md to Supabase project (tables: profiles, bills, participants)
- [ ] T005 [P] Confirm env var expectations from specs/001-bill-tracker/quickstart.md and .gitignore handling for .env.local
- [ ] T006 Implement Supabase client helpers in src/lib/supabase/client.ts and src/lib/supabase/server.ts
- [ ] T007 [P] Define shared TypeScript types aligned to data-model.md + actions.md in src/types/index.ts
- [ ] T008 [P] Ensure shared UI primitives exist and match usage (button/card/input/progress) in src/components/ui/
- [ ] T009 Ensure session/middleware behavior for organizer routes in src/middleware.ts
- [ ] T010 [P] Ensure formatting helpers (currency, dates, classnames) exist in src/lib/utils.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Bill Creation & Sharing (Priority: P1) 🎯 MVP

**Goal**: Organizer can create a bill with participants and get a shareable link.

**Independent Test**: Organizer completes the creation form and receives a unique shareable URL they can copy.

### Tests for User Story 1

- [ ] T011 [P] [US1] Add/adjust unit test coverage for createBill in tests/unit/bill-actions.test.ts
- [ ] T012 [P] [US1] Add/adjust E2E test for organizer bill creation journey in tests/e2e/bill-creation.spec.ts

### Implementation for User Story 1

- [ ] T013 [US1] Implement createBill server action contract in src/app/actions/bill-actions.ts (CreateBillInput/CreateBillResponse)
- [ ] T014 [P] [US1] Implement bill creation form UI in src/components/bill/BillCreateForm.tsx
- [ ] T015 [US1] Wire organizer create page to BillCreateForm in src/app/(organizer)/create/page.tsx
- [ ] T016 [US1] Implement success/share page (short link + copy UX) in src/app/(organizer)/create/success/[id]/page.tsx
- [ ] T017 [US1] Ensure home entry point routes correctly to creation flow in src/app/page.tsx

**Checkpoint**: US1 functional and independently verifiable from the UI

---

## Phase 4: User Story 2 - Member Payment Confirmation (Priority: P1)

**Goal**: Participants can view bill details and mark their payment as done.

**Independent Test**: A user opening the bill link can see participants and click Confirm Payment for their name.

### Tests for User Story 2

- [ ] T018 [P] [US2] Add/adjust unit test coverage for confirmPayment in tests/unit/payment-actions.test.ts
- [ ] T019 [P] [US2] Add/adjust E2E test for participant payment confirmation in tests/e2e/payment-confirmation.spec.ts

### Implementation for User Story 2

- [ ] T020 [US2] Implement getBillDetails query contract in src/app/actions/bill-actions.ts (public by shortId and/or authenticated by id)
- [ ] T021 [US2] Implement confirmPayment server action contract in src/app/actions/bill-actions.ts (ConfirmPaymentInput/ConfirmPaymentResponse)
- [ ] T022 [P] [US2] Implement participant bill view UI in src/components/bill/ParticipantBillView.tsx
- [ ] T023 [US2] Implement public bill route in src/app/bill/[shortId]/page.tsx (renders ParticipantBillView)

**Checkpoint**: US2 functional and independently verifiable from a shared link

---

## Phase 5: User Story 3 - Organizer Tracking Dashboard (Priority: P1)

**Goal**: Organizer can see who has paid and who hasn't (with totals and progress).

**Independent Test**: Dashboard shows progress + paid/unpaid breakdown and updates when participants confirm payments.

### Tests for User Story 3

- [ ] T024 [P] [US3] Add/adjust E2E coverage for organizer dashboard tracking in tests/e2e/organizer-dashboard.spec.ts

### Implementation for User Story 3

- [ ] T025 [US3] Implement getOrganizerBills query contract in src/app/actions/bill-actions.ts (BillSummary[])
- [ ] T026 [P] [US3] Implement dashboard summary UI in src/components/bill/DashboardSummary.tsx
- [ ] T027 [P] [US3] Implement participant status list UI in src/components/bill/ParticipantStatusList.tsx
- [ ] T028 [US3] Implement organizer dashboard list page in src/app/(organizer)/dashboard/page.tsx
- [ ] T029 [US3] Implement organizer bill detail dashboard page in src/app/(organizer)/dashboard/[id]/page.tsx

**Checkpoint**: US3 functional and independently verifiable after organizer auth

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T030 [P] Implement deleteBill server action contract in src/app/actions/bill-actions.ts and wire UI in src/components/bill/DeleteBillButton.tsx
- [ ] T031 Ensure mobile-first layout polish for key pages (create/dashboard/bill) in src/app/(organizer)/create/page.tsx, src/app/(organizer)/dashboard/page.tsx, src/app/bill/[shortId]/page.tsx
- [ ] T032 Update global typography to JetBrains (prefer Nerd Font name, fallback to JetBrains Mono) in src/app/layout.tsx and src/app/globals.css
- [ ] T033 Validate Supabase RLS matches data-model.md constraints (organizer-only writes, public read by short_id, public confirmPayment scope)
- [ ] T034 Run quickstart validation steps from specs/001-bill-tracker/quickstart.md (dev server + vitest + playwright)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on desired user stories being complete

### User Story Dependencies

- **[US1]**: Can start after Foundational (Phase 2)
- **[US2]**: Can start after Foundational (Phase 2), depends conceptually on bill existence but should be independently testable via a created bill
- **[US3]**: Can start after Foundational (Phase 2), depends on organizer having created at least one bill

### Parallel Opportunities

- Phase 1 tasks with [P] can be done in parallel (T002-T003)
- Phase 2 tasks with [P] can be done in parallel (T005, T007, T008, T010)
- Within US1: tests (T011-T012) can be written in parallel with UI work (T014) once action contract is settled
- Within US3: dashboard components (T026-T027) can be done in parallel

---

## Parallel Example: User Story 1

- [ ] T011 [P] [US1] Add/adjust unit test coverage for createBill in tests/unit/bill-actions.test.ts
- [ ] T012 [P] [US1] Add/adjust E2E test for organizer bill creation journey in tests/e2e/bill-creation.spec.ts
- [ ] T014 [P] [US1] Implement bill creation form UI in src/components/bill/BillCreateForm.tsx
