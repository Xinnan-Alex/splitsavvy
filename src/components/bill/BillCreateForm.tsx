'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBill } from '@/app/actions/bill-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export function BillCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [participants, setParticipants] = useState([{ name: '', shareAmount: '' }]);

  const addParticipant = () => {
    setParticipants([...participants, { name: '', shareAmount: '' }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: 'name' | 'shareAmount', value: string) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      title,
      totalAmount: parseFloat(totalAmount),
      dueDate,
      currency: 'RM', // Default for now
      participants: participants.map((p) => ({
        name: p.name,
        shareAmount: parseFloat(p.shareAmount),
      })),
    };

    try {
      const res = await createBill(data);
      if (res.success && res.shortId) {
        router.push(`/create/success/${res.shortId}`);
      } else {
        alert(res.error || 'Failed to create bill');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bill Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              required
              placeholder="Dinner at Mama's"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Amount (RM)</label>
              <Input
                required
                type="number"
                step="0.01"
                placeholder="100.00"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                required
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Participants</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {participants.map((p, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs text-muted-foreground">Name</label>
                <Input
                  required
                  placeholder="John Doe"
                  value={p.name}
                  onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                />
              </div>
              <div className="w-32 space-y-2">
                <label className="text-xs text-muted-foreground">Share (RM)</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  value={p.shareAmount}
                  onChange={(e) => updateParticipant(index, 'shareAmount', e.target.value)}
                />
              </div>
              {participants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeParticipant(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
          </>
        ) : (
          'Create Bill'
        )}
      </Button>
    </form>
  );
}
