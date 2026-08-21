"use client";

import { useState } from "react";
import type { LeaderboardManager } from "@/lib/aggregate";
import { severityStyles } from "@/lib/severity";
import FineBadge from "./FineBadge";

export default function ManagerRow({
  manager,
  rank,
}: {
  manager: LeaderboardManager;
  rank: number;
}) {
  const [open, setOpen] = useState(false);
  const s = severityStyles[manager.severity];

  return (
    <div
      className={`rounded-2xl border border-white/5 ${s.bg} ${s.ring} ${s.glow ? "fine-glow" : ""} transition-colors`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <span className="w-8 shrink-0 text-lg font-black text-white/30">#{rank}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-extrabold text-white">
            {manager.teamName}
          </span>
          <span className="block truncate text-sm text-white/50">{manager.managerName}</span>
        </span>
        <span className={`shrink-0 text-3xl font-black tabular-nums ${s.text}`}>
          ${manager.totalOwed}
        </span>
        <span
          className={`ml-1 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t border-white/5 px-5 pb-5 pt-3">
          {manager.gameweeks.length === 0 ? (
            <p className="text-sm text-white/40">No fines recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {[...manager.gameweeks].reverse().map((gwe) => (
                <div
                  key={gwe.gw}
                  className="flex flex-wrap items-center gap-2 rounded-lg bg-black/20 px-3 py-2"
                >
                  <span className="w-14 shrink-0 text-xs font-bold uppercase text-white/40">
                    GW{gwe.gw}
                  </span>
                  <span className="w-16 shrink-0 text-sm font-semibold text-white/70">
                    {gwe.result.gwScore} pts
                  </span>
                  {gwe.status === "provisional" && (
                    <span className="rounded-full border border-yellow-600/40 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-400">
                      Provisional
                    </span>
                  )}
                  <div className="flex flex-1 flex-wrap justify-end gap-1.5">
                    {gwe.result.fines.length === 0 ? (
                      <span className="text-xs text-white/30">No fines</span>
                    ) : (
                      gwe.result.fines.map((f) => <FineBadge key={f.code} fine={f} />)
                    )}
                  </div>
                  <span className="w-14 shrink-0 text-right text-sm font-bold text-red-300">
                    ${gwe.result.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
