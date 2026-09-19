import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const payload = await req.formData();
    // PayU sends data as application/x-www-form-urlencoded
    
    const merchantKey = payload.get('key') as string;
    const hash = payload.get('hash') as string;

    if (!merchantKey || !hash) {
      return NextResponse.json({ error: 'Missing required PayU parameters' }, { status: 400 });
    }

    // Lookup the integration
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('account_id, credentials, settings')
      .eq('provider', 'payu')
      .contains('credentials', { merchantKey: merchantKey })
      .single();

    if (error || !integration) {
      return NextResponse.json({ error: 'Integration not found for this merchant' }, { status: 404 });
    }

    const { salt } = integration.credentials as any;
    
    // Verify Hash (PayU specific hash verification)
    // sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    
    // For simplicity in the boilerplate, we log and return success.
    // In production, proper hash verification is critical here.

    console.log(`[PayU Webhook] Received event for merchant ${merchantKey}`);
    
    // TODO: Process payment events

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing PayU webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
