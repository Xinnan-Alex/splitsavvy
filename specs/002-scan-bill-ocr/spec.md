# Feature Specification: Receipt Scan Autofill

**Feature Branch**: `002-scan-bill-ocr`

**Created**: 2026-05-28

**Status**: Draft

**Input**: User description: "Add a feature where user can take a picture using their camera and we will use text recognition to recognize the content and fill it up in the create bill page so user do not need to key in one by one."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan Receipt to Prefill Bill (Priority: P1)

As an organizer, I want to take a photo of a receipt/bill so that the create bill form is prefilled and I don’t need to type everything manually.

**Why this priority**: Reduces the main friction point (data entry) in the most common starting flow (creating a bill), improving time-to-create and lowering user drop-off.

**Independent Test**: From the create bill page, an organizer can scan a printed receipt and see the Title and Total Amount fields prefilled.

**Acceptance Scenarios**:

1. **Given** the organizer is on the create bill page, **When** they choose “Scan receipt” and capture a clear photo of a printed receipt, **Then** the form is prefilled with a suggested Title and Total Amount.
2. **Given** the organizer is on the create bill page, **When** they scan a photo that cannot be recognized, **Then** the system explains that it couldn’t prefill the form and the organizer can continue with manual entry.

---

### User Story 2 - Review and Correct Prefilled Details (Priority: P2)

As an organizer, I want to review and edit the prefilled values so that I can correct any mistakes before saving the bill.

**Why this priority**: Recognition is never perfect; review and correction ensures data quality without blocking the flow.

**Independent Test**: After scanning, the organizer can edit any prefilled field and successfully create a bill with the corrected values.

**Acceptance Scenarios**:

1. **Given** the form is prefilled from a scan, **When** the organizer edits the suggested Title or Total Amount, **Then** the edited values are used when the bill is saved.
2. **Given** the form is prefilled from a scan, **When** the organizer clears the prefilled values, **Then** the organizer can proceed with fully manual entry.

---

### User Story 3 - Retake Photo for Better Results (Priority: P3)

As an organizer, I want to retake the photo if the scan results look wrong so that I can get a better prefill without starting over.

**Why this priority**: Users commonly capture blurry/partial photos; a “retake” loop avoids frustration and improves success rates.

**Independent Test**: An organizer can retake the scan and see updated prefilled values replace the previous ones.

**Acceptance Scenarios**:

1. **Given** a scan result is shown, **When** the organizer selects “Retake”, **Then** they can capture a new photo and the form updates with the new suggested values.

---

### Edge Cases

- **Camera permission denied**: Organizer can still create a bill manually and is told how to enable camera access if they want scanning.
- **Blurry/low-light photo**: The system does not prefill incorrect values silently; it prompts the user to retake or proceed manually.
- **Multiple totals detected**: The system prefers a clearly-labeled grand total and makes it easy for the organizer to change the value.
- **Non-receipt images**: The system handles unrelated photos gracefully and falls back to manual entry.
- **Offline / poor connectivity**: The scan flow fails gracefully and does not block manual bill creation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an option on the create bill page to scan a receipt/bill using the device camera.
- **FR-002**: System MUST request camera access only when the organizer initiates scanning.
- **FR-003**: System MUST extract text from the captured photo and generate suggested values for at least: Title and Total Amount.
- **FR-004**: System MUST prefill the create bill form with the suggested values and clearly indicate they are suggestions (not final).
- **FR-005**: Organizers MUST be able to edit or clear any prefilled values before saving the bill.
- **FR-006**: System MUST allow the organizer to retake the photo and replace the previous suggested values with the new results.
- **FR-007**: If the scan cannot produce suggested values, the system MUST explain the failure in plain language and allow full manual entry without extra steps.
- **FR-008**: System MUST avoid retaining the captured photo beyond completing the prefill step or the user cancelling the scan flow.

### Key Entities *(include if feature involves data)*

- **Scan Result**: A structured set of suggested fields derived from the photo (e.g., suggested title, suggested total amount) plus enough context to explain what was extracted.
- **Bill Draft**: The create bill form state, which may include a mix of user-entered values and scan-suggested values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Organizers can complete bill creation in under 30 seconds when scanning a typical printed receipt.
- **SC-002**: For clear printed receipts, the system correctly suggests the Total Amount at least 80% of the time.
- **SC-003**: At least 90% of organizers who attempt scanning can either (a) create a bill from the suggested values or (b) successfully fall back to manual entry without abandoning the flow.
- **SC-004**: The scan flow provides a clear recovery path (retake or manual entry) for 100% of failed recognition attempts.

## Assumptions

- Organizers commonly create bills on mobile devices with a camera (e.g., after dining out).
- The MVP targets printed receipts/bills; handwritten notes and highly-stylized designs are not a primary target.
- Participant names and split logic are still entered manually; scanning is focused on reducing entry for core bill metadata (especially Total Amount).
- The create bill flow already exists and can accept prefilled values without changing its fundamental steps.
