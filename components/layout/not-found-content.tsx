import Image from "next/image";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";

const NOT_FOUND_IMAGE_SRC = "/404/not-found.webp";

export const BACK_HOME_LINK_CLASS_NAME = "h-11";

interface NotFoundContentProps {
  title: string;
  description: string;
  imageAlt: string;
  /** The link back to the home page, built by each 404 with its own Link. */
  homeLink: ReactNode;
}

export function NotFoundContent({
  title,
  description,
  imageAlt,
  homeLink,
}: NotFoundContentProps) {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden sm:min-h-[80vh]">
      <Image
        src={NOT_FOUND_IMAGE_SRC}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40"
      />

      <SiteShell className="relative flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        {homeLink}
      </SiteShell>
    </div>
  );
}
