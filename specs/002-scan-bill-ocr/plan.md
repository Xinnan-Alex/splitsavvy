# Implementation Plan: Receipt Scan Autofill

**Branch**: `002-scan-bill-ocr` | **Date**: 2026-05-28 | **Spec**: [spec.md](file:///Users/alexleong/repos/splitsavvy/specs/002-scan-bill-ocr/spec.md)

**Input**: Feature specification from `/specs/002-scan-bill-ocr/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a “Scan receipt” entry point in the create bill flow that lets organizers capture a receipt photo and uses on-device text recognition to suggest values for Title and Total Amount. The form remains fully editable with clear fallback paths (retake or manual entry), and receipt images are not retained as part of a bill.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Next.js 16.2.6, React 19.2.4, Supabase, shadcn UI components

**Storage**: Supabase Postgres for bills/participants; no additional persistent storage for scanning

**Testing**: Vitest (unit), Playwright (e2e)

**Target Platform**: Web (mobile browsers first; also supports desktop browsers)

**Project Type**: Web application

**Performance Goals**: Keep default create bill load fast; recognition assets load only after user initiates scanning; recognition should not freeze the UI

**Constraints**: Do not block manual entry; do not persist receipt photos; handle permission denial and recognition failure gracefully

**Scale/Scope**: MVP targets printed receipts; suggests Title and Total Amount only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file is currently placeholder content; no explicit gates are defined.
- Proceed using existing repository standards: keep scope small, avoid secrets, avoid storing receipt photos, and maintain test coverage for user-critical flows.

## Project Structure

### Documentation (this feature)

```text
specs/002-scan-bill-ocr/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app/
│   └── (organizer)/
│       └── create/
│           └── page.tsx
├── components/
│   └── bill/
│       └── BillCreateForm.tsx
└── lib/
    └── [receipt scanning helpers, if introduced]

tests/
├── unit/
└── e2e/
```

**Structure Decision**: Continue the existing Next.js app structure. The scan entry point lives in the create bill UI, with scan recognition logic isolated into a reusable helper/module and tested independently where possible.

## Complexity Tracking

No constitution violations identified for this feature.
