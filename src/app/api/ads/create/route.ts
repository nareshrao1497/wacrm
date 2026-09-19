import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAccount } from '@/lib/auth/account';

export async function POST(req: Request) {
  try {
    const { accountId, userId } = await getCurrentAccount();
    const supabase = await createClient();

    const { campaignName, dailyBudget, headline, primaryText, mediaUrl } = await req.json();

    if (!campaignName || !dailyBudget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify Meta Ads integration is connected
    const { data: integration } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('account_id', accountId)
      .eq('provider', 'meta_ads')
      .single();

    if (!integration) {
      return NextResponse.json({ error: 'Meta Ads integration not found' }, { status: 404 });
    }

    const { adAccountId, pageId, accessToken } = integration.credentials as any;

    if (!adAccountId || !accessToken) {
      return NextResponse.json({ error: 'Meta Ads credentials incomplete' }, { status: 400 });
    }

    // 2. META GRAPH API (Simulated for MVP)
    // In production, we would use `fetch` to call graph.facebook.com/v19.0/${adAccountId}/campaigns
    // - Objective: OUTCOME_TRAFFIC or MESSAGES
    // - Destination: WHATSAPP
    
    console.log(`[Meta Ads API] Creating campaign ${campaignName} for account ${adAccountId}`);
    console.log(`[Meta Ads API] Budget: ${dailyBudget}, Headline: ${headline}`);

    // Mock response from Meta
    const mockMetaCampaignId = `camp_${Math.floor(Math.random() * 100000000)}`;
    const mockMetaAdSetId = `adset_${Math.floor(Math.random() * 100000000)}`;
    const mockMetaAdId = `ad_${Math.floor(Math.random() * 100000000)}`;

    // 3. Save to database
    const { data: campaign, error } = await supabase
      .from('ad_campaigns')
      .insert({
        account_id: accountId,
        user_id: userId,
        name: campaignName,
        daily_budget: dailyBudget,
        meta_campaign_id: mockMetaCampaignId,
        meta_adset_id: mockMetaAdSetId,
        meta_ad_id: mockMetaAdId,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting ad campaign into DB', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error('Error creating Meta ad:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
