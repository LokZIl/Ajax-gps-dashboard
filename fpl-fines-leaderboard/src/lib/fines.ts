import type {
  FineCode,
  FineHit,
  FplH2HMatch,
  FplLiveResponse,
  FplPicksResponse,
  ManagerGameweekResult,
} from "./types";

export const FINE_LABELS: Record<FineCode, string> = {
  under_30: "Score under 30",
  lowest_score: "Lowest score in the league",
  h2h_loss_20: "Lost by 20+ points head-to-head",
  bench_15: "15+ points left on bench",
  bench_25: "25+ points left on bench",
  transfer_hit: "Took a -12 or greater transfer hit",
  bench_beats_starter: "Bench player outscored best starter",
  captain_zero: "Captain scored 0 points",
  captain_negative: "Captain scored negative points",
};

export function buildLiveMap(live: FplLiveResponse): Map<number, number> {
  const map = new Map<number, number>();
  for (const el of live.elements) {
    map.set(el.id, el.stats.total_points);
  }
  return map;
}

/**
 * Computes every fine for one manager's gameweek except "lowest score",
 * which needs a cross-manager comparison and is applied afterwards by
 * finalizeGameweekFines.
 */
export function computeManagerGameweek(
  entryId: number,
  picks: FplPicksResponse,
  livePoints: Map<number, number>,
): Omit<ManagerGameweekResult, "fines" | "total"> & { fines: FineHit[] } {
  const { entry_history, picks: lineup, automatic_subs } = picks;
  const gwScore = entry_history.points;
  const benchPoints = entry_history.points_on_bench;
  const transferCost = entry_history.event_transfers_cost;

  const pointsOf = (elementId: number) => livePoints.get(elementId) ?? 0;

  // Effective starters/bench after FPL's automatic substitutions, so the
  // "bench outscored starter" check reflects the lineup that actually played.
  const starterIds = new Set(lineup.filter((p) => p.position <= 11).map((p) => p.element));
  const benchIds = new Set(lineup.filter((p) => p.position > 11).map((p) => p.element));
  for (const sub of automatic_subs) {
    if (starterIds.has(sub.element_out)) {
      starterIds.delete(sub.element_out);
      starterIds.add(sub.element_in);
    }
    if (benchIds.has(sub.element_in)) {
      benchIds.delete(sub.element_in);
      benchIds.add(sub.element_out);
    }
  }

  const maxStarterPoints = starterIds.size
    ? Math.max(...[...starterIds].map(pointsOf))
    : 0;
  const maxBenchPoints = benchIds.size ? Math.max(...[...benchIds].map(pointsOf)) : 0;

  // The effective captain is whoever actually received the points multiplier
  // (accounts for FPL's automatic vice-captain swap and the Triple Captain chip).
  const captainPick = lineup.find((p) => p.multiplier >= 2);
  const captainPoints = captainPick ? pointsOf(captainPick.element) : 0;

  const fines: FineHit[] = [];

  if (gwScore < 30) {
    fines.push({ code: "under_30", label: FINE_LABELS.under_30, amount: 5 });
  }

  if (benchPoints >= 25) {
    fines.push({ code: "bench_25", label: FINE_LABELS.bench_25, amount: 5 });
  } else if (benchPoints >= 15) {
    fines.push({ code: "bench_15", label: FINE_LABELS.bench_15, amount: 3 });
  }

  if (transferCost >= 12) {
    fines.push({ code: "transfer_hit", label: FINE_LABELS.transfer_hit, amount: 3 });
  }

  if (maxBenchPoints > maxStarterPoints) {
    fines.push({
      code: "bench_beats_starter",
      label: FINE_LABELS.bench_beats_starter,
      amount: 2,
    });
  }

  if (captainPick) {
    if (captainPoints < 0) {
      fines.push({ code: "captain_negative", label: FINE_LABELS.captain_negative, amount: 5 });
    } else if (captainPoints === 0) {
      fines.push({ code: "captain_zero", label: FINE_LABELS.captain_zero, amount: 3 });
    }
  }

  return {
    entryId,
    gwScore,
    benchPoints,
    transferCost,
    captainPoints,
    maxStarterPoints,
    maxBenchPoints,
    fines,
  };
}

/**
 * Fines the loser of a head-to-head match by 20+ points, keyed by entryId.
 * Byes (a match missing an opponent) never trigger it.
 */
function computeH2HLossFines(matches: FplH2HMatch[]): Map<number, FineHit> {
  const fines = new Map<number, FineHit>();
  for (const m of matches) {
    if (m.entry_1_entry == null || m.entry_2_entry == null) continue;
    const diff = m.entry_1_points - m.entry_2_points;
    if (diff >= 20) {
      fines.set(m.entry_2_entry, { code: "h2h_loss_20", label: FINE_LABELS.h2h_loss_20, amount: 3 });
    } else if (-diff >= 20) {
      fines.set(m.entry_1_entry, { code: "h2h_loss_20", label: FINE_LABELS.h2h_loss_20, amount: 3 });
    }
  }
  return fines;
}

/**
 * Adds the "lowest score in the league" and "lost head-to-head by 20+" fines,
 * then totals each manager's fines for the week.
 */
export function finalizeGameweekFines(
  partials: (Omit<ManagerGameweekResult, "fines" | "total"> & { fines: FineHit[] })[],
  h2hMatches: FplH2HMatch[] = [],
): Record<string, ManagerGameweekResult> {
  const lowestScore = Math.min(...partials.map((p) => p.gwScore));
  const h2hLossFines = computeH2HLossFines(h2hMatches);

  const results: Record<string, ManagerGameweekResult> = {};
  for (const p of partials) {
    const fines = [...p.fines];
    if (p.gwScore === lowestScore) {
      fines.push({ code: "lowest_score", label: FINE_LABELS.lowest_score, amount: 5 });
    }
    const h2hFine = h2hLossFines.get(p.entryId);
    if (h2hFine) {
      fines.push(h2hFine);
    }
    const total = fines.reduce((sum, f) => sum + f.amount, 0);
    results[String(p.entryId)] = { ...p, fines, total };
  }
  return results;
}
