import type {
  ApplyScanToDraftInput,
  ApplyScanToDraftOutput,
} from '@/lib/receipt-scan/types';

function formatAmount(amount: number): string {
  if (!Number.isFinite(amount)) return '';
  return amount.toFixed(2);
}

export function applyScanToDraft(input: ApplyScanToDraftInput): ApplyScanToDraftOutput {
  const appliedFields: Array<'title' | 'totalAmount'> = [];

  let nextTitle = input.currentTitle;
  if (nextTitle.trim() === '' && input.scan.suggestedTitle?.trim()) {
    nextTitle = input.scan.suggestedTitle.trim();
    appliedFields.push('title');
  }

  let nextTotalAmount = input.currentTotalAmount;
  if (nextTotalAmount.trim() === '' && typeof input.scan.suggestedTotalAmount === 'number') {
    nextTotalAmount = formatAmount(input.scan.suggestedTotalAmount);
    if (nextTotalAmount) appliedFields.push('totalAmount');
  }

  return { nextTitle, nextTotalAmount, appliedFields };
}

