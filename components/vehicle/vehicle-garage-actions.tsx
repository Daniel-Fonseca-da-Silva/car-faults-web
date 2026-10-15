"use client";

import { Check, Loader2, Plus, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";

import { useCurrentUser } from "@/components/auth/current-user-provider";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  favoriteVehicleAction,
  unfavoriteVehicleAction,
} from "@/lib/favorites/toggle-vehicle-favorite";
import { addUserVehicleAction } from "@/lib/garage/add-user-vehicle";
import { removeUserVehicleFromVehiclePageAction } from "@/lib/garage/remove-user-vehicle";
import { cn } from "@/lib/utils";
import {
  fetchVehicleUserStatus,
  type VehicleUserStatus,
} from "@/lib/vehicle/fetch-vehicle-user-status";

interface VehicleGarageActionsProps {
  vehicleModelId: string;
  vehicleLabel: string;
  year: number;
}

/**
 * The vehicle page is cached and shared by every visitor, so the user and
 * their garage/favorite state for this vehicle are loaded here, in the
 * browser, after the page is shown.
 */
export function VehicleGarageActions({
  vehicleModelId,
  vehicleLabel,
  year,
}: VehicleGarageActionsProps) {
  const t = useTranslations("faults.vehicle.actions");
  const locale = useLocale();
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const [status, setStatus] = useState<VehicleUserStatus | null>(null);
  const [isGaragePending, startGarageTransition] = useTransition();
  const [isFavoritePending, startFavoriteTransition] = useTransition();
  const [garageError, setGarageError] = useState<
    "conflict" | "unknown" | null
  >(null);
  const [favoriteError, setFavoriteError] = useState(false);

  const userId = currentUser?.id ?? null;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    fetchVehicleUserStatus(vehicleModelId, year).then((nextStatus) => {
      if (!cancelled) setStatus(nextStatus);
    });

    return () => {
      cancelled = true;
      setStatus(null);
    };
  }, [userId, vehicleModelId, year]);

  const garageVehicleId = status?.garageVehicleId ?? null;
  const isFavorited = status?.isFavorited ?? false;
  const inGarage = garageVehicleId !== null;

  function handleGarageClick() {
    setGarageError(null);
    startGarageTransition(async () => {
      if (garageVehicleId) {
        await removeUserVehicleFromVehiclePageAction(locale, garageVehicleId);
        setStatus((current) => current && { ...current, garageVehicleId: null });
        return;
      }

      const result = await addUserVehicleAction(locale, {
        vehicleModelId,
        year,
      });
      if (!result.ok) {
        setGarageError(result.error);
        return;
      }
      setStatus(
        (current) =>
          current && { ...current, garageVehicleId: result.userVehicleId }
      );
    });
  }

  function handleFavoriteClick() {
    setFavoriteError(false);
    startFavoriteTransition(async () => {
      try {
        if (isFavorited) {
          await unfavoriteVehicleAction(locale, vehicleModelId, year);
        } else {
          await favoriteVehicleAction(locale, vehicleModelId, year);
        }
        setStatus(
          (current) => current && { ...current, isFavorited: !isFavorited }
        );
      } catch {
        setFavoriteError(true);
      }
    });
  }

  if (!isUserLoading && !currentUser) {
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

  // Until the user and their state are known, show the signed-in buttons
  // disabled rather than flashing the guest ones.
  const isStatusLoading = status === null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={inGarage ? "outline" : "default"}
          onClick={handleGarageClick}
          disabled={isStatusLoading || isGaragePending}
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
          disabled={isStatusLoading || isFavoritePending}
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
