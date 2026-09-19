import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAccount } from "@/lib/auth/account";
import Link from "next/link";
import { AdCampaignsTable } from "@/components/ads/ad-campaigns-table";

export default async function AdsPage() {
  const t = await getTranslations("Ads.page");
  const { accountId } = await getCurrentAccount();
  
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("ad_campaigns")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button render={<Link href="/ads/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          {t("newAd")}
        </Button>
      </div>

      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {campaigns && campaigns.length > 0 ? (
            <AdCampaignsTable campaigns={campaigns} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center mt-12">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{t("noAdsYet")}</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {t("createFirst")}
              </p>
              <Button render={<Link href="/ads/new" />}>
                <Plus className="mr-2 h-4 w-4" />
                {t("newAd")}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
