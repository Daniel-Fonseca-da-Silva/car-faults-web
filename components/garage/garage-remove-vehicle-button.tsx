"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { removeUserVehicleAction } from "@/lib/garage/remove-user-vehicle";

interface GarageRemoveVehicleButtonProps {
  locale: string;
  vehicleId: string;
  vehicleLabel: string;
}

export function GarageRemoveVehicleButton({
  locale,
  vehicleId,
  vehicleLabel,
}: GarageRemoveVehicleButtonProps) {
  const t = useTranslations("garage.list");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirmRemove() {
    startTransition(async () => {
      await removeUserVehicleAction(locale, vehicleId);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("removeAriaLabel", { vehicle: vehicleLabel })}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          />
        }
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("removeConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("removeConfirmDescription", { vehicle: vehicleLabel })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t("removeCancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmRemove}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              t("remove")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
