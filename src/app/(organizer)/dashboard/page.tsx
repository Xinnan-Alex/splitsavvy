import Link from 'next/link';
import { getOrganizerBills } from '@/app/actions/bill-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default async function DashboardPage() {
  const bills = await getOrganizerBills();

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Bills</h1>
          <p className="text-muted-foreground">Manage and track your collections.</p>
        </div>
        <Link href="/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Bill
          </Button>
        </Link>
      </div>

      {bills.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">You haven't created any bills yet.</p>
            <Link href="/create">
              <Button variant="outline">Create your first bill</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill) => {
            const progress = (bill.paidAmount / bill.totalAmount) * 100;
            return (
              <Link key={bill.id} href={`/dashboard/${bill.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{bill.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Due on {new Date(bill.due_date).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{formatCurrency(bill.paidAmount, bill.currency)}</span>
                      <span>{formatCurrency(bill.totalAmount, bill.currency)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>
                        {bill.paidCount} / {bill.participantCount} paid
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
