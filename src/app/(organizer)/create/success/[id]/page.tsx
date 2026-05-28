'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy, Share2, ArrowRight } from 'lucide-react';

export default function BillSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: shortId } = use(params);
  const [copied, setCopied] = useState(false);
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/bill/${shortId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const text = `Hey! Here's the bill for our dinner. Please confirm your payment here: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-12 space-y-8 text-center">
      <div className="space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold">Bill Created!</h1>
        <p className="text-muted-foreground">
          Your bill is ready to be shared with participants.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shareable Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 bg-muted p-2 rounded text-sm truncate font-mono">
              {shareUrl}
            </div>
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={shareViaWhatsApp} className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white">
              <Share2 className="h-4 w-4 mr-2" /> Share via WhatsApp
            </Button>
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full">
                Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
