import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function ParticipantStatusList({
  participants,
  currency,
}: {
  participants: Array<{
    id: string;
    name: string;
    shareAmount: number;
    status: 'paid' | 'unpaid';
  }>;
  currency: string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Participants</h3>
      <div className="grid gap-3">
        {participants.map((p) => (
          <Card key={p.id} className={p.status === 'paid' ? 'bg-primary/5' : ''}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {p.status === 'paid' ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(p.shareAmount, currency)}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  p.status === 'paid'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {p.status === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
