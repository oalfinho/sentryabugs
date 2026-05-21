import { cn } from "@/lib/utils";

export function Card({ children, className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-accent/35",
        "before:absolute before:inset-x-0 before:top-0 before:h-px",
        "before:bg-gradient-to-r before:from-transparent before:via-accent/60 before:to-transparent",
        variant === "danger"
          ? "bg-status-danger-gradient border-status-danger/30"
          : "bg-card",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
