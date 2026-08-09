"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/i18n/navigation";
import {
  createAdminKnownIssue,
  updateAdminKnownIssue,
} from "@/lib/api/admin-known-issues";
import type { AdminIssueLocale, AdminKnownIssue } from "@/types/admin";
import type { IssueSeverity } from "@/types/lookup";

const SEVERITIES: IssueSeverity[] = ["low", "medium", "high", "critical"];
const SEVERITY_LABEL_KEYS = {
  low: "issueForm.severityLow",
  medium: "issueForm.severityMedium",
  high: "issueForm.severityHigh",
  critical: "issueForm.severityCritical",
} as const satisfies Record<IssueSeverity, string>;

const LOCALES: AdminIssueLocale[] = ["en-GB", "pt-PT", "es-ES"];

interface KnownIssueFormProps {
  vehicleModelId: string;
  knownIssue?: AdminKnownIssue;
}

export function KnownIssueForm({
  vehicleModelId,
  knownIssue,
}: KnownIssueFormProps) {
  const t = useTranslations("admin");
  const router = useRouter();

  const [title, setTitle] = useState(knownIssue?.title ?? "");
  const [description, setDescription] = useState(
    knownIssue?.description ?? ""
  );
  const [severity, setSeverity] = useState<IssueSeverity>(
    knownIssue?.severity ?? "medium"
  );
  const [locale, setLocale] = useState<AdminIssueLocale>(
    knownIssue?.locale ?? "en-GB"
  );
  const [typicalKm, setTypicalKm] = useState(
    knownIssue?.typicalKm != null ? String(knownIssue.typicalKm) : ""
  );
  const [sources, setSources] = useState(
    knownIssue?.sources?.join("\n") ?? ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const sourcesList = sources
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    try {
      if (knownIssue) {
        await updateAdminKnownIssue(knownIssue.id, {
          title: title.trim(),
          description: description.trim(),
          severity,
          locale,
          typicalKm: typicalKm.trim() ? Number(typicalKm) : null,
          sources: sourcesList.length > 0 ? sourcesList : null,
        });
        router.push(`/admin/issues/${knownIssue.id}`);
      } else {
        const created = await createAdminKnownIssue({
          vehicleModelId,
          title: title.trim(),
          description: description.trim(),
          severity,
          locale,
          typicalKm: typicalKm.trim() ? Number(typicalKm) : null,
          sources: sourcesList.length > 0 ? sourcesList : null,
        });
        router.push(`/admin/issues/${created.id}`);
      }
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="issue-title">{t("issueForm.title")}</Label>
        <Input
          id="issue-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          disabled={submitting}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="issue-description">{t("issueForm.description")}</Label>
        <Textarea
          id="issue-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          disabled={submitting}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="issue-severity">{t("issueForm.severity")}</Label>
          <NativeSelect
            id="issue-severity"
            value={severity}
            onChange={(event) =>
              setSeverity(event.target.value as IssueSeverity)
            }
            disabled={submitting}
          >
            {SEVERITIES.map((value) => (
              <NativeSelectOption key={value} value={value}>
                {t(SEVERITY_LABEL_KEYS[value])}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="issue-locale">{t("issueForm.locale")}</Label>
          <NativeSelect
            id="issue-locale"
            value={locale}
            onChange={(event) =>
              setLocale(event.target.value as AdminIssueLocale)
            }
            disabled={submitting}
          >
            {LOCALES.map((value) => (
              <NativeSelectOption key={value} value={value}>
                {value}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="issue-typical-km">{t("issueForm.typicalKm")}</Label>
          <Input
            id="issue-typical-km"
            type="number"
            value={typicalKm}
            onChange={(event) => setTypicalKm(event.target.value)}
            disabled={submitting}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="issue-sources">{t("issueForm.sources")}</Label>
        <Textarea
          id="issue-sources"
          value={sources}
          onChange={(event) => setSources(event.target.value)}
          placeholder={t("issueForm.sourcesHint")}
          disabled={submitting}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting
          ? knownIssue
            ? t("common.saving")
            : t("common.creating")
          : knownIssue
            ? t("common.save")
            : t("common.create")}
      </Button>
    </form>
  );
}
