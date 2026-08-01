import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { VehicleGarageActions } from "@/components/vehicle/vehicle-garage-actions";
import type { VehicleLookup } from "@/types/lookup";
import type { UserProfile } from "@/types/user";

const FALLBACK_IMAGE_SRC = "/show/citroen-2CV.webp";

interface VehicleHeroProps {
  vehicle: VehicleLookup;
  year: number;
  currentUser: UserProfile | null;
  garageVehicleId: string | null;
  isFavorited: boolean;
  currentPath: string;
}

export async function VehicleHero({
  vehicle,
  year,
  currentUser,
  garageVehicleId,
  isFavorited,
  currentPath,
}: VehicleHeroProps) {
  const t = await getTranslations("faults.vehicle");
  const title = `${vehicle.brand} ${vehicle.model}`;
  const imageSrc =
    vehicle.imageUrl && vehicle.imageUrl.trim().length > 0
      ? vehicle.imageUrl
      : FALLBACK_IMAGE_SRC;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl sm:aspect-[21/9]">
      <Image
        src={imageSrc}
        alt={title}
        fill
        priority
        sizes="(min-width: 1024px) 1024px, 100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10"
      />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {title}
          {vehicle.name && vehicle.name !== title && (
            <span className="block text-lg font-medium text-muted-foreground">
              {vehicle.name}
            </span>
          )}
        </h1>
        <div className="mt-4">
          <VehicleGarageActions
            vehicleModelId={vehicle.id}
            vehicleLabel={title}
            year={year}
            currentUser={currentUser}
            garageVehicleId={garageVehicleId}
            isFavorited={isFavorited}
            currentPath={currentPath}
          />
        </div>
      </div>
    </div>
  );
}
