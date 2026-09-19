'use client';

import { useTranslations } from "next-intl";
import { AdCampaign } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function AdCampaignsTable({ campaigns }: { campaigns: AdCampaign[] }) {
  const t = useTranslations("Ads.page");

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t("table.name")}</th>
              <th className="px-4 py-3 font-medium">{t("table.budget")}</th>
              <th className="px-4 py-3 font-medium">{t("table.status")}</th>
              <th className="px-4 py-3 font-medium">{t("table.createdAt")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{campaign.name}</td>
                <td className="px-4 py-3">
                  {campaign.budget_currency} {campaign.daily_budget}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={campaign.status === "ACTIVE" ? "default" : "secondary"}>
                    {t(`status.${campaign.status}` as any) || campaign.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
