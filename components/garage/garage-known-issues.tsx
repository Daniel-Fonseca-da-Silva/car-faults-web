import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/vehicle/severity-badge";
import { Link } from "@/i18n/navigation";
import { buildLookupHref } from "@/lib/lookup/build-lookup-href";
import type { UserVehicleDetail } from "@/types/user-vehicle";

interface GarageKnownIssuesProps {
  vehicle: UserVehicleDetail;
}

export async function GarageKnownIssues({ vehicle }: GarageKnownIssuesProps) {
  const t = await getTranslations("garage.issues");
  const tFaults = await getTranslations("faults");

  const href = vehicle.fuelType
    ? buildLookupHref({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        engine: vehicle.engine,
        fuelType: vehicle.fuelType,
        doors: vehicle.doors,
      })
    : null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">
          {t("title")}
        </p>
        {href && (
          <Link
            href={href}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("viewDetails")}
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </div>

      {vehicle.knownIssues.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {vehicle.knownIssues.map((issue) => (
            <li
              key={issue.id}
              className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  {issue.title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {issue.description}
                </p>
              </div>
              <SeverityBadge
                severity={issue.severity}
                label={tFaults(`severity.${issue.severity}`)}
                className="shrink-0 self-start"
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
