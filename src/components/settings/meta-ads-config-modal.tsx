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

interface MetaAdsConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MetaAdsConfigModal({ open, onOpenChange, onSuccess }: MetaAdsConfigModalProps) {
  const { accountId } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // Form state
  const [adAccountId, setAdAccountId] = useState('');
  const [pageId, setPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    setLoading(true);
    try {
      const credentials = {
        adAccountId,
        pageId,
        accessToken,
      };

      const { error } = await supabase.from('integrations').upsert({
        account_id: accountId,
        provider: 'meta_ads',
        credentials,
        settings: {},
        is_active: true,
      }, { onConflict: 'account_id, provider' });

      if (error) throw error;

      toast.success('Meta Ads connected successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save Meta Ads integration:', err);
      toast.error('Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Meta Ads Manager</DialogTitle>
          <DialogDescription>
            Enter your Meta Ad Account ID and System User Access Token to publish ads directly from the CRM.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="adAccountId">Ad Account ID</Label>
            <Input
              id="adAccountId"
              placeholder="act_123456789"
              value={adAccountId}
              onChange={(e) => setAdAccountId(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pageId">Facebook Page ID</Label>
            <Input
              id="pageId"
              placeholder="987654321"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="EAAB..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Generate a System User token in Facebook Business Manager with "ads_management" permissions.
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
