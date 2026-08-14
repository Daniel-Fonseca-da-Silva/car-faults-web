import { AlertTriangle, ArrowRight, Flame } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { buildLookupHref } from "@/lib/lookup/build-lookup-href";
import type { FaultSeverity } from "@/types/vehicle";

interface FaultCardProps {
  make: string;
  model: string;
  year: number;
  engine: string;
  fuelType?: string;
  doors?: number;
  faultTitle: string;
  severity: FaultSeverity;
  reportCount: number;
}

const SEVERITY_BADGE_VARIANT: Record<
  FaultSeverity,
  "outline" | "secondary" | "destructive"
> = {
  low: "outline",
  medium: "secondary",
  high: "destructive",
  critical: "destructive",
};

export async function FaultCard({
  make,
  model,
  year,
  engine,
  fuelType,
  doors,
  faultTitle,
  severity,
  reportCount,
}: FaultCardProps) {
  const t = await getTranslations("faults");
  const SeverityIcon =
    severity === "high" || severity === "critical" ? Flame : AlertTriangle;
  // The vehicle page's canonical URL requires fuelType as a path segment -
  // without it there's no valid lookup to link to.
  const href = fuelType
    ? buildLookupHref({ brand: make, model, year, engine, fuelType, doors })
    : null;

  return (
    <Card className="flex h-full flex-col justify-between transition-colors hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {make} {model} · {year}
            </p>
            <h3 className="mt-1 text-base font-semibold text-foreground">
              {faultTitle}
            </h3>
          </div>
          <Badge
            variant={SEVERITY_BADGE_VARIANT[severity]}
            className="shrink-0 gap-1"
          >
            <SeverityIcon className="size-3" aria-hidden="true" />
            {t(`severity.${severity}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {t("reportsCount", { count: reportCount })}
        </span>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("viewReports")}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground/60">
            {t("viewReports")}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
