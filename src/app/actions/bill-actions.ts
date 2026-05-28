'use server';

import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import type {
  BillDetails,
  BillSummary,
  ConfirmPaymentInput,
  ConfirmPaymentResponse,
  CreateBillInput,
  CreateBillResponse,
} from '@/types';
import { revalidatePath } from 'next/cache';

type ParticipantRow = {
  id: string;
  bill_id: string;
  name: string;
  share_amount: number | string;
  status: 'unpaid' | 'paid';
  paid_at: string | null;
  created_at: string;
};

type BillRow = {
  id: string;
  short_id: string;
  organizer_id: string;
  title: string;
  total_amount: number | string;
  description: string | null;
  due_date: string;
  currency: string;
  created_at: string;
  participants: ParticipantRow[];
};

export async function createBill(data: CreateBillInput): Promise<CreateBillResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const shortId = nanoid(10);

  // 1. Create the bill
  const { data: bill, error: billError } = await supabase
    .from('bills')
    .insert({
      title: data.title,
      total_amount: data.totalAmount,
      description: data.description,
      due_date: data.dueDate,
      currency: data.currency,
      organizer_id: user.id,
      short_id: shortId,
    })
    .select()
    .single();

  if (billError) {
    console.error('Error creating bill:', billError);
    return { success: false, error: billError.message };
  }

  // 2. Create participants
  const participantsData = data.participants.map((p) => ({
    bill_id: bill.id,
    name: p.name,
    share_amount: p.shareAmount,
  }));

  const { error: participantsError } = await supabase
    .from('participants')
    .insert(participantsData);

  if (participantsError) {
    console.error('Error creating participants:', participantsError);
    // Note: In a real app, you might want to rollback the bill creation
    return { success: false, error: participantsError.message };
  }

  revalidatePath('/dashboard');

  return {
    success: true,
    billId: bill.id,
    shortId: bill.short_id,
  };
}

export async function deleteBill(billId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from('bills').delete().eq('id', billId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function getBillDetails(idOrShortId: string) {
  const supabase = await createClient();

  // Try to find by short_id first, then by id
  let query = supabase
    .from('bills')
    .select(`
      *,
      participants (*)
    `);

  if (idOrShortId.length <= 12) {
    query = query.eq('short_id', idOrShortId);
  } else {
    query = query.eq('id', idOrShortId);
  }

  const { data: billData, error } = await query.single();

  if (error || !billData) {
    console.error('Error fetching bill details:', error);
    return null;
  }

  const bill = billData as unknown as BillRow;
  const participants = bill.participants ?? [];
  const paidAmount = participants
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.share_amount), 0);

  const paidCount = participants.filter((p) => p.status === 'paid').length;
  const participantCount = participants.length;
  const totalAmount = Number(bill.total_amount);
  const dueDate = bill.due_date;
  const isOverdue = new Date(dueDate) < new Date() && paidCount !== participantCount;
  const status: BillSummary['status'] =
    paidCount === participantCount ? 'completed' : isOverdue ? 'overdue' : 'pending';

  const details: BillDetails = {
    id: bill.id,
    shortId: bill.short_id,
    title: bill.title,
    totalAmount,
    paidAmount,
    participantCount,
    paidCount,
    dueDate,
    currency: bill.currency,
    status,
    description: bill.description ?? undefined,
    participants: participants.map((p) => ({
      id: p.id,
      name: p.name,
      shareAmount: Number(p.share_amount),
      status: p.status,
      paidAt: p.paid_at ?? undefined,
    })),
  };

  return details;
}

export async function confirmPayment(data: ConfirmPaymentInput): Promise<ConfirmPaymentResponse> {
  const supabase = await createClient();

  const { data: participant, error } = await supabase
    .from('participants')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', data.participantId)
    .select()
    .single();

  if (error) {
    console.error('Error confirming payment:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/bill/${data.billShortId}`);
  revalidatePath('/dashboard');

  return {
    success: true,
    paidAt: participant.paid_at,
  };
}

export async function getOrganizerBills(): Promise<BillSummary[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: bills, error } = await supabase
    .from('bills')
    .select(`
      *,
      participants (*)
    `)
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching organizer bills:', error);
    return [];
  }

  const rows = (bills ?? []) as unknown as BillRow[];

  return rows.map((bill) => {
    const participants = bill.participants ?? [];
    const paidAmount = participants
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.share_amount), 0);

    const paidCount = participants.filter((p) => p.status === 'paid').length;
    const participantCount = participants.length;
    const totalAmount = Number(bill.total_amount);
    const dueDate = bill.due_date;
    const isOverdue = new Date(dueDate) < new Date() && paidCount !== participantCount;
    const status: BillSummary['status'] =
      paidCount === participantCount ? 'completed' : isOverdue ? 'overdue' : 'pending';

    return {
      id: bill.id,
      shortId: bill.short_id,
      title: bill.title,
      totalAmount,
      paidAmount,
      participantCount,
      paidCount,
      dueDate,
      currency: bill.currency,
      status,
    };
  });
}
