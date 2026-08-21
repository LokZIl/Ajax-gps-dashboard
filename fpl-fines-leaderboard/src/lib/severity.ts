export type Severity = "low" | "medium" | "high";

export const severityStyles: Record<
  Severity,
  { ring: string; text: string; bg: string; glow: boolean }
> = {
  low: {
    ring: "ring-1 ring-emerald-500/30",
    text: "text-emerald-400",
    bg: "bg-emerald-500/[0.06]",
    glow: false,
  },
  medium: {
    ring: "ring-1 ring-amber-500/40",
    text: "text-amber-400",
    bg: "bg-amber-500/[0.08]",
    glow: false,
  },
  high: {
    ring: "ring-2 ring-red-500/60",
    text: "text-red-400",
    bg: "bg-red-500/[0.08]",
    glow: true,
  },
};
