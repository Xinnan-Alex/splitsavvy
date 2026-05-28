# Tasks: Receipt Scan Autofill

**Input**: Design documents from `/specs/002-scan-bill-ocr/`

**Prerequisites**: [plan.md](file:///Users/alexleong/repos/splitsavvy/specs/002-scan-bill-ocr/plan.md), [spec.md](file:///Users/alexleong/repos/splitsavvy/specs/002-scan-bill-ocr/spec.md), [research.md](file:///Users/alexleong/repos/splitsavvy/specs/002-scan-bill-ocr/research.md), [data-model.md](file:///Users/alexleong/repos/splitsavvy/specs/002-scan-bill-ocr/data-model.md), [ocr.md](file:///Users/alexleong/repos/splitsavvy/specs/002-scan-bill-ocr/contracts/ocr.md)

**Tests**: Include Vitest + Playwright tasks because testing is part of the technical plan and user scenarios are explicitly defined in spec.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Validate existing create bill flow and test harness before adding scan support

- [X] T001 Validate existing create bill route + form state in src/app/(organizer)/create/page.tsx and src/components/bill/BillCreateForm.tsx
- [X] T002 [P] Validate existing UI primitives (button/card/input/progress) are available for scan UX in src/components/ui/
- [X] T003 [P] Validate Vitest + Playwright setup for adding scan tests in vitest.config.ts, tests/setup.ts, and playwright.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core scan types + helpers that all scan user stories build on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add client-side OCR dependency and lock version in package.json (ensure it can be lazy-loaded on demand)
- [X] T005 [P] Define ReceiptScanStatus + ReceiptScanResult types per specs/002-scan-bill-ocr/contracts/ocr.md in src/lib/receipt-scan/types.ts
- [X] T006 [P] Implement applyScanToDraft helper per contract (inputs/outputs, appliedFields) in src/lib/receipt-scan/applyScanToDraft.ts
- [X] T007 [P] Implement receipt parsing heuristics (suggestedTitle + suggestedTotalAmount) from rawText in src/lib/receipt-scan/parseReceiptText.ts
- [X] T008 Implement OCR wrapper: File/Blob → rawText → ReceiptScanResult (uses dynamic import, non-blocking UI strategy) in src/lib/receipt-scan/ocr.ts
- [X] T009 [P] Add Vitest unit tests for parseReceiptText + applyScanToDraft in tests/unit/receipt-scan.test.ts
- [X] T010 Add deterministic OCR stub mode for Playwright (env-flagged) in src/lib/receipt-scan/ocr.ts and playwright.config.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Scan Receipt to Prefill Bill (Priority: P1) 🎯 MVP

**Goal**: Organizer can select/capture a receipt image and see Title + Total Amount prefilled as suggestions.

**Independent Test**: From `http://localhost:3000/create`, select “Scan receipt”, choose a receipt image, and verify Title + Total Amount are prefilled.

### Tests for User Story 1

- [X] T011 [P] [US1] Add Playwright E2E coverage for “scan receipt prefill” (using stub OCR mode + file upload) in tests/e2e/receipt-scan.spec.ts

### Implementation for User Story 1

- [X] T012 [P] [US1] Add “Scan receipt” entry point UI (button + hidden file input) in src/components/bill/BillCreateForm.tsx
- [X] T013 [US1] Implement scan state machine (idle/capturing/recognizing/prefilled/failed) in src/components/bill/BillCreateForm.tsx
- [X] T014 [US1] Wire OCR → applyScanToDraft → form state updates for title/totalAmount in src/components/bill/BillCreateForm.tsx
- [X] T015 [US1] Display “suggested from scan” affordance for applied fields and failure messaging on recognition errors in src/components/bill/BillCreateForm.tsx

**Checkpoint**: US1 functional and independently verifiable from the create bill UI

---

## Phase 4: User Story 2 - Review and Correct Prefilled Details (Priority: P2)

**Goal**: Organizer can edit or clear suggested values and still create a bill with the corrected values.

**Independent Test**: After a scan prefill, edit Title/Total Amount and confirm bill creation uses edited values; clear fields and proceed with manual entry.

### Tests for User Story 2

- [X] T016 [P] [US2] Extend Playwright E2E to cover editing + clearing prefilled values in tests/e2e/receipt-scan.spec.ts

### Implementation for User Story 2

- [X] T017 [US2] Ensure edits to title/totalAmount always win over suggestions (no “locking” fields) in src/components/bill/BillCreateForm.tsx
- [X] T018 [US2] Add “Clear prefill” action that clears Title + Total Amount and resets scan suggestion metadata in src/components/bill/BillCreateForm.tsx

**Checkpoint**: US2 functional and independently verifiable after a scan prefill

---

## Phase 5: User Story 3 - Retake Photo for Better Results (Priority: P3)

**Goal**: Organizer can retake/reselect an image and replace previous suggestions without starting over.

**Independent Test**: After a scan prefill, choose “Retake”, select a new image, and confirm the prefilled values update to the new suggestions.

### Tests for User Story 3

- [X] T019 [P] [US3] Extend Playwright E2E to cover retake replacing values (stub OCR returns different results per run) in tests/e2e/receipt-scan.spec.ts

### Implementation for User Story 3

- [X] T020 [US3] Add “Retake” action and ensure it replaces prior scan result + applied fields in src/components/bill/BillCreateForm.tsx

**Checkpoint**: US3 functional and independently verifiable via the retake loop

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Performance, resilience, privacy constraints, and quickstart validation

- [X] T021 [P] Ensure OCR assets load only after scan is initiated (dynamic import boundaries) in src/lib/receipt-scan/ocr.ts and src/components/bill/BillCreateForm.tsx
- [X] T022 Improve UX for edge cases (cancelled picker, permission denial, offline, no suggestions) without blocking manual entry in src/components/bill/BillCreateForm.tsx
- [X] T023 Ensure receipt image is never retained or uploaded (no File stored long-term, clear input, no logs) in src/components/bill/BillCreateForm.tsx and src/lib/receipt-scan/ocr.ts
- [X] T024 Run quickstart validation steps from specs/002-scan-bill-ocr/quickstart.md (npm run dev, npm run test, npm run test:e2e --project=chromium) and fix any failures in tests/e2e/receipt-scan.spec.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on desired user stories being complete

### User Story Dependencies

- **[US1]**: Can start after Foundational (Phase 2)
- **[US2]**: Can start after Foundational (Phase 2), builds on scan prefill behavior from US1
- **[US3]**: Can start after Foundational (Phase 2), builds on scan prefill behavior from US1

### Parallel Opportunities

- Phase 1 tasks with [P] can be done in parallel (T002-T003)
- Phase 2 tasks with [P] can be done in parallel (T005-T007, T009)
- Within US1: E2E test (T011) can be developed in parallel with UI wiring (T012-T015) once stub mode (T010) exists

---

## Parallel Example: User Story 1

- [ ] T011 [P] [US1] Add Playwright E2E coverage for “scan receipt prefill” (using stub OCR mode + file upload) in tests/e2e/receipt-scan.spec.ts
- [ ] T012 [P] [US1] Add “Scan receipt” entry point UI (button + hidden file input) in src/components/bill/BillCreateForm.tsx
