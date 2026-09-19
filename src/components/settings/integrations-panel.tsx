'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { SettingsPanelHead } from './settings-panel-head';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ShoppingCart, Table, Settings2, Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { ShopifyConfigModal } from './shopify-config-modal';
import { WooCommerceConfigModal } from './woocommerce-config-modal';
import { GoogleSheetsConfigModal } from './google-sheets-config-modal';
import { RazorpayConfigModal } from './razorpay-config-modal';
import { PayUConfigModal } from './payu-config-modal';
import { MetaAdsConfigModal } from './meta-ads-config-modal';
import { SiShopify, SiWoocommerce, SiGooglesheets, SiRazorpay, SiMeta } from 'react-icons/si';

function PayUIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12V4a1 1 0 0 1 1-1h6a4 4 0 0 1 0 8H5" />
      <path d="M15 15a4 4 0 0 1-8 0" />
      <path d="M19 12v9" />
      <path d="M15 21h4" />
    </svg>
  );
}

interface Integration {
  id: string;
  provider: 'shopify' | 'woocommerce' | 'google_sheets' | 'razorpay' | 'payu' | 'meta_ads';
  is_active: boolean;
}

export function IntegrationsPanel() {
  const { accountId } = useAuth();
  const supabase = createClient();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [shopifyModalOpen, setShopifyModalOpen] = useState(false);
  const [wooModalOpen, setWooModalOpen] = useState(false);
  const [sheetsModalOpen, setSheetsModalOpen] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [payuModalOpen, setPayuModalOpen] = useState(false);
  const [metaAdsModalOpen, setMetaAdsModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!accountId) return;
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('id, provider, is_active')
          .eq('account_id', accountId);
          
        if (error) throw error;
        setIntegrations(data || []);
      } catch (err) {
        console.error('Failed to load integrations', err);
        toast.error('Failed to load integrations');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [accountId, supabase]);

  const providers = [
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Sync orders and send automated WhatsApp messages for abandoned carts.',
      icon: SiShopify,
      color: 'text-[#95BF47] bg-[#95BF47]/10',
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      description: 'Connect your WooCommerce store to send order updates via WhatsApp.',
      icon: SiWoocommerce,
      color: 'text-[#96588A] bg-[#96588A]/10',
      iconClassName: 'size-7', // Made bigger per request
    },
    {
      id: 'google_sheets',
      name: 'Google Sheets',
      description: 'Log new contacts and incoming messages directly to a spreadsheet.',
      icon: SiGooglesheets,
      color: 'text-[#34A853] bg-[#34A853]/10',
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Send automated WhatsApp payment confirmations and reminders.',
      icon: SiRazorpay,
      color: 'text-[#02042B] bg-[#02042B]/10',
    },
    {
      id: 'payu',
      name: 'PayUMoney',
      description: 'Connect PayUMoney to send payment receipts via WhatsApp.',
      icon: PayUIcon,
      color: 'text-[#A4D05E] bg-[#A4D05E]/10',
    },
    {
      id: 'meta_ads',
      name: 'Meta Ads Manager',
      description: 'Create and track Facebook & Instagram Click-to-WhatsApp ads natively.',
      icon: SiMeta,
      color: 'text-[#0668E1] bg-[#0668E1]/10',
    },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="animate-in fade-in-50 space-y-6 duration-200">
      <SettingsPanelHead
        title="Integrations"
        description="Connect Wabotix to your favorite tools to automate your workflows."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => {
          const active = integrations.find(i => i.provider === p.id && i.is_active);
          
          return (
            <Card key={p.id} className="relative overflow-hidden flex flex-col">
              <CardHeader className="pb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${p.color}`}>
                  <p.icon className={('iconClassName' in p) ? p.iconClassName : "size-5"} />
                </div>
                <CardTitle className="text-lg flex items-center justify-between">
                  {p.name}
                  {active && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  {p.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <Button 
                  variant={active ? "secondary" : "default"} 
                  className="w-full"
                  onClick={() => {
                    if (p.id === 'shopify') {
                      setShopifyModalOpen(true);
                    } else if (p.id === 'woocommerce') {
                      setWooModalOpen(true);
                    } else if (p.id === 'google_sheets') {
                      setSheetsModalOpen(true);
                    } else if (p.id === 'razorpay') {
                      setRazorpayModalOpen(true);
                    } else if (p.id === 'payu') {
                      setPayuModalOpen(true);
                    } else if (p.id === 'meta_ads') {
                      setMetaAdsModalOpen(true);
                    }
                  }}
                >
                  {active ? (
                    <>
                      <Settings2 className="size-4 mr-2" />
                      Configure
                    </>
                  ) : (
                    <>
                      <Plus className="size-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ShopifyConfigModal 
        open={shopifyModalOpen} 
        onOpenChange={setShopifyModalOpen}
        onSuccess={() => {
          if (!accountId) return;
          supabase
            .from('integrations')
            .select('id, provider, is_active')
            .eq('account_id', accountId)
            .then(({ data }) => setIntegrations(data || []));
        }}
      />
      
      <WooCommerceConfigModal 
        open={wooModalOpen} 
        onOpenChange={setWooModalOpen}
        onSuccess={() => {
          if (!accountId) return;
          supabase
            .from('integrations')
            .select('id, provider, is_active')
            .eq('account_id', accountId)
            .then(({ data }) => setIntegrations(data || []));
        }}
      />

      <GoogleSheetsConfigModal 
        open={sheetsModalOpen} 
        onOpenChange={setSheetsModalOpen}
        onSuccess={() => {
          if (!accountId) return;
          supabase
            .from('integrations')
            .select('id, provider, is_active')
            .eq('account_id', accountId)
            .then(({ data }) => setIntegrations(data || []));
        }}
      />

      <RazorpayConfigModal 
        open={razorpayModalOpen} 
        onOpenChange={setRazorpayModalOpen}
        onSuccess={() => {
          if (!accountId) return;
          supabase
            .from('integrations')
            .select('id, provider, is_active')
            .eq('account_id', accountId)
            .then(({ data }) => setIntegrations(data || []));
        }}
      />

      <PayUConfigModal 
        open={payuModalOpen} 
        onOpenChange={setPayuModalOpen}
        onSuccess={() => {
          if (!accountId) return;
          supabase
            .from('integrations')
            .select('id, provider, is_active')
            .eq('account_id', accountId)
            .then(({ data }) => setIntegrations(data || []));
        }}
      />

      <MetaAdsConfigModal 
        open={metaAdsModalOpen} 
        onOpenChange={setMetaAdsModalOpen}
        onSuccess={() => {
          if (!accountId) return;
          supabase
            .from('integrations')
            .select('id, provider, is_active')
            .eq('account_id', accountId)
            .then(({ data }) => setIntegrations(data || []));
        }}
      />
    </section>
  );
}
