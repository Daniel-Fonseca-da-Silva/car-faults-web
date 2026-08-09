"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
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
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/auth/logout";
import { deleteCurrentUserAccount } from "@/lib/api/account";

export function ProfileDangerZone() {
  const t = useTranslations("profile.dangerZone");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteCurrentUserAccount();
      await logout();
      router.push("/login");
    } catch {
      setError(t("deleteError"));
      setIsDeleting(false);
    }
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
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
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
              <AlertDialogCancel disabled={isDeleting}>
                {t("confirmCancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  t("confirmDelete")
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
