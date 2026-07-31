import { ChevronRight, Flame, Star, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { buildLookupHref } from "@/lib/lookup/build-lookup-href";
import type { UserVehicle } from "@/types/user-vehicle";

interface ProfileSavedVehiclesProps {
  vehicles: UserVehicle[];
}

export async function ProfileSavedVehicles({
  vehicles,
}: ProfileSavedVehiclesProps) {
  const t = await getTranslations("profile.vehicles");

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
          <Star aria-hidden="true" className="size-3.5" />
          {t("title")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("count", { count: vehicles.length })}
        </p>
      </div>

      {vehicles.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {vehicles.map((vehicle) => {
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

            const row: ReactNode = (
              <>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
                  <Wrench aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-foreground">
                    {vehicle.brand} {vehicle.model}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {vehicle.year}
                  </span>
                </span>
                {vehicle.knownIssuesCount != null && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-primary/40 text-primary"
                  >
                    <Flame aria-hidden="true" className="size-3" />
                    {t("knownIssuesCount", {
                      count: vehicle.knownIssuesCount,
                    })}
                  </Badge>
                )}
                {href && (
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                )}
              </>
            );

            return (
              <li key={vehicle.id} className="py-3 first:pt-0 last:pb-0">
                {href ? (
                  <Link
                    href={href}
                    aria-label={t("viewDetails", {
                      brand: vehicle.brand,
                      model: vehicle.model,
                    })}
                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-muted/40"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="-mx-2 flex items-center gap-3 px-2 py-1">
                    {row}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
