"use client";

import { AlertTriangle } from "lucide-react";
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
import { Card } from "@/components/ui/card";

export function ProfileDangerZone() {
  const t = useTranslations("profile.dangerZone");
  const [open, setOpen] = useState(false);

  function handleConfirmDelete() {
    // Stub only: no DELETE /v1/users/me call in this entrega.
    setOpen(false);
  }

  return (
    <Card className="border-destructive/30 p-5">
      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-widest text-destructive uppercase">
        <AlertTriangle aria-hidden="true" className="size-3.5" />
        {t("title")}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-foreground">
            {t("deleteAccount")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("deleteAccountDescription")}
          </p>
        </div>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            {t("deleteAccount")}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("confirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("confirmCancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {t("confirmDelete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
