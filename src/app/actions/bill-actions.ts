'use server';

import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';
import { CreateBillInput, CreateBillResponse } from '@/types';
import { revalidatePath } from 'next/cache';

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

  const { data: bill, error } = await query.single();

  if (error || !bill) {
    console.error('Error fetching bill details:', error);
    return null;
  }

  const paidAmount = bill.participants
    .filter((p: any) => p.status === 'paid')
    .reduce((sum: number, p: any) => sum + parseFloat(p.share_amount), 0);

  const paidCount = bill.participants.filter((p: any) => p.status === 'paid').length;

  return {
    ...bill,
    totalAmount: parseFloat(bill.total_amount),
    paidAmount,
    participantCount: bill.participants.length,
    paidCount,
    status: paidCount === bill.participants.length ? 'completed' : 'pending',
    participants: bill.participants.map((p: any) => ({
      ...p,
      shareAmount: parseFloat(p.share_amount),
    })),
  };
}

export async function confirmPayment(data: {
  participantId: string;
  billShortId: string;
}) {
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

export async function getOrganizerBills() {
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

  return bills.map((bill: any) => {
    const paidAmount = bill.participants
      .filter((p: any) => p.status === 'paid')
      .reduce((sum: number, p: any) => sum + parseFloat(p.share_amount), 0);

    const paidCount = bill.participants.filter((p: any) => p.status === 'paid').length;

    return {
      ...bill,
      totalAmount: parseFloat(bill.total_amount),
      paidAmount,
      participantCount: bill.participants.length,
      paidCount,
      status: paidCount === bill.participants.length ? 'completed' : 'pending',
    };
  });
}
