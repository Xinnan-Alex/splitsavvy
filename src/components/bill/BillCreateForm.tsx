'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBill } from '@/app/actions/bill-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { applyScanToDraft } from '@/lib/receipt-scan/applyScanToDraft';
import { scanReceiptImage } from '@/lib/receipt-scan/ocr';
import type { ReceiptScanStatus } from '@/lib/receipt-scan/types';
import { Plus, Trash2, Loader2, Camera, RotateCcw, XCircle } from 'lucide-react';

export function BillCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [participants, setParticipants] = useState([{ name: '', shareAmount: '' }]);
  const [scanStatus, setScanStatus] = useState<ReceiptScanStatus>('idle');
  const [scanError, setScanError] = useState('');
  const [scanNotes, setScanNotes] = useState<string[]>([]);
  const [appliedFields, setAppliedFields] = useState<Array<'title' | 'totalAmount'>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanModeRef = useRef<'scan' | 'retake'>('scan');
  const scanDisabled = scanStatus === 'recognizing' || scanStatus === 'capturing';

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

  const resetScanMeta = () => {
    setScanStatus('idle');
    setScanError('');
    setScanNotes([]);
    setAppliedFields([]);
  };

  const startScanCapture = (mode: 'scan' | 'retake') => {
    if (scanStatus === 'recognizing') return;

    scanModeRef.current = mode;
    setScanError('');
    setScanNotes([]);
    setScanStatus('capturing');

    const input = fileInputRef.current;
    if (!input) {
      setScanStatus('idle');
      return;
    }

    input.value = '';
    input.click();

    const onFocus = () => {
      window.removeEventListener('focus', onFocus);
      setTimeout(() => {
        const hasFile = Boolean(input.files && input.files.length > 0);
        if (!hasFile) setScanStatus('idle');
      }, 200);
    };
    window.addEventListener('focus', onFocus);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) {
      setScanStatus('idle');
      return;
    }

    setScanStatus('recognizing');
    setScanError('');
    setScanNotes([]);

    try {
      const scan = await scanReceiptImage(file);

      const mode = scanModeRef.current;
      const currentTitle = mode === 'retake' && appliedFields.includes('title') ? '' : title;
      const currentTotalAmount =
        mode === 'retake' && appliedFields.includes('totalAmount') ? '' : totalAmount;

      const applied = applyScanToDraft({
        currentTitle,
        currentTotalAmount,
        scan,
      });

      setScanNotes(scan.notes ?? []);

      if (applied.appliedFields.length === 0) {
        setAppliedFields([]);
        setScanStatus('failed');
        setScanError(
          "Couldn't prefill the form from that photo. You can retake or continue with manual entry.",
        );
        return;
      }

      if (applied.appliedFields.includes('title')) setTitle(applied.nextTitle);
      if (applied.appliedFields.includes('totalAmount')) setTotalAmount(applied.nextTotalAmount);
      setAppliedFields(applied.appliedFields);
      setScanStatus('prefilled');
    } catch (err) {
      setAppliedFields([]);
      setScanStatus('failed');
      setScanError(
        err instanceof Error
          ? err.message
          : "Couldn't prefill the form from that photo. You can retake or continue with manual entry.",
      );
    }
  };

  const clearPrefill = () => {
    setTitle('');
    setTotalAmount('');
    resetScanMeta();
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
    } catch {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bill Details</CardTitle>
          <div className="flex items-center gap-2">
            {(scanStatus === 'prefilled' || scanStatus === 'failed') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => startScanCapture('retake')}
                disabled={scanDisabled}
              >
                <RotateCcw className="h-4 w-4 mr-1" /> Retake
              </Button>
            )}
            {(scanStatus === 'prefilled' || scanStatus === 'failed') && (
              <Button type="button" variant="outline" size="sm" onClick={clearPrefill}>
                <XCircle className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startScanCapture('scan')}
              disabled={scanDisabled}
            >
              {scanStatus === 'recognizing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Scanning...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-1" /> Scan receipt
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              data-testid="receipt-file-input"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelected}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {scanStatus === 'failed' && (
            <div className="text-sm text-muted-foreground">{scanError}</div>
          )}
          {scanNotes.length > 0 && (
            <div className="text-xs text-muted-foreground">{scanNotes.join(' ')}</div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            {appliedFields.includes('title') && (
              <div className="text-xs text-muted-foreground">Suggested from scan</div>
            )}
            <Input
              required
              placeholder="Dinner at Mama's"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (appliedFields.includes('title')) {
                  setAppliedFields((prev) => prev.filter((field) => field !== 'title'));
                }
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Amount (RM)</label>
              {appliedFields.includes('totalAmount') && (
                <div className="text-xs text-muted-foreground">Suggested from scan</div>
              )}
              <Input
                required
                type="number"
                step="0.01"
                placeholder="100.00"
                value={totalAmount}
                onChange={(e) => {
                  setTotalAmount(e.target.value);
                  if (appliedFields.includes('totalAmount')) {
                    setAppliedFields((prev) => prev.filter((field) => field !== 'totalAmount'));
                  }
                }}
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
