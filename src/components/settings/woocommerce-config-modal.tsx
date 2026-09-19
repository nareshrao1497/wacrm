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

interface WooCommerceConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function WooCommerceConfigModal({ open, onOpenChange, onSuccess }: WooCommerceConfigModalProps) {
  const { accountId } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Form state
  const [storeUrl, setStoreUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    let cleanUrl = storeUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    setLoading(true);
    try {
      const credentials = {
        storeUrl: cleanUrl,
        consumerKey,
        consumerSecret,
      };

      const { error } = await supabase.from('integrations').upsert({
        account_id: accountId,
        provider: 'woocommerce',
        credentials,
        settings: {
          sync_orders: true,
        },
        is_active: true,
      }, { onConflict: 'account_id, provider' });

      if (error) throw error;

      toast.success('WooCommerce connected successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save WooCommerce integration:', err);
      toast.error('Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect WooCommerce</DialogTitle>
          <DialogDescription>
            Enter your WooCommerce REST API credentials. You can generate these in your WordPress Admin under WooCommerce &gt; Settings &gt; Advanced &gt; REST API.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="storeUrl">Store URL</Label>
            <Input
              id="storeUrl"
              placeholder="https://your-store.com"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="consumerKey">Consumer Key</Label>
            <Input
              id="consumerKey"
              type="text"
              placeholder="ck_..."
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="consumerSecret">Consumer Secret</Label>
            <Input
              id="consumerSecret"
              type="password"
              placeholder="cs_..."
              value={consumerSecret}
              onChange={(e) => setConsumerSecret(e.target.value)}
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
