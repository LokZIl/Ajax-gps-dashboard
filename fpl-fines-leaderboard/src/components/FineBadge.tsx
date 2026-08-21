import type { FineHit } from "@/lib/types";

export default function FineBadge({ fine }: { fine: FineHit }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-800/50 bg-red-950/40 px-2.5 py-1 text-xs font-semibold text-red-300">
      {fine.label}
      <span className="text-red-400">${fine.amount}</span>
    </span>
  );
}
