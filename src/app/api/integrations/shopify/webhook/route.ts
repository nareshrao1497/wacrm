import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Use service role for webhooks since they are unauthenticated by the dashboard user
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('X-Shopify-Hmac-Sha256');
    const topic = req.headers.get('X-Shopify-Topic');
    const shopDomain = req.headers.get('X-Shopify-Shop-Domain');

    if (!hmacHeader || !shopDomain) {
      return NextResponse.json({ error: 'Missing required Shopify headers' }, { status: 400 });
    }

    // Lookup the integration by shopDomain to get the stored secret
    // Note: This assumes credentials stores { "shop": "example.myshopify.com", "sharedSecret": "..." }
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('account_id, credentials, settings')
      .eq('provider', 'shopify')
      .contains('credentials', { shop: shopDomain })
      .single();

    if (error || !integration) {
      return NextResponse.json({ error: 'Integration not found for this shop' }, { status: 404 });
    }

    const { sharedSecret } = integration.credentials as any;
    
    // Verify HMAC
    const hash = crypto
      .createHmac('sha256', sharedSecret)
      .update(rawBody, 'utf8')
      .digest('base64');

    if (hash !== hmacHeader) {
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Process the webhook based on topic
    // e.g. orders/create, carts/update
    console.log(`[Shopify Webhook] Received ${topic} for shop ${shopDomain}`, payload);
    
    // TODO: Send WhatsApp message based on integration.settings and payload

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Shopify webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
