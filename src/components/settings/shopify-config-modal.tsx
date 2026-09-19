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

interface ShopifyConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ShopifyConfigModal({ open, onOpenChange, onSuccess }: ShopifyConfigModalProps) {
  const { accountId } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Form state
  const [shopDomain, setShopDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [sharedSecret, setSharedSecret] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    // Clean up domain (e.g. remove https://)
    const cleanDomain = shopDomain
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .trim();

    if (!cleanDomain.endsWith('.myshopify.com')) {
      toast.error('Store domain must end with .myshopify.com');
      return;
    }

    setLoading(true);
    try {
      const credentials = {
        shop: cleanDomain,
        accessToken,
        sharedSecret,
      };

      const { error } = await supabase.from('integrations').upsert({
        account_id: accountId,
        provider: 'shopify',
        credentials,
        settings: {
          sync_orders: true,
          abandoned_cart: true,
        },
        is_active: true,
      }, { onConflict: 'account_id, provider' });

      if (error) throw error;

      toast.success('Shopify connected successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save Shopify integration:', err);
      toast.error('Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Shopify</DialogTitle>
          <DialogDescription>
            Enter your Shopify Custom App credentials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="shopDomain">Store Domain</Label>
            <Input
              id="shopDomain"
              placeholder="e.g. your-store.myshopify.com"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accessToken">Admin API Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="shpat_..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sharedSecret">Webhook Shared Secret</Label>
            <Input
              id="sharedSecret"
              type="password"
              placeholder="whsec_..."
              value={sharedSecret}
              onChange={(e) => setSharedSecret(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Found in the Webhooks section of your Shopify admin. Used to verify webhook signatures.
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
