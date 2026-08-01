"use client";

import { ImagePlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uploadCommentImage } from "@/lib/api/storage";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export interface CommentFormSubmitData {
  body: string;
  imageUrl?: string | null;
}

interface CommentFormProps {
  initialBody?: string;
  initialImageUrl?: string | null;
  submitLabel: string;
  onSubmit: (data: CommentFormSubmitData) => Promise<void>;
  onCancel?: () => void;
}

export function CommentForm({
  initialBody = "",
  initialImageUrl = null,
  submitLabel,
  onSubmit,
  onCancel,
}: CommentFormProps) {
  const t = useTranslations("faults");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [body, setBody] = useState(initialBody);
  const [existingImageUrl, setExistingImageUrl] = useState(initialImageUrl);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  function revokePreviewUrl() {
    if (!previewUrlRef.current) return;
    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  }

  function replacePreviewUrl(nextUrl: string | null) {
    revokePreviewUrl();
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }

  useEffect(() => {
    return () => {
      if (!previewUrlRef.current) return;
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    };
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(t("vehicle.comments.invalidImageType"));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(t("vehicle.comments.imageTooLarge"));
      return;
    }

    setError(null);
    setNewFile(file);
    replacePreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setNewFile(null);
    replacePreviewUrl(null);
    setExistingImageUrl(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | null | undefined;
      if (newFile) {
        const uploaded = await uploadCommentImage(newFile);
        imageUrl = uploaded.url;
      } else if (initialImageUrl && existingImageUrl === null) {
        imageUrl = null;
      }

      await onSubmit({ body: body.trim(), imageUrl });
      setBody("");
      setNewFile(null);
      replacePreviewUrl(null);
      setExistingImageUrl(null);
    } catch {
      setError(t("vehicle.comments.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  const displayedImageUrl = previewUrl ?? existingImageUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("vehicle.comments.placeholder")}
        disabled={submitting}
      />

      {displayedImageUrl && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayedImageUrl}
            alt={t("vehicle.comments.imageAlt")}
            className="max-h-40 rounded-lg border border-border object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            aria-label={t("vehicle.comments.removeImage")}
            className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-background text-foreground shadow ring-1 ring-border"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting}
          >
            <ImagePlus aria-hidden="true" />
            {t("vehicle.comments.addImage")}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={submitting}
            >
              {t("vehicle.comments.cancel")}
            </Button>
          )}
          <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
            {submitting ? t("vehicle.comments.publishing") : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
