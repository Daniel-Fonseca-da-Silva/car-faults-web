"use client";

import type { ComponentProps, MouseEvent } from "react";

interface ScrollLinkProps extends Omit<ComponentProps<"a">, "href"> {
  targetId: string;
}

/** In-page anchor that smoothly scrolls to `targetId`, honouring reduced motion. */
export function ScrollLink({ targetId, onClick, ...props }: ScrollLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const target = document.getElementById(targetId);
    if (event.defaultPrevented || !target) return;

    event.preventDefault();
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${targetId}`);
  };

  return <a href={`#${targetId}`} onClick={handleClick} {...props} />;
}
