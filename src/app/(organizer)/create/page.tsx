import { BillCreateForm } from '@/components/bill/BillCreateForm';

export default function CreateBillPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create a New Bill</h1>
        <p className="text-muted-foreground">
          Fill in the details below to split a bill with your friends.
        </p>
      </div>
      <BillCreateForm />
    </div>
  );
}
