import { describe, it, expect } from 'vitest';
import { parseReceiptText } from '@/lib/receipt-scan/parseReceiptText';
import { applyScanToDraft } from '@/lib/receipt-scan/applyScanToDraft';

describe('parseReceiptText', () => {
  it('suggests a title and total amount for a simple receipt', () => {
    const rawText = [
      "Mama's Kitchen",
      '123 Street',
      'Total 12.34',
    ].join('\n');

    const result = parseReceiptText(rawText);

    expect(result.suggestedTitle).toBe("Mama's Kitchen");
    expect(result.suggestedTotalAmount).toBeCloseTo(12.34);
  });

  it('prefers grand total over subtotal', () => {
    const rawText = [
      'SHOP NAME',
      'SUBTOTAL 50.00',
      'TAX 3.33',
      'GRAND TOTAL 56.78',
    ].join('\n');

    const result = parseReceiptText(rawText);

    expect(result.suggestedTotalAmount).toBeCloseTo(56.78);
  });
});

describe('applyScanToDraft', () => {
  it('applies suggestions only to empty fields and reports appliedFields', () => {
    const result = applyScanToDraft({
      currentTitle: '',
      currentTotalAmount: '',
      scan: { rawText: 'x', suggestedTitle: 'Dinner', suggestedTotalAmount: 12.3 },
    });

    expect(result.nextTitle).toBe('Dinner');
    expect(result.nextTotalAmount).toBe('12.30');
    expect(result.appliedFields).toEqual(['title', 'totalAmount']);
  });

  it('does not override existing user input', () => {
    const result = applyScanToDraft({
      currentTitle: 'Manual Title',
      currentTotalAmount: '9.99',
      scan: { rawText: 'x', suggestedTitle: 'Dinner', suggestedTotalAmount: 12.3 },
    });

    expect(result.nextTitle).toBe('Manual Title');
    expect(result.nextTotalAmount).toBe('9.99');
    expect(result.appliedFields).toEqual([]);
  });
});

