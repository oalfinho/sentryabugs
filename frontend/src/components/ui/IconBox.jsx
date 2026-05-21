import { cn } from "@/lib/utils";

const variants = {
  danger: "bg-red-500/10    border border-red-500/30",
  warn:   "bg-yellow-500/10 border border-yellow-500/30",
  safe:   "bg-teal-500/10   border border-teal-500/30",
  info:   "bg-accent/15     border border-accent/35",
};

export function IconBox({ children, variant = "info", className }) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px]",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
