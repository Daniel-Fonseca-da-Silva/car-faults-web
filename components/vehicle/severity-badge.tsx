import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IssueSeverity } from "@/types/lookup";

const SEVERITY_VARIANT: Record<IssueSeverity, "outline" | "destructive"> = {
  low: "outline",
  medium: "outline",
  high: "outline",
  critical: "destructive",
};

const SEVERITY_CLASSNAME: Partial<Record<IssueSeverity, string>> = {
  medium: "border-transparent bg-amber-500/15 text-amber-500",
  high: "border-transparent bg-orange-500/15 text-orange-500",
};

interface SeverityBadgeProps {
  severity: IssueSeverity;
  label: string;
  className?: string;
}

export function SeverityBadge({
  severity,
  label,
  className,
}: SeverityBadgeProps) {
  return (
    <Badge
      variant={SEVERITY_VARIANT[severity]}
      className={cn(SEVERITY_CLASSNAME[severity], className)}
    >
      {label}
    </Badge>
  );
}
