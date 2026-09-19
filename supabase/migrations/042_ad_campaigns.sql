-- 042_ad_campaigns.sql
-- Tracking created WhatsApp Ads

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  meta_campaign_id text,
  meta_adset_id text,
  meta_ad_id text,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  daily_budget numeric,
  budget_currency text DEFAULT 'USD',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ad_campaigns for their account"
  ON public.ad_campaigns
  FOR SELECT
  USING (account_id IN (
    SELECT account_id FROM public.profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert ad_campaigns for their account"
  ON public.ad_campaigns
  FOR INSERT
  WITH CHECK (account_id IN (
    SELECT account_id FROM public.profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update ad_campaigns for their account"
  ON public.ad_campaigns
  FOR UPDATE
  USING (account_id IN (
    SELECT account_id FROM public.profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete ad_campaigns for their account"
  ON public.ad_campaigns
  FOR DELETE
  USING (account_id IN (
    SELECT account_id FROM public.profiles WHERE user_id = auth.uid()
  ));
