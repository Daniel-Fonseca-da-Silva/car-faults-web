"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface CopyAccountIdButtonProps {
  accountId: string;
  label: string;
  copiedLabel: string;
}

export function CopyAccountIdButton({
  accountId,
  label,
  copiedLabel,
}: CopyAccountIdButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={copied ? copiedLabel : label}
      onClick={handleCopy}
    >
      {copied ? (
        <Check aria-hidden="true" />
      ) : (
        <Copy aria-hidden="true" />
      )}
    </Button>
  );
}
