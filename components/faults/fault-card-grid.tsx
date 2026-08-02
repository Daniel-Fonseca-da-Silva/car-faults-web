import type { TopFaultEntry } from "@/types/vehicle";

import { FaultCard } from "./fault-card";

interface FaultCardGridProps {
  entries: TopFaultEntry[];
}

export function FaultCardGrid({ entries }: FaultCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <FaultCard
          key={entry.id}
          make={entry.vehicle.make}
          makeSlug={entry.vehicle.makeSlug}
          model={entry.vehicle.model}
          modelSlug={entry.vehicle.modelSlug}
          year={entry.vehicle.year}
          engine={entry.vehicle.engine}
          fuelType={entry.vehicle.fuelType}
          doors={entry.vehicle.doors}
          faultTitle={entry.faultTitle}
          severity={entry.severity}
          reportCount={entry.reportCount}
        />
      ))}
    </div>
  );
}
