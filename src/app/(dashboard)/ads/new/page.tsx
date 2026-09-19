import { getTranslations } from "next-intl/server";
import { CreateAdWizard } from "@/components/ads/create-ad-wizard";
import { getCurrentAccount } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server";

export default async function NewAdPage() {
  const t = await getTranslations("Ads.wizard");
  const { accountId } = await getCurrentAccount();

  const supabase = await createClient();
  // Fetch if they have connected Meta Ads
  const { data: integration } = await supabase
    .from("integrations")
    .select("is_active")
    .eq("account_id", accountId)
    .eq("provider", "meta_ads")
    .single();

  const hasIntegration = integration?.is_active ?? false;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 h-full overflow-hidden flex flex-col">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>
      
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          {!hasIntegration ? (
            <div className="rounded-xl border border-dashed border-red-500/50 bg-red-500/5 p-6 text-center">
              <h3 className="text-lg font-semibold text-red-500">Missing Configuration</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You must connect your Meta Ads Manager in Settings before you can create an ad.
              </p>
            </div>
          ) : (
            <CreateAdWizard />
          )}
        </div>
      </main>
    </div>
  );
}
