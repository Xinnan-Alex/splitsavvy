import { describe, it, expect, vi, beforeEach } from 'vitest';
import { confirmPayment } from '@/app/actions/bill-actions';

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInAnonymously: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { paid_at: '2026-05-28T12:00:00Z' }, error: null })),
          })),
        })),
      })),
    })),
  })),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('confirmPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update participant status to paid', async () => {
    const input = {
      participantId: 'part-1',
      billShortId: 'short-id',
    };

    const result = await confirmPayment(input);

    expect(result.success).toBe(true);
    expect(result.paidAt).toBe('2026-05-28T12:00:00Z');
  });

  it('should return error if update fails', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const mockedCreateClient = createClient as unknown as ReturnType<typeof vi.fn>;
    mockedCreateClient.mockImplementationOnce(() => ({
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        signInAnonymously: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      },
      from: vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Update failed' } })),
            })),
          })),
        })),
      })),
    }));

    const input = {
      participantId: 'part-1',
      billShortId: 'short-id',
    };

    const result = await confirmPayment(input);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Update failed');
  });
});
