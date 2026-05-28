import { getBillDetails } from '@/app/actions/bill-actions';
import { ParticipantBillView } from '@/components/bill/ParticipantBillView';
import { notFound } from 'next/navigation';

export default async function PublicBillPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  const bill = await getBillDetails(shortId);

  if (!bill) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <ParticipantBillView bill={bill} />
    </div>
  );
}
