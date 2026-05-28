function normalizeAmountToken(token: string): number | null {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/[^\d.,-]/g, '');
  if (!cleaned) return null;

  const negative = cleaned.includes('-');
  const digits = cleaned.replace(/-/g, '');

  const lastDot = digits.lastIndexOf('.');
  const lastComma = digits.lastIndexOf(',');
  const decimalSepIndex = Math.max(lastDot, lastComma);

  let normalized = digits;
  if (decimalSepIndex !== -1) {
    const intPart = digits.slice(0, decimalSepIndex).replace(/[.,]/g, '');
    const decPart = digits.slice(decimalSepIndex + 1).replace(/[.,]/g, '');
    if (!intPart || !decPart) return null;
    normalized = `${intPart}.${decPart}`;
  } else {
    normalized = digits.replace(/[.,]/g, '');
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  const signed = negative ? -value : value;
  if (signed <= 0) return null;
  return signed;
}

function extractAmountsFromLine(line: string): number[] {
  const tokens = line.match(/-?\d[\d.,]*\d|\d/g) ?? [];
  const parsed: number[] = [];
  for (const token of tokens) {
    const amount = normalizeAmountToken(token);
    if (amount !== null) parsed.push(amount);
  }
  return parsed;
}

function isPlausibleMerchantLine(line: string): boolean {
  const upper = line.toUpperCase();
  if (upper.includes('RECEIPT') || upper.includes('INVOICE')) return false;
  if (upper.includes('TOTAL') || upper.includes('SUBTOTAL')) return false;
  if (upper.includes('CASH') || upper.includes('CHANGE')) return false;
  if (upper.match(/\d[.,]\d{2}\b/)) return false;
  if (upper.match(/^\d+$/)) return false;
  if (!upper.match(/[A-Z]/)) return false;
  return upper.replace(/[^A-Z]/g, '').length >= 3;
}

function pickSuggestedTitle(lines: string[]): string | undefined {
  for (const line of lines.slice(0, 8)) {
    if (isPlausibleMerchantLine(line)) {
      const cleaned = line.replace(/\s+/g, ' ').trim();
      if (cleaned.length >= 3 && cleaned.length <= 60) return cleaned;
    }
  }
  return undefined;
}

function pickSuggestedTotal(lines: string[]): { amount?: number; notes: string[] } {
  const notes: string[] = [];

  const keywordWeights: Array<{ re: RegExp; weight: number }> = [
    { re: /\bGRAND\s*TOTAL\b/i, weight: 4 },
    { re: /\bAMOUNT\s+DUE\b/i, weight: 3 },
    { re: /\bBALANCE\s+DUE\b/i, weight: 3 },
    { re: /\bTOTAL\b/i, weight: 2 },
  ];

  type Candidate = { amount: number; score: number };
  const candidates: Candidate[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const upper = line.toUpperCase();
    const amounts = extractAmountsFromLine(line);
    if (amounts.length === 0) continue;

    let score = 0;
    for (const { re, weight } of keywordWeights) {
      if (re.test(upper)) score += weight;
    }
    if (/\bSUBTOTAL\b/i.test(upper)) score -= 2;
    if (/\bTAX\b|\bGST\b|\bVAT\b|\bSERVICE\b/i.test(upper)) score -= 1;

    const chosen = amounts[amounts.length - 1];
    candidates.push({ amount: chosen, score });
  }

  if (candidates.length === 0) return { notes };

  candidates.sort((a, b) => b.score - a.score || b.amount - a.amount);
  const best = candidates[0];

  const keywordMatched = best.score > 0;
  if (!keywordMatched) {
    notes.push('No total keyword match; used best-effort amount heuristic.');
  }

  return { amount: best.amount, notes };
}

export function parseReceiptText(rawText: string): {
  suggestedTitle?: string;
  suggestedTotalAmount?: number;
  notes: string[];
} {
  const notes: string[] = [];
  const cleaned = rawText.replace(/\r\n/g, '\n').replace(/\t/g, ' ');
  const lines = cleaned
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const suggestedTitle = pickSuggestedTitle(lines);
  const totalPick = pickSuggestedTotal(lines);
  notes.push(...totalPick.notes);

  return {
    suggestedTitle,
    suggestedTotalAmount: totalPick.amount,
    notes,
  };
}
