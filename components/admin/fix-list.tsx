"use client";

import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminFix,
  deleteAdminFix,
  updateAdminFix,
} from "@/lib/api/admin-fixes";
import type { AdminFix } from "@/types/admin";

interface FixFormValues {
  summary: string;
  steps: string;
  estimatedCostEur: string;
}

const EMPTY_FORM: FixFormValues = {
  summary: "",
  steps: "",
  estimatedCostEur: "",
};

interface FixListProps {
  knownIssueId: string;
  fixes: AdminFix[];
}

export function FixList({ knownIssueId, fixes }: FixListProps) {
  const t = useTranslations("admin");
  const [items, setItems] = useState(fixes);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function handleCreated(fix: AdminFix) {
    setItems((current) => [...current, fix]);
    setAddingNew(false);
  }

  function handleUpdated(fix: AdminFix) {
    setItems((current) =>
      current.map((item) => (item.id === fix.id ? fix : item))
    );
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    setPendingDeleteId(id);
    try {
      await deleteAdminFix(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && !addingNew && (
        <p className="text-sm text-muted-foreground">
          {t("issueDetail.noFixes")}
        </p>
      )}

      <ul className="space-y-3">
        {items.map((fix) =>
          editingId === fix.id ? (
            <li key={fix.id} className="rounded-lg border border-border p-3">
              <FixForm
                initial={{
                  summary: fix.summary,
                  steps: fix.steps,
                  estimatedCostEur: fix.estimatedCostEur ?? "",
                }}
                onCancel={() => setEditingId(null)}
                onSubmit={async (values) => {
                  const updated = await updateAdminFix(fix.id, {
                    summary: values.summary,
                    steps: values.steps,
                    estimatedCostEur: values.estimatedCostEur
                      ? Number(values.estimatedCostEur)
                      : undefined,
                  });
                  handleUpdated(updated);
                }}
              />
            </li>
          ) : (
            <li
              key={fix.id}
              className="space-y-2 rounded-lg border border-border p-3"
            >
              <p className="text-sm font-medium text-foreground">
                {fix.summary}
              </p>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {fix.steps}
              </p>
              {fix.estimatedCostEur && (
                <p className="text-xs text-muted-foreground">
                  {t("fixForm.estimatedCostEur")}: {fix.estimatedCostEur} €
                </p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(fix.id)}
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                  {t("common.edit")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(fix.id)}
                  disabled={pendingDeleteId === fix.id}
                >
                  {pendingDeleteId === fix.id ? (
                    <Loader2
                      aria-hidden="true"
                      className="size-3.5 animate-spin"
                    />
                  ) : (
                    <Trash2 aria-hidden="true" className="size-3.5" />
                  )}
                  {t("common.delete")}
                </Button>
              </div>
            </li>
          )
        )}
      </ul>

      {addingNew ? (
        <div className="rounded-lg border border-border p-3">
          <FixForm
            initial={EMPTY_FORM}
            onCancel={() => setAddingNew(false)}
            onSubmit={async (values) => {
              const created = await createAdminFix({
                knownIssueId,
                summary: values.summary,
                steps: values.steps,
                estimatedCostEur: values.estimatedCostEur
                  ? Number(values.estimatedCostEur)
                  : undefined,
              });
              handleCreated(created);
            }}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAddingNew(true)}
        >
          <Plus aria-hidden="true" className="size-4" />
          {t("issueDetail.addFix")}
        </Button>
      )}
    </div>
  );
}

interface FixFormProps {
  initial: FixFormValues;
  onSubmit: (values: FixFormValues) => Promise<void>;
  onCancel: () => void;
}

function FixForm({ initial, onSubmit, onCancel }: FixFormProps) {
  const t = useTranslations("admin");
  const [summary, setSummary] = useState(initial.summary);
  const [steps, setSteps] = useState(initial.steps);
  const [estimatedCostEur, setEstimatedCostEur] = useState(
    initial.estimatedCostEur
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        summary: summary.trim(),
        steps: steps.trim(),
        estimatedCostEur: estimatedCostEur.trim(),
      });
    } catch {
      setError(t("common.error"));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`fix-summary-${initial.summary}`}>
          {t("fixForm.summary")}
        </Label>
        <Input
          id={`fix-summary-${initial.summary}`}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          required
          disabled={submitting}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`fix-steps-${initial.summary}`}>
          {t("fixForm.steps")}
        </Label>
        <Textarea
          id={`fix-steps-${initial.summary}`}
          value={steps}
          onChange={(event) => setSteps(event.target.value)}
          required
          disabled={submitting}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`fix-cost-${initial.summary}`}>
          {t("fixForm.estimatedCostEur")}
        </Label>
        <Input
          id={`fix-cost-${initial.summary}`}
          type="number"
          min={0}
          value={estimatedCostEur}
          onChange={(event) => setEstimatedCostEur(event.target.value)}
          disabled={submitting}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? (
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
          ) : (
            t("common.save")
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={submitting}
        >
          <X aria-hidden="true" className="size-3.5" />
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
