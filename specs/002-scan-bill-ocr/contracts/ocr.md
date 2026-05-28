# Interface Contracts: Receipt Scan Autofill

This document defines the interfaces between the “scan receipt” UI and the create bill form.

## Types

```typescript
export type ReceiptScanStatus =
  | 'idle'
  | 'capturing'
  | 'recognizing'
  | 'prefilled'
  | 'failed';

export interface ReceiptScanResult {
  rawText: string;
  suggestedTitle?: string;
  suggestedTotalAmount?: number;
  notes?: string[];
}

export interface ApplyScanToDraftInput {
  currentTitle: string;
  currentTotalAmount: string;
  scan: ReceiptScanResult;
}

export interface ApplyScanToDraftOutput {
  nextTitle: string;
  nextTotalAmount: string;
  appliedFields: Array<'title' | 'totalAmount'>;
}
```

## Responsibilities

### Scan UI

- Produces a `ReceiptScanResult` from a user-captured image.
- Exposes a clear retry/retake path.
- Never blocks manual entry if recognition fails.

### Create Bill Form

- Applies scan suggestions as editable values (never “locks” fields).
- Clearly indicates prefilled values are suggestions.
- Allows the organizer to override or clear any prefilled values.
