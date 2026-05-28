export interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Bill {
  id: string;
  short_id: string;
  organizer_id: string;
  title: string;
  total_amount: number;
  description?: string;
  due_date: string;
  currency: string;
  created_at: string;
}

export interface Participant {
  id: string;
  bill_id: string;
  name: string;
  share_amount: number;
  status: 'unpaid' | 'paid';
  paid_at?: string;
  created_at: string;
}

export interface CreateBillInput {
  title: string;
  totalAmount: number;
  description?: string;
  dueDate: string;
  currency: string;
  participants: Array<{
    name: string;
    shareAmount: number;
  }>;
}

export interface CreateBillResponse {
  success: boolean;
  billId?: string;
  shortId?: string;
  error?: string;
}

export interface ConfirmPaymentInput {
  participantId: string;
  billShortId: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  paidAt?: string;
  error?: string;
}

export interface BillSummary {
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

export interface BillDetails extends BillSummary {
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
