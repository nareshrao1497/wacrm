'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UploadCloud, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export function CreateAdWizard() {
  const t = useTranslations("Ads.wizard");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [campaignName, setCampaignName] = useState("");
  const [dailyBudget, setDailyBudget] = useState("");
  const [headline, setHeadline] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [mediaUrl, setMediaUrl] = useState(""); // For MVP, we will accept a URL or just assume a dummy url if empty

  const handleNext = () => setStep((s) => Math.min(4, s + 1));
  const handlePrev = () => setStep((s) => Math.max(1, s - 1));

  const handlePublish = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName,
          dailyBudget: parseFloat(dailyBudget),
          headline,
          primaryText,
          mediaUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish ad");
      }

      toast.success("Ad published successfully!");
      router.push("/ads");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  step >= i
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted text-muted-foreground"
                }`}
              >
                {i}
              </div>
              {i < 4 && (
                <div
                  className={`h-1 w-12 sm:w-24 lg:w-32 mx-2 rounded-full ${
                    step > i ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50">
              <h3 className="text-lg font-medium">{t("steps.details")}</h3>
              <div className="space-y-2">
                <Label>{t("details.campaignName")}</Label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder={t("details.campaignNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("details.dailyBudget")}</Label>
                <Input
                  type="number"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                  placeholder={t("details.dailyBudgetPlaceholder")}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50">
              <h3 className="text-lg font-medium">{t("steps.creative")}</h3>
              <div className="space-y-2">
                <Label>{t("creative.headline")}</Label>
                <Input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder={t("creative.headlinePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("creative.primaryText")}</Label>
                <Textarea
                  value={primaryText}
                  onChange={(e) => setPrimaryText(e.target.value)}
                  placeholder={t("creative.primaryTextPlaceholder")}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("creative.image")}</Label>
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
                  <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Media uploading MVP - please provide an image URL.
                  </p>
                  <Input 
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in-50">
              <h3 className="text-lg font-medium">{t("steps.audience")}</h3>
              <div className="rounded-lg border p-4 bg-muted/20">
                <h4 className="font-medium mb-1">{t("audience.broad")}</h4>
                <p className="text-sm text-muted-foreground">{t("audience.broadDesc")}</p>
                <p className="text-xs text-primary mt-2">
                  (Advanced targeting will be available in a future update)
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in-50">
              <h3 className="text-lg font-medium">{t("publish.summary")}</h3>
              <div className="space-y-2 text-sm border rounded-lg p-4 bg-muted/10">
                <div className="grid grid-cols-3 py-1 border-b">
                  <span className="text-muted-foreground">Campaign:</span>
                  <span className="col-span-2 font-medium">{campaignName || "N/A"}</span>
                </div>
                <div className="grid grid-cols-3 py-1 border-b">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="col-span-2 font-medium">${dailyBudget || "0"} / day</span>
                </div>
                <div className="grid grid-cols-3 py-1 border-b">
                  <span className="text-muted-foreground">Headline:</span>
                  <span className="col-span-2 font-medium">{headline || "N/A"}</span>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <span className="text-muted-foreground">Text:</span>
                  <span className="col-span-2 font-medium truncate">{primaryText || "N/A"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1 || loading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {step < 4 ? (
            <Button onClick={handleNext} disabled={!campaignName && step === 1}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("publish.button")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
