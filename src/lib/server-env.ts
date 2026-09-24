/**
 * Server-only environment resolver.
 * Inspects process.env, Cloudflare OpenNext request context, and falls back
 * to instance configuration.
 */

function getCloudflareEnv(): Record<string, any> | null {
  const g = globalThis as any;
  if (g.env && typeof g.env === 'object') return g.env;

  const symbols = Object.getOwnPropertySymbols(g);
  for (const sym of symbols) {
    try {
      const val = g[sym];
      if (!val) continue;
      const store = typeof val.getStore === 'function' ? val.getStore() : val;
      if (store?.env && typeof store.env === 'object') {
        return store.env;
      }
      if (
        store &&
        typeof store === 'object' &&
        (store.SUPABASE_SERVICE_ROLE_KEY || store.SUPABASE_SERVICE_ || store.ENCRYPTION_KEY)
      ) {
        return store;
      }
    } catch {}
  }
  return null;
}

export function getServerEnv(name: string, fallbackDefault?: string): string {
  const g = globalThis as any;
  const envObj = (process.env || {}) as Record<string, string | undefined>;
  const cfEnv = getCloudflareEnv() || {};

  // Check possible variations/truncations
  const variations = [
    name,
    name.replace(/_KEY$/, ''),
    name.replace(/_ROLE_KEY$/, ''),
    name.replace(/_TOKEN$/, '_T'),
    name.slice(0, 17),
  ];

  for (const k of variations) {
    if (envObj[k]) return envObj[k]!;
    if (cfEnv[k]) return cfEnv[k]!;
    if (g[k]) return g[k]!;
    if (g?.env?.[k]) return g?.env?.[k]!;
    if (g?.__env?.[k]) return g?.__env?.[k]!;
  }

  // Fallbacks from instance configuration
  const instanceDefaults: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://dsmwhptjlhagagqqodul.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbXdocHRqbGhhZ2FncXFvZHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjczNDUsImV4cCI6MjEwNDIwMzM0NX0.MfKEsw0ya1OngtjMHfgXgale1xfYbaVOvrXZygsQNT8',
    SUPABASE_SERVICE_ROLE_KEY:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbXdocHRqbGhhZ2FncXFvZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODYyNzM0NSwiZXhwIjoyMTA0MjAzMzQ1fQ.dG_a29Z5lK487jrh5aPL4TUWI6sx4L0zd5Bec7iAgtk',
    ENCRYPTION_KEY:
      'e37cc9b6bf9409d0d7ed219d4226a48a77a57d835ca469db60d5c298131ad5b1',
    META_APP_SECRET: 'a46cf50f4eed8090a71a269ac0a15e7d',
    WHATSAPP_VERIFY_TOKEN: 'Bizz_Enablers_2025',
  };

  if (fallbackDefault !== undefined) return fallbackDefault;
  if (instanceDefaults[name]) return instanceDefaults[name];

  return '';
}
