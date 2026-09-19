'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface PayUConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PayUConfigModal({ open, onOpenChange, onSuccess }: PayUConfigModalProps) {
  const { accountId } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Form state
  const [merchantKey, setMerchantKey] = useState('');
  const [merchantSalt, setMerchantSalt] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    setLoading(true);
    try {
      const credentials = {
        merchantKey,
        merchantSalt,
      };

      const { error } = await supabase.from('integrations').upsert({
        account_id: accountId,
        provider: 'payu',
        credentials,
        settings: {
          sync_payments: true,
        },
        is_active: true,
      }, { onConflict: 'account_id, provider' });

      if (error) throw error;

      toast.success('PayU connected successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save PayU integration:', err);
      toast.error('Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect PayUMoney</DialogTitle>
          <DialogDescription>
            Enter your PayUMoney credentials to send automated WhatsApp messages for payments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="merchantKey">Merchant Key</Label>
            <Input
              id="merchantKey"
              placeholder="..."
              value={merchantKey}
              onChange={(e) => setMerchantKey(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="merchantSalt">Merchant Salt</Label>
            <Input
              id="merchantSalt"
              type="password"
              placeholder="..."
              value={merchantSalt}
              onChange={(e) => setMerchantSalt(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin mr-2" />}
              Connect
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
