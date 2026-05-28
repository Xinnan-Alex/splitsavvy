'use client';

import { useState } from 'react';
import { BillDetails } from '@/types';
import { confirmPayment } from '@/app/actions/bill-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function ParticipantBillView({ bill }: { bill: BillDetails }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleConfirm = async (participantId: string) => {
    setLoadingId(participantId);
    try {
      const res = await confirmPayment({
        participantId,
        billShortId: bill.shortId,
      });
      if (!res.success) {
        alert(res.error || 'Failed to confirm payment');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoadingId(null);
    }
  };

  const progress = (bill.paidAmount / bill.totalAmount) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{bill.title}</h1>
        <p className="text-muted-foreground">{bill.description}</p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardDescription>Total to collect</CardDescription>
          <CardTitle className="text-4xl">{formatCurrency(bill.totalAmount, bill.currency)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Progress</span>
            <span>{formatCurrency(bill.paidAmount, bill.currency)} collected</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {bill.paidCount} of {bill.participantCount} participants paid
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Participants</h2>
        <div className="grid gap-4">
          {bill.participants.map((p) => (
            <Card key={p.id} className={p.status === 'paid' ? 'bg-primary/5 border-primary/20' : ''}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {p.status === 'paid' ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(p.shareAmount, bill.currency)}
                    </p>
                  </div>
                </div>
                {p.status === 'unpaid' && (
                  <Button
                    size="sm"
                    onClick={() => handleConfirm(p.id)}
                    disabled={loadingId === p.id}
                  >
                    {loadingId === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Confirm Payment'
                    )}
                  </Button>
                )}
                {p.status === 'paid' && (
                  <span className="text-sm font-medium text-primary">Paid</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
