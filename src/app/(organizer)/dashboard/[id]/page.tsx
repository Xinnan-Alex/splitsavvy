import { getBillDetails } from '@/app/actions/bill-actions';
import { DashboardSummary } from '@/components/bill/DashboardSummary';
import { ParticipantStatusList } from '@/components/bill/ParticipantStatusList';
import { DeleteBillButton } from '@/components/bill/DeleteBillButton';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2 } from 'lucide-react';

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bill = await getBillDetails(id);

  if (!bill) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">{bill.title}</h1>
          <p className="text-muted-foreground">{bill.description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/create/success/${bill.shortId}`}>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" /> Share Link
            </Button>
          </Link>
          <DeleteBillButton billId={bill.id} />
        </div>
      </div>

      <DashboardSummary
        totalAmount={bill.totalAmount}
        paidAmount={bill.paidAmount}
        totalParticipants={bill.participantCount}
        paidParticipants={bill.paidCount}
      />

      <ParticipantStatusList participants={bill.participants} currency={bill.currency} />
    </div>
  );
}
