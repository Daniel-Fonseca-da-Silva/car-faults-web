import { Reveal } from "@/components/motion/reveal";
import type { TopFaultEntry } from "@/types/vehicle";

import { FaultCard } from "./fault-card";

interface FaultCardGridProps {
  entries: TopFaultEntry[];
}

export function FaultCardGrid({ entries }: FaultCardGridProps) {
  const linkableEntries = entries.filter((entry) => entry.vehicle.fuelType);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {linkableEntries.map((entry, index) => (
        <Reveal
          key={entry.id}
          className="h-full"
          delay={(index % 3) * 0.08}
          hoverLift
        >
          <FaultCard
            make={entry.vehicle.make}
            model={entry.vehicle.model}
            year={entry.vehicle.year}
            engine={entry.vehicle.engine}
            fuelType={entry.vehicle.fuelType}
            doors={entry.vehicle.doors}
            faultTitle={entry.faultTitle}
            severity={entry.severity}
            reportCount={entry.reportCount}
            contentLocale={entry.contentLocale}
          />
        </Reveal>
      ))}
    </div>
  );
}
