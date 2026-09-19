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

interface RazorpayConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RazorpayConfigModal({ open, onOpenChange, onSuccess }: RazorpayConfigModalProps) {
  const { accountId } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Form state
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    setLoading(true);
    try {
      const credentials = {
        keyId,
        keySecret,
        webhookSecret,
      };

      const { error } = await supabase.from('integrations').upsert({
        account_id: accountId,
        provider: 'razorpay',
        credentials,
        settings: {
          sync_payments: true,
        },
        is_active: true,
      }, { onConflict: 'account_id, provider' });

      if (error) throw error;

      toast.success('Razorpay connected successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save Razorpay integration:', err);
      toast.error('Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Razorpay</DialogTitle>
          <DialogDescription>
            Enter your Razorpay API credentials to send automated WhatsApp messages for payments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="keyId">Key ID</Label>
            <Input
              id="keyId"
              placeholder="rzp_live_..."
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="keySecret">Key Secret</Label>
            <Input
              id="keySecret"
              type="password"
              placeholder="..."
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="webhookSecret">Webhook Secret</Label>
            <Input
              id="webhookSecret"
              type="password"
              placeholder="..."
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Found in the Webhooks section of your Razorpay dashboard.
            </p>
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
