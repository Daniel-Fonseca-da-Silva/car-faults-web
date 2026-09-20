"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MBWAY_NUMBER, PIX_KEY, WISE_PAY_LINK } from "@/lib/support-constants";
import { formatEuroAmount } from "@/lib/utils";

const AMOUNT_TIERS = [
  { key: "coffee", value: 2 },
  { key: "snack", value: 5 },
  { key: "boost", value: 10 },
] as const;

interface CopyFieldProps {
  label: string;
  value: string;
  copyLabel: string;
  copiedLabel: string;
}

function CopyField({ label, value, copyLabel, copiedLabel }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <span className="font-mono text-base font-medium text-foreground">
          {value}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start sm:self-auto"
        aria-label={copied ? copiedLabel : copyLabel}
        onClick={handleCopy}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? copiedLabel : copyLabel}
      </Button>
    </div>
  );
}

interface SupportDonationCardProps {
  wiseQrSvg: string;
  pixQrSvg: string;
  pixBrCode: string;
}

export function SupportDonationCard({
  wiseQrSvg,
  pixQrSvg,
  pixBrCode,
}: SupportDonationCardProps) {
  const t = useTranslations("support");
  const locale = useLocale();
  const [pixCopied, setPixCopied] = useState(false);

  async function handleCopyPixCode() {
    await navigator.clipboard.writeText(pixBrCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  }

  return (
    <Card className="mt-12 p-6">
      <p className="font-heading text-xl font-semibold tracking-tight">
        {t("donationTitle")}
      </p>
      <p className="mt-2 leading-relaxed text-muted-foreground">
        {t("donationBody")}
      </p>

      <div className="mt-5">
        <CopyField
          label={t("numberLabel")}
          value={MBWAY_NUMBER}
          copyLabel={t("copyNumber")}
          copiedLabel={t("copied")}
        />
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="font-semibold text-foreground">
          {t("internationalTitle")}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {t("internationalBody")}
        </p>

        <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div
            className="size-32 shrink-0 overflow-hidden rounded-xl bg-white p-2"
            role="img"
            aria-label={t("wiseQrAlt")}
            dangerouslySetInnerHTML={{ __html: wiseQrSvg }}
          />
          <div className="flex-1 space-y-3">
            <Button
              render={
                <a href={WISE_PAY_LINK} target="_blank" rel="noopener noreferrer" />
              }
              nativeButton={false}
            >
              {t("wiseButtonLabel")}
              <ExternalLink aria-hidden="true" />
            </Button>
            <CopyField
              label={t("wiseLinkLabel")}
              value={WISE_PAY_LINK}
              copyLabel={t("copyLink")}
              copiedLabel={t("copied")}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="font-semibold text-foreground">{t("pixTitle")}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {t("pixBody")}
        </p>

        <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-start">
          <div
            className="size-32 shrink-0 overflow-hidden rounded-xl bg-white p-2"
            role="img"
            aria-label={t("pixQrAlt")}
            dangerouslySetInnerHTML={{ __html: pixQrSvg }}
          />
          <div className="flex-1 space-y-3">
            <Button
              type="button"
              aria-label={pixCopied ? t("copied") : t("copyPixCode")}
              onClick={handleCopyPixCode}
            >
              {pixCopied ? (
                <Check aria-hidden="true" />
              ) : (
                <Copy aria-hidden="true" />
              )}
              {pixCopied ? t("copied") : t("copyPixCode")}
            </Button>
            <CopyField
              label={t("pixKeyLabel")}
              value={PIX_KEY}
              copyLabel={t("copyPixKey")}
              copiedLabel={t("copied")}
            />
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {t("amountsTitle")}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {AMOUNT_TIERS.map(({ key, value }) => (
          <div
            key={key}
            className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-center"
          >
            <span className="text-2xl" aria-hidden="true">
              {t(`amounts.${key}.emoji`)}
            </span>
            <p className="mt-1 text-lg font-bold text-foreground">
              {formatEuroAmount(value, locale)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(`amounts.${key}.label`)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="font-semibold text-foreground">{t("thanksTitle")}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {t("thanksBody")}
        </p>
        <p className="mt-3 text-sm font-medium text-foreground">
          {t("signature")}
        </p>
      </div>
    </Card>
  );
}
