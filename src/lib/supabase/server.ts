import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

type E2EUser = { id: string };

type E2EBill = {
  id: string;
  short_id: string;
  organizer_id: string;
  title: string;
  total_amount: number;
  description: string | null;
  due_date: string;
  currency: string;
  created_at: string;
};

type E2EParticipant = {
  id: string;
  bill_id: string;
  name: string;
  share_amount: number;
  status: 'unpaid' | 'paid';
  paid_at: string | null;
  created_at: string;
};

type E2EStore = {
  user: E2EUser;
  bills: E2EBill[];
  participants: E2EParticipant[];
  nextBillNumber: number;
  nextParticipantNumber: number;
};

function getE2EStore(): E2EStore {
  const key = '__splitsavvyE2EStore__';
  const existing = (globalThis as unknown as Record<string, E2EStore | undefined>)[key];
  if (existing) return existing;

  const now = new Date().toISOString();
  const user: E2EUser = { id: '00000000-0000-0000-0000-000000000001' };
  const billId = '00000000-0000-0000-0000-000000000101';
  const bill: E2EBill = {
    id: billId,
    short_id: 'test-bill',
    organizer_id: user.id,
    title: 'Test Bill',
    total_amount: 150,
    description: null,
    due_date: '2026-06-30',
    currency: 'RM',
    created_at: now,
  };

  const participants: E2EParticipant[] = [
    {
      id: '00000000-0000-0000-0000-000000001001',
      bill_id: billId,
      name: 'Alice',
      share_amount: 75,
      status: 'unpaid',
      paid_at: null,
      created_at: now,
    },
    {
      id: '00000000-0000-0000-0000-000000001002',
      bill_id: billId,
      name: 'Bob',
      share_amount: 75,
      status: 'unpaid',
      paid_at: null,
      created_at: now,
    },
  ];

  const seeded: E2EStore = {
    user,
    bills: [bill],
    participants,
    nextBillNumber: 102,
    nextParticipantNumber: 1003,
  };

  (globalThis as unknown as Record<string, E2EStore>)[key] = seeded;
  return seeded;
}

type E2EQueryResult<T> = Promise<{ data: T; error: null } | { data: null; error: { message: string } }>;

class E2EQuery {
  private table: 'bills' | 'participants';
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private selectText: string | null = null;
  private insertValues: unknown = null;
  private updateValues: Record<string, unknown> | null = null;
  private filters: Array<{ column: string; value: unknown }> = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private expectSingle = false;

  constructor(table: 'bills' | 'participants') {
    this.table = table;
  }

  insert(values: unknown) {
    this.op = 'insert';
    this.insertValues = values;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.op = 'update';
    this.updateValues = values;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  select(text?: string) {
    this.selectText = text ?? null;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  single() {
    this.expectSingle = true;
    return this.execute();
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null) {
    return this.execute().catch(onrejected);
  }

  finally(onfinally?: (() => void) | null) {
    return this.execute().finally(onfinally ?? undefined);
  }

  private async execute(): E2EQueryResult<unknown> {
    const store = getE2EStore();

    try {
      if (this.table === 'bills') {
        if (this.op === 'insert') {
          const value = this.insertValues as Record<string, unknown>;
          const id = `00000000-0000-0000-0000-${String(store.nextBillNumber).padStart(12, '0')}`;
          store.nextBillNumber += 1;

          const row: E2EBill = {
            id,
            short_id: String(value.short_id ?? ''),
            organizer_id: String(value.organizer_id ?? ''),
            title: String(value.title ?? ''),
            total_amount: Number(value.total_amount ?? 0),
            description: (value.description ?? null) as string | null,
            due_date: String(value.due_date ?? ''),
            currency: String(value.currency ?? 'RM'),
            created_at: new Date().toISOString(),
          };

          store.bills.unshift(row);
          return { data: row, error: null };
        }

        if (this.op === 'delete') {
          const before = store.bills.length;
          store.bills = store.bills.filter((bill) => !this.matchesFilters(bill));
          const deleted = before !== store.bills.length;
          if (deleted) return { data: {}, error: null };
          return { data: null, error: { message: 'Not found' } };
        }

        let rows = store.bills.filter((bill) => this.matchesFilters(bill));

        if (this.orderBy) {
          const { column, ascending } = this.orderBy;
          rows = [...rows].sort((a, b) => {
            const av = (a as Record<string, unknown>)[column];
            const bv = (b as Record<string, unknown>)[column];
            if (av === bv) return 0;
            const avv = av ?? '';
            const bvv = bv ?? '';
            return (avv > bvv ? 1 : -1) * (ascending ? 1 : -1);
          });
        }

        const withParticipants =
          this.selectText?.includes('participants') ?? false;

        const mapped = withParticipants
          ? rows.map((bill) => ({
              ...bill,
              participants: store.participants.filter((p) => p.bill_id === bill.id),
            }))
          : rows;

        if (this.expectSingle) {
          if (mapped.length === 0) return { data: null, error: { message: 'Not found' } };
          return { data: mapped[0], error: null };
        }

        return { data: mapped, error: null };
      }

      if (this.table === 'participants') {
        if (this.op === 'insert') {
          const now = new Date().toISOString();
          const values = Array.isArray(this.insertValues) ? this.insertValues : [this.insertValues];
          const inserted: E2EParticipant[] = [];

          for (const raw of values) {
            const value = raw as Record<string, unknown>;
            const id = `00000000-0000-0000-0000-${String(store.nextParticipantNumber).padStart(
              12,
              '0',
            )}`;
            store.nextParticipantNumber += 1;

            const row: E2EParticipant = {
              id,
              bill_id: String(value.bill_id ?? ''),
              name: String(value.name ?? ''),
              share_amount: Number(value.share_amount ?? 0),
              status: 'unpaid',
              paid_at: null,
              created_at: now,
            };

            store.participants.push(row);
            inserted.push(row);
          }

          return { data: inserted, error: null };
        }

        if (this.op === 'update') {
          const rows = store.participants.filter((p) => this.matchesFilters(p));
          if (rows.length === 0) return { data: null, error: { message: 'Not found' } };

          const row = rows[0];
          Object.assign(row, this.updateValues ?? {});
          return { data: row, error: null };
        }

        if (this.op === 'delete') {
          const before = store.participants.length;
          store.participants = store.participants.filter((p) => !this.matchesFilters(p));
          const deleted = before !== store.participants.length;
          if (deleted) return { data: {}, error: null };
          return { data: null, error: { message: 'Not found' } };
        }

        let rows = store.participants.filter((p) => this.matchesFilters(p));

        if (this.orderBy) {
          const { column, ascending } = this.orderBy;
          rows = [...rows].sort((a, b) => {
            const av = (a as Record<string, unknown>)[column];
            const bv = (b as Record<string, unknown>)[column];
            if (av === bv) return 0;
            const avv = av ?? '';
            const bvv = bv ?? '';
            return (avv > bvv ? 1 : -1) * (ascending ? 1 : -1);
          });
        }

        if (this.expectSingle) {
          if (rows.length === 0) return { data: null, error: { message: 'Not found' } };
          return { data: rows[0], error: null };
        }

        return { data: rows, error: null };
      }

      return { data: null, error: { message: `Unsupported table: ${this.table}` } };
    } catch (err) {
      return {
        data: null,
        error: { message: err instanceof Error ? err.message : 'Unknown error' },
      };
    }
  }

  private matchesFilters(row: Record<string, unknown>) {
    for (const filter of this.filters) {
      if ((row as Record<string, unknown>)[filter.column] !== filter.value) return false;
    }
    return true;
  }
}

function createE2EClient() {
  const store = getE2EStore();
  return {
    auth: {
      getUser: async () => ({ data: { user: store.user }, error: null }),
    },
    from: (table: 'bills' | 'participants') => new E2EQuery(table),
  };
}

type ServerClient = SupabaseClient;

export async function createClient(): Promise<ServerClient> {
  if (
    process.env.NEXT_PUBLIC_E2E_STUB === '1' ||
    process.env.E2E_STUB === '1' ||
    process.env.NEXT_PUBLIC_OCR_STUB === '1'
  ) {
    return createE2EClient() as unknown as ServerClient;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
