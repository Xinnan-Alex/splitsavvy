import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBill } from '@/app/actions/bill-actions';

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'bill-id', short_id: 'short-id' }, error: null })),
        })),
      })),
    })),
  })),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: () => 'short-id',
}));

describe('createBill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a bill and participants successfully', async () => {
    const input = {
      title: 'Test Bill',
      totalAmount: 100,
      dueDate: '2026-06-01',
      currency: 'RM',
      participants: [
        { name: 'Alice', shareAmount: 50 },
        { name: 'Bob', shareAmount: 50 },
      ],
    };

    const result = await createBill(input);

    expect(result.success).toBe(true);
    expect(result.billId).toBe('bill-id');
    expect(result.shortId).toBe('short-id');
  });

  it('should return error if unauthorized', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const mockedCreateClient = createClient as unknown as ReturnType<typeof vi.fn>;
    mockedCreateClient.mockImplementationOnce(() => ({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      },
    }));

    const input = {
      title: 'Test Bill',
      totalAmount: 100,
      dueDate: '2026-06-01',
      currency: 'RM',
      participants: [],
    };

    const result = await createBill(input);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
  });
});
