import { cn } from "@/lib/utils";

import { LogoMark } from "./logo-mark";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-11" />
      <span className="font-heading text-lg font-bold tracking-tight text-foreground">
        AUTO<span className="text-primary">CRÓNICA</span>
      </span>
    </span>
  );
}
