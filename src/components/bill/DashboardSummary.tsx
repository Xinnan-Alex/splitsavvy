import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Users, CheckCircle2, Clock } from 'lucide-react';

export function DashboardSummary({
  totalAmount,
  paidAmount,
  totalParticipants,
  paidParticipants,
}: {
  totalAmount: number;
  paidAmount: number;
  totalParticipants: number;
  paidParticipants: number;
}) {
  const stats = [
    {
      title: 'Total to Collect',
      value: formatCurrency(totalAmount),
      icon: DollarSign,
      color: 'text-blue-500',
    },
    {
      title: 'Amount Collected',
      value: formatCurrency(paidAmount),
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(totalAmount - paidAmount),
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'Participants Paid',
      value: `${paidParticipants} / ${totalParticipants}`,
      icon: Users,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
