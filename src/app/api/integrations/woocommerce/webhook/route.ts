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
    const signature = req.headers.get('x-wc-webhook-signature');
    const topic = req.headers.get('x-wc-webhook-topic');
    const source = req.headers.get('x-wc-webhook-source');

    if (!signature || !topic || !source) {
      return NextResponse.json({ error: 'Missing required WooCommerce headers' }, { status: 400 });
    }

    // Lookup the integration by source to get the stored secret
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('account_id, credentials, settings')
      .eq('provider', 'woocommerce')
      .contains('credentials', { storeUrl: source })
      .single();

    if (error || !integration) {
      return NextResponse.json({ error: 'Integration not found for this store' }, { status: 404 });
    }

    const { webhookSecret } = integration.credentials as any;
    
    // Verify HMAC
    if (webhookSecret) {
      const hash = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody, 'utf8')
        .digest('base64');

      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    console.log(`[WooCommerce Webhook] Received ${topic} for store ${source}`, payload);
    
    // TODO: Send WhatsApp message based on integration.settings and payload

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing WooCommerce webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
