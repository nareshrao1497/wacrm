import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Google Sheets apps script usually sends a secret token or specific ID 
    // to authenticate the request
    const token = req.headers.get('x-sheets-token') || payload.token;

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Lookup the integration by token
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('account_id, credentials, settings')
      .eq('provider', 'google-sheets')
      .contains('credentials', { webhookToken: token })
      .single();

    if (error || !integration) {
      return NextResponse.json({ error: 'Integration not found for this token' }, { status: 404 });
    }

    console.log(`[Google Sheets Webhook] Received event`, payload);
    
    // TODO: Process row additions/updates

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Google Sheets webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
