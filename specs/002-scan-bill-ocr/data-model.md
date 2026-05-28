# Data Model: Receipt Scan Autofill

This feature does not introduce new persistent data in the database. It adds transient “scan suggestion” data that exists only during bill creation.

## Entities (Transient)

### ReceiptScanResult

Represents the recognition output used to prefill the create bill form.

- **rawText**: The recognized text extracted from the captured image.
- **suggestedTitle**: Suggested title for the bill (optional).
- **suggestedTotalAmount**: Suggested total amount (optional).
- **metadata**: Optional attributes that help with UI messaging (e.g., confidence buckets, detected currency tokens, extraction notes).

### BillDraft

Represents the create bill form state.

- **title**: User-editable; may be prefilled from ReceiptScanResult.
- **totalAmount**: User-editable; may be prefilled from ReceiptScanResult.
- **dueDate**: User-entered (not targeted by scanning for MVP).
- **participants**: User-entered (not targeted by scanning for MVP).

## State Transitions (UI)

### Scan Flow States

- **idle** → user chooses scan
- **capturing** → user captures/selects a photo
- **recognizing** → system extracts text and suggestions
- **prefilled** → form is updated with suggested values
- **failed** → user sees a failure message and can retry or proceed manually

## Persistence

- Receipt images and scan results are not stored as part of the bill record.
- The bill record remains unchanged; only the existing “create bill” payload is saved.
