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

