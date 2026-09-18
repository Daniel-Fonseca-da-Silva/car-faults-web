"use client";

import { Loader2 } from "lucide-react";
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
import {
  removeAdminReportContent,
  updateAdminReportStatus,
} from "@/lib/api/admin-reports";
import type { AdminReportStatus } from "@/types/admin";

type PendingAction = AdminReportStatus | "remove";

interface AdminReportStatusActionsProps {
  reportId: string;
  contentExists: boolean;
  onResolved: (id: string) => void;
}

export function AdminReportStatusActions({
  reportId,
  contentExists,
  onResolved,
}: AdminReportStatusActionsProps) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  async function handleUpdate(status: AdminReportStatus) {
    setPendingAction(status);
    setError(null);
    try {
      await updateAdminReportStatus(reportId, status, { appLocale: locale });
      onResolved(reportId);
    } catch {
      setError(t("common.error"));
      setPendingAction(null);
    }
  }

  async function handleRemoveContent() {
    setPendingAction("remove");
    setError(null);
    try {
      await removeAdminReportContent(reportId, { appLocale: locale });
      setConfirmingRemove(false);
      onResolved(reportId);
    } catch {
      setError(t("common.error"));
      setPendingAction(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pendingAction !== null}
          onClick={() => handleUpdate("reviewed")}
        >
          {pendingAction === "reviewed" ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            t("reports.markReviewed")
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pendingAction !== null}
          onClick={() => handleUpdate("dismissed")}
        >
          {pendingAction === "dismissed" ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            t("reports.dismiss")
          )}
        </Button>
        <AlertDialog open={confirmingRemove} onOpenChange={setConfirmingRemove}>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={pendingAction !== null || !contentExists}
                title={
                  contentExists
                    ? undefined
                    : t("reports.contentAlreadyRemoved")
                }
              />
            }
          >
            {t("reports.removeContent")}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("reports.removeContentConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("reports.removeContentConfirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pendingAction === "remove"}>
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveContent}
                disabled={pendingAction === "remove"}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {pendingAction === "remove" ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  t("common.delete")
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
