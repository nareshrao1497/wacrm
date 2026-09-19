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
import { Loader2, Copy, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface GoogleSheetsConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GoogleSheetsConfigModal({ open, onOpenChange, onSuccess }: GoogleSheetsConfigModalProps) {
  const { accountId } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [spreadsheetId, setSpreadsheetId] = useState('');
  
  const serviceAccountEmail = 'wabotix-integration@wabotix-system.iam.gserviceaccount.com'; // Example placeholder email

  const handleCopy = () => {
    navigator.clipboard.writeText(serviceAccountEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Email copied to clipboard');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    // Extract ID if user pasted full URL
    let cleanId = spreadsheetId.trim();
    const match = cleanId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      cleanId = match[1];
    }

    setLoading(true);
    try {
      const credentials = {}; // No tokens needed, we use our own service account
      
      const { error } = await supabase.from('integrations').upsert({
        account_id: accountId,
        provider: 'google_sheets',
        credentials,
        settings: {
          spreadsheetId: cleanId,
          sync_contacts: true,
          sync_messages: false,
        },
        is_active: true,
      }, { onConflict: 'account_id, provider' });

      if (error) throw error;

      toast.success('Google Sheets connected successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save Google Sheets integration:', err);
      toast.error('Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Google Sheets</DialogTitle>
          <DialogDescription>
            Connect a spreadsheet to automatically log new contacts or incoming messages.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Step 1: Share your sheet</h4>
            <p className="text-muted-foreground">
              Share your Google Sheet with our system account, giving it <strong>Editor</strong> access:
            </p>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded-md text-xs break-all">
                {serviceAccountEmail}
              </code>
              <Button size="icon" variant="outline" onClick={handleCopy} type="button">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 mt-6">
            <h4 className="font-semibold text-foreground">Step 2: Enter Spreadsheet ID or URL</h4>
            <form onSubmit={handleSave} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="spreadsheetId" className="sr-only">Spreadsheet ID</Label>
                <Input
                  id="spreadsheetId"
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0X..."
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
