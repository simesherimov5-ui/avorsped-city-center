import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border border-dashed border-line px-6 py-16 text-center", className)}>
      <p className="font-display text-xl text-charcoal">{title}</p>
      {description && <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
