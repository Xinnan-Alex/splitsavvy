'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBill } from '@/app/actions/bill-actions';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

export function DeleteBillButton({ billId }: { billId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    
    setLoading(true);
    try {
      const res = await deleteBill(billId);
      if (res.success) {
        router.push('/dashboard');
      } else {
        alert(res.error || 'Failed to delete bill');
      }
    } catch {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" /> Delete Bill
        </>
      )}
    </Button>
  );
}
