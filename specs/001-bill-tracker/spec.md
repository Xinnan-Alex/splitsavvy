# Feature Specification: Split Bill & Payment Tracker

**Feature Branch**: `001-bill-tracker`

**Created**: 2026-05-28

**Status**: Draft

**Input**: User description: "/Users/alexleong/repos/splitsavvy/bounty.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bill Creation & Sharing (Priority: P1)

As an organizer, I want to create a bill for a group activity so that I can easily track how much each person owes me.

**Why this priority**: This is the core entry point of the application. Without bill creation, the rest of the app cannot function.

**Independent Test**: An organizer can fill out a form with bill details and receive a unique URL that they can copy.

**Acceptance Scenarios**:

1. **Given** the organizer is on the creation page, **When** they enter a title, total amount, participant names, and a due date, **Then** a new bill is saved and a shareable link is generated.
2. **Given** a generated bill link, **When** the organizer shares it via WhatsApp, **Then** anyone with the link can access the bill details.

---

### User Story 2 - Member Payment Confirmation (Priority: P1)

As a participant, I want to view the bill details and mark my payment as done so that the organizer knows I've paid.

**Why this priority**: This is the primary action for members and provides the data needed for tracking.

**Independent Test**: A user opening the bill link can see their name and click a "Confirm Payment" button.

**Acceptance Scenarios**:

1. **Given** a participant opens a bill link, **When** they find their name and click "Confirm Payment", **Then** the system records their payment status as "Paid".
2. **Given** a simulated payment flow, **When** the user confirms payment, **Then** they see a success message and the bill status updates for them.

---

### User Story 3 - Organizer Tracking Dashboard (Priority: P1)

As an organizer, I want to see a summary of who has paid and who hasn't so that I can follow up with those who are late.

**Why this priority**: This provides the value to the organizer, fulfilling the "no awkward follow-ups" goal.

**Independent Test**: The organizer dashboard displays a progress bar and a list of paid/unpaid participants.

**Acceptance Scenarios**:

1. **Given** the organizer views their bill dashboard, **When** participants confirm payments, **Then** the "Total Collected" and "Remaining Amount" values update automatically.
2. **Given** the participant list, **When** the organizer checks the dashboard, **Then** they can clearly distinguish between "Paid" and "Unpaid" members.

---

### Edge Cases

- **Multiple Participants with same name**: The system should handle or prevent duplicate names within a single bill to avoid confusion.
- **Late Payments**: The system should highlight participants who haven't paid past the due date.
- **Over-collection**: If the total amount is modified after some participants have paid, the system needs to handle the discrepancy.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an organizer to create a bill with: Title, Total Amount, List of Participants, Due Date, and Description.
- **FR-002**: System MUST generate a unique, shareable URL for each created bill.
- **FR-003**: System MUST provide a public-facing page for participants to view bill details (Total, Individual Share, Due Date).
- **FR-004**: System MUST allow participants to confirm their payment via a simple manual confirmation (simulated payment).
- **FR-005**: System MUST provide an organizer-only dashboard view showing:
    - Total amount collected vs. Total goal.
    - Progress percentage.
    - List of participants with their individual payment status.
- **FR-006**: System MUST be responsive and optimized for mobile browsers (WhatsApp web view).

### Key Entities *(include if feature involves data)*

- **Bill**: 
    - `id` (Unique Identifier)
    - `title` (String)
    - `totalAmount` (Number)
    - `description` (Text)
    - `dueDate` (Date)
    - `organizerId` (Identifier)
- **Participant**:
    - `id` (Unique Identifier)
    - `billId` (Reference to Bill)
    - `name` (String)
    - `shareAmount` (Number)
    - `status` (Enum: Unpaid, Paid)
    - `paidAt` (Timestamp, optional)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Organizers can complete the bill creation process in under 45 seconds.
- **SC-002**: Participants can confirm their payment in 2 taps after opening the link.
- **SC-003**: The dashboard provides a visual progress indicator that updates within 500ms of a status change.
- **SC-004**: 100% of core features (create, view, confirm, track) are usable on screens as narrow as 320px.

## Assumptions

- **Manual Confirmation**: We assume that for this MVP, a "trust-based" manual confirmation by the participant is sufficient, or the organizer can verify later. Real bank integration is out of scope.
- **No Participant Accounts**: Participants do not need to log in to confirm payment to reduce friction.
- **Stateless/Simple Auth**: Organizer access to the dashboard is managed via a unique administrative link or simple session, avoiding complex RBAC for now.
- **Currency**: The system defaults to RM (Ringgit Malaysia) as per the bounty description, but should be generic enough for other currencies.
