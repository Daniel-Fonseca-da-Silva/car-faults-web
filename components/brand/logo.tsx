import { Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Wrench className="size-4" aria-hidden="true" />
      </span>
      <span className="font-heading text-base font-bold tracking-tight text-foreground">
        CAR<span className="text-primary">FAULTS</span>
      </span>
    </span>
  );
}
