"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { buildLookupHref } from "@/lib/lookup/build-lookup-href";
import type { FavoriteVehicle } from "@/types/favorite-vehicle";

const FALLBACK_IMAGE_SRC = "/garage/1951-volkswagen-beetle-garage-scene.webp";

interface FavoriteVehicleCardProps {
  vehicle: FavoriteVehicle;
}

export const FavoriteVehicleCard = ({ vehicle }: FavoriteVehicleCardProps) => {
  const t = useTranslations("favorites");
  const label = `${vehicle.brand} ${vehicle.model}`;
  const imageSrc = vehicle.imageUrl?.trim() || FALLBACK_IMAGE_SRC;
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

  const content = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl bg-muted">
        <Image
          src={imageSrc}
          alt={label}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <p className="truncate font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {vehicle.year}
          {vehicle.engine ? ` · ${vehicle.engine}` : ""}
        </p>
      </div>
    </>
  );

  if (!href) {
    return <Card className="overflow-hidden py-0">{content}</Card>;
  }

  return (
    <Card className="overflow-hidden py-0 transition-colors hover:border-primary/50">
      <Link
        href={href}
        aria-label={t("viewVehicle", { brand: vehicle.brand, model: vehicle.model })}
        className="block"
      >
        {content}
      </Link>
    </Card>
  );
};
