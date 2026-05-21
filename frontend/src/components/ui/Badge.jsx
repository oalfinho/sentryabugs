import { cn } from "@/lib/utils";

const variants = {
  danger: "bg-red-500/10   border-red-500/30   text-status-danger",
  warn:   "bg-yellow-500/10 border-yellow-500/30 text-status-warn",
  safe:   "bg-teal-500/10  border-teal-500/30   text-status-safe",
  info:   "bg-accent/10    border-accent/30     text-brand-muted",
};

export function Badge({ children, variant = "info", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-[10px] font-semibold tracking-widest uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
