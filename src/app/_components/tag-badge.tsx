import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

type TagBadgeProps = {
  children: ReactNode;
  color?: string;
  className?: string;
};

export function TagBadge({ children, color, className }: TagBadgeProps) {
  return (
    <Badge
      className={cn(
        "bg-[color-mix(in_oklch,var(--tag-color)_14%,var(--background))] text-[color-mix(in_oklch,var(--tag-color)_48%,black)] dark:bg-[color-mix(in_oklch,var(--tag-color)_18%,var(--card))] dark:text-[color-mix(in_oklch,var(--tag-color)_48%,white)]",
        className,
      )}
      style={
        {
          "--tag-color": color ?? "var(--primary)",
        } as CSSProperties
      }
    >
      {children}
    </Badge>
  );
}
