"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
import { useRouter } from "@/i18n/navigation";
import { deleteAdminVehicleModel } from "@/lib/api/admin-vehicles";

interface VehicleDeleteButtonProps {
  vehicleId: string;
  vehicleLabel: string;
}

export function VehicleDeleteButton({
  vehicleId,
  vehicleLabel,
}: VehicleDeleteButtonProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteAdminVehicleModel(vehicleId);
      router.push("/admin/vehicles");
      router.refresh();
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="destructive" size="sm" />}
      >
        <Trash2 aria-hidden="true" className="size-4" />
        {t("vehicleDetail.deleteVehicle")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("vehicleDetail.deleteConfirmTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("vehicleDetail.deleteConfirmDescription", {
              vehicle: vehicleLabel,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleting ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              t("common.delete")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
