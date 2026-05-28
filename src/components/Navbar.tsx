import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Wallet className="h-6 w-6 text-primary" />
          <span>SplitSavvy</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/create">
            <Button>Create Bill</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
