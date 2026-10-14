import { ShoppingCart } from "lucide-react";

import { buildAmazonSearchUrl, type AmazonStore } from "@/lib/affiliate/amazon";

interface AmazonPartsLinkProps {
  store: AmazonStore;
  query: string;
  label: string;
  disclosure: string;
}

export function AmazonPartsLink({
  store,
  query,
  label,
  disclosure,
}: AmazonPartsLinkProps) {
  return (
    <div className="mt-4">
      <a
        href={buildAmazonSearchUrl(store, query)}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <ShoppingCart aria-hidden="true" className="size-4" />
        {label}
      </a>
      <p className="mt-1 text-xs text-muted-foreground/80">{disclosure}</p>
    </div>
  );
}
