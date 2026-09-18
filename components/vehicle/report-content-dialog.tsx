"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ReportConflictError } from "@/lib/api/report-errors";
import { createReport } from "@/lib/api/reports";
import type { ReportContentType, ReportReason } from "@/types/report";

const REPORT_REASONS: ReportReason[] = [
  "spam",
  "offensive",
  "inappropriate_photo",
  "harassment",
  "other",
];

interface ReportContentDialogProps {
  contentType: ReportContentType;
  contentId: string;
}

export function ReportContentDialog({
  contentType,
  contentId,
}: ReportContentDialogProps) {
  const t = useTranslations("faults");

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setReason(null);
      setDetails("");
      setError(null);
      setSuccess(false);
    }
  }

  async function handleSubmit() {
    if (!reason || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await createReport({
        contentType,
        contentId,
        reason,
        details: details.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ReportConflictError
          ? t("vehicle.report.duplicateError")
          : t("vehicle.report.submitError")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" />}>
        {t("vehicle.report.action")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("vehicle.report.dialogTitle")}</DialogTitle>
        </DialogHeader>

        {success ? (
          <p className="text-sm text-foreground">{t("vehicle.report.success")}</p>
        ) : (
          <>
            <RadioGroup
              value={reason}
              onValueChange={(value) => setReason(value as ReportReason)}
            >
              {REPORT_REASONS.map((value) => (
                <Label key={value} className="items-start font-normal">
                  <RadioGroupItem value={value} className="mt-0.5" />
                  {t(`vehicle.report.reason.${value}`)}
                </Label>
              ))}
            </RadioGroup>

            <Textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder={t("vehicle.report.detailsPlaceholder")}
              disabled={submitting}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}
          </>
        )}

        <DialogFooter>
          {success ? (
            <Button type="button" size="sm" onClick={() => handleOpenChange(false)}>
              {t("vehicle.report.close")}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                {t("vehicle.report.cancel")}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={!reason || submitting}
              >
                {submitting ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  t("vehicle.report.submit")
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
