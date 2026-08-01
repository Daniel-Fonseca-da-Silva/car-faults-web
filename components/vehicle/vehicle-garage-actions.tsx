"use client";

import { Check, Loader2, Plus, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  favoriteVehicleAction,
  unfavoriteVehicleAction,
} from "@/lib/favorites/toggle-vehicle-favorite";
import { addUserVehicleAction } from "@/lib/garage/add-user-vehicle";
import { removeUserVehicleFromVehiclePageAction } from "@/lib/garage/remove-user-vehicle";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/user";

interface VehicleGarageActionsProps {
  vehicleModelId: string;
  vehicleLabel: string;
  year: number;
  currentUser: UserProfile | null;
  garageVehicleId: string | null;
  isFavorited: boolean;
  currentPath: string;
}

export function VehicleGarageActions({
  vehicleModelId,
  vehicleLabel,
  year,
  currentUser,
  garageVehicleId,
  isFavorited,
  currentPath,
}: VehicleGarageActionsProps) {
  const t = useTranslations("faults.vehicle.actions");
  const locale = useLocale();
  const [isGaragePending, startGarageTransition] = useTransition();
  const [isFavoritePending, startFavoriteTransition] = useTransition();
  const [garageError, setGarageError] = useState<
    "conflict" | "unknown" | null
  >(null);
  const [favoriteError, setFavoriteError] = useState(false);

  const inGarage = garageVehicleId !== null;

  function handleGarageClick() {
    setGarageError(null);
    startGarageTransition(async () => {
      if (garageVehicleId) {
        await removeUserVehicleFromVehiclePageAction(
          locale,
          currentPath,
          garageVehicleId
        );
        return;
      }

      const result = await addUserVehicleAction(locale, currentPath, {
        vehicleModelId,
        year,
      });
      if (!result.ok) {
        setGarageError(result.error);
      }
    });
  }

  function handleFavoriteClick() {
    setFavoriteError(false);
    startFavoriteTransition(async () => {
      try {
        if (isFavorited) {
          await unfavoriteVehicleAction(locale, currentPath, vehicleModelId);
        } else {
          await favoriteVehicleAction(locale, currentPath, vehicleModelId);
        }
      } catch {
        setFavoriteError(true);
      }
    });
  }

  if (!currentUser) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          render={<Link href="/login" />}
          nativeButton={false}
        >
          <Plus aria-hidden="true" className="size-4" />
          {t("addToGarage")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          render={<Link href="/login" />}
          nativeButton={false}
        >
          <Star aria-hidden="true" className="size-4" />
          {t("favorite")}
        </Button>
        <span className="text-xs text-muted-foreground">
          {t("guestHint")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={inGarage ? "outline" : "default"}
          onClick={handleGarageClick}
          disabled={isGaragePending}
          aria-pressed={inGarage}
          aria-label={t(
            inGarage ? "removeFromGarageAriaLabel" : "addToGarageAriaLabel",
            { vehicle: vehicleLabel }
          )}
        >
          {isGaragePending ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : inGarage ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <Plus aria-hidden="true" className="size-4" />
          )}
          {inGarage ? t("removeFromGarage") : t("addToGarage")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleFavoriteClick}
          disabled={isFavoritePending}
          aria-pressed={isFavorited}
          aria-label={t(
            isFavorited ? "unfavoriteAriaLabel" : "favoriteAriaLabel",
            { vehicle: vehicleLabel }
          )}
        >
          {isFavoritePending ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Star
              aria-hidden="true"
              className={cn("size-4", isFavorited && "fill-current")}
            />
          )}
          {isFavorited ? t("unfavorite") : t("favorite")}
        </Button>
      </div>
      {garageError && (
        <p className="text-xs text-destructive">
          {garageError === "conflict"
            ? t("garageConflictError")
            : t("garageGenericError")}
        </p>
      )}
      {favoriteError && (
        <p className="text-xs text-destructive">
          {t("favoriteGenericError")}
        </p>
      )}
    </div>
  );
}
