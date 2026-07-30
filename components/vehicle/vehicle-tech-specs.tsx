import { Calendar, Cog, DoorOpen, Fuel, Gauge, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { formatYearRange } from "@/lib/utils";
import type { VehicleLookup } from "@/types/lookup";

interface VehicleTechSpecsProps {
  vehicle: VehicleLookup;
}

interface SpecTile {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
}

export async function VehicleTechSpecs({ vehicle }: VehicleTechSpecsProps) {
  const t = await getTranslations("faults.vehicle");
  const powerHp = vehicle.techSpecs?.power_hp;

  const specs: SpecTile[] = [
    {
      key: "years",
      icon: Calendar,
      label: t("years"),
      value: formatYearRange(vehicle.yearFrom, vehicle.yearTo),
    },
    {
      key: "engine",
      icon: Cog,
      label: t("engine"),
      value: vehicle.engine,
    },
    {
      key: "fuel",
      icon: Fuel,
      label: t("fuel"),
      value: vehicle.fuelType ? t(`fuelTypes.${vehicle.fuelType}`) : "—",
    },
    {
      key: "doors",
      icon: DoorOpen,
      label: t("doors"),
      value: vehicle.doors != null ? String(vehicle.doors) : "—",
    },
    {
      key: "power",
      icon: Gauge,
      label: t("power"),
      value: typeof powerHp === "number" ? `${powerHp} hp` : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {specs.map((spec) => (
        <div
          key={spec.key}
          className="rounded-xl border border-border bg-card p-4"
        >
          <spec.icon aria-hidden="true" className="size-5 text-primary" />
          <p className="mt-2 text-xs tracking-wide text-muted-foreground uppercase">
            {spec.label}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {spec.value}
          </p>
        </div>
      ))}
    </div>
  );
}
