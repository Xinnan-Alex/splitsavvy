# Interface Contracts: Server Actions

This document defines the TypeScript interfaces and contracts for the Next.js Server Actions.

## Organizer Actions

### `createBill`
Creates a new bill and its participants.

```typescript
interface CreateBillInput {
  title: string;
  totalAmount: number;
  description?: string;
  dueDate: string; // ISO date string
  currency: string;
  participants: Array<{
    name: string;
    shareAmount: number;
  }>;
}

interface CreateBillResponse {
  success: boolean;
  billId?: string;
  shortId?: string;
  error?: string;
}

/**
 * @action createBill
 * @access Authenticated (Organizer)
 */
export async function createBill(data: CreateBillInput): Promise<CreateBillResponse>;
```

### `deleteBill`
Deletes a bill and all its participants.

```typescript
/**
 * @action deleteBill
 * @access Authenticated (Owner only)
 */
export async function deleteBill(billId: string): Promise<{ success: boolean; error?: string }>;
```

## Participant Actions

### `confirmPayment`
Marks a participant as paid.

```typescript
interface ConfirmPaymentInput {
  participantId: string;
  billShortId: string;
}

interface ConfirmPaymentResponse {
  success: boolean;
  paidAt?: string;
  error?: string;
}

/**
 * @action confirmPayment
 * @access Public (with billShortId)
 */
export async function confirmPayment(data: ConfirmPaymentInput): Promise<ConfirmPaymentResponse>;
```

## Dashboard Data Fetching

### `getOrganizerBills`
Fetches all bills created by the current user with summary stats.

```typescript
interface BillSummary {
  id: string;
  shortId: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  participantCount: number;
  paidCount: number;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
}

/**
 * @query getOrganizerBills
 * @access Authenticated (Organizer)
 */
export async function getOrganizerBills(): Promise<BillSummary[]>;
```

### `getBillDetails`
Fetches full details for a specific bill.

```typescript
interface BillDetails extends BillSummary {
  description?: string;
  currency: string;
  participants: Array<{
    id: string;
    name: string;
    shareAmount: number;
    status: 'paid' | 'unpaid';
    paidAt?: string;
  }>;
}

/**
 * @query getBillDetails
 * @access Public (via shortId) or Authenticated (Owner via id)
 */
export async function getBillDetails(idOrShortId: string): Promise<BillDetails | null>;
```
