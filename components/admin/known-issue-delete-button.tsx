"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
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
import { deleteAdminKnownIssue } from "@/lib/api/admin-known-issues";

interface KnownIssueDeleteButtonProps {
  knownIssueId: string;
  vehicleModelId: string;
  issueTitle: string;
}

export function KnownIssueDeleteButton({
  knownIssueId,
  vehicleModelId,
  issueTitle,
}: KnownIssueDeleteButtonProps) {
  const t = useTranslations("admin");
  const router = useRouter();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteAdminKnownIssue(knownIssueId, {
        appLocale: locale,
        vehicleModelId,
      });
      setOpen(false);
      router.push(`/admin/vehicles/${vehicleModelId}`);
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 aria-hidden="true" className="size-4" />
        {t("issueDetail.deleteIssue")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("issueDetail.deleteConfirmTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("issueDetail.deleteConfirmDescription", { issue: issueTitle })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
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
