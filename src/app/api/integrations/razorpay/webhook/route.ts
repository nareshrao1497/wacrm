import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Razorpay signature header' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const accountId = payload?.account_id; // Razorpay sends the merchant account ID in the payload

    if (!accountId) {
      return NextResponse.json({ error: 'Missing account_id in payload' }, { status: 400 });
    }

    // Lookup the integration
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('account_id, credentials, settings')
      .eq('provider', 'razorpay')
      .contains('credentials', { merchantId: accountId })
      .single();

    if (error || !integration) {
      return NextResponse.json({ error: 'Integration not found for this merchant' }, { status: 404 });
    }

    const { webhookSecret } = integration.credentials as any;
    
    // Verify HMAC
    if (webhookSecret) {
      const hash = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody, 'utf8')
        .digest('hex');

      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
      }
    }

    console.log(`[Razorpay Webhook] Received event for merchant ${accountId}`, payload);
    
    // TODO: Process payment events

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
