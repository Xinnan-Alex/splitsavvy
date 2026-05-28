import type { ReceiptScanResult } from '@/lib/receipt-scan/types';
import { parseReceiptText } from '@/lib/receipt-scan/parseReceiptText';

let stubCounter = 0;

let sharedWorkerPromise: Promise<import('tesseract.js').Worker> | null = null;

async function getWorker(): Promise<import('tesseract.js').Worker> {
  if (sharedWorkerPromise) return sharedWorkerPromise;

  sharedWorkerPromise = (async () => {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    return worker;
  })();

  return sharedWorkerPromise;
}

function buildResultFromRawText(rawText: string, extraNotes: string[] = []): ReceiptScanResult {
  const parsed = parseReceiptText(rawText);
  const notes = [...extraNotes, ...(parsed.notes ?? [])].filter(Boolean);
  return {
    rawText,
    suggestedTitle: parsed.suggestedTitle,
    suggestedTotalAmount: parsed.suggestedTotalAmount,
    notes: notes.length ? notes : undefined,
  };
}

function getStubRawText(sequence: number): string {
  if (sequence % 2 === 0) {
    return [
      'STUB MART',
      'ITEM A 5.00',
      'ITEM B 7.34',
      'TOTAL 12.34',
    ].join('\n');
  }

  return [
    'STUB CAFE',
    'SUBTOTAL 50.00',
    'TAX 3.33',
    'GRAND TOTAL 56.78',
  ].join('\n');
}

export async function scanReceiptImage(image: Blob): Promise<ReceiptScanResult> {
  if (process.env.NEXT_PUBLIC_OCR_STUB === '1') {
    const rawText = getStubRawText(stubCounter++);
    return buildResultFromRawText(rawText, ['OCR stub mode enabled.']);
  }

  if (typeof window === 'undefined') {
    throw new Error('Receipt scanning is only available in the browser.');
  }

  const worker = await getWorker();
  const result = await worker.recognize(image);
  const rawText = (result?.data?.text ?? '').trim();
  return buildResultFromRawText(rawText);
}
