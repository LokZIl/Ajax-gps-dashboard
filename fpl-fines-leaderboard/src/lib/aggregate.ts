import type { FinesStore, ManagerGameweekResult } from "./types";

export interface LeaderboardGwEntry {
  gw: number;
  status: "provisional" | "final";
  result: ManagerGameweekResult;
}

export interface LeaderboardManager {
  entryId: number;
  managerName: string;
  teamName: string;
  totalOwed: number;
  severity: "low" | "medium" | "high";
  gameweeks: LeaderboardGwEntry[];
}

export interface ChartPoint {
  gw: number;
  [entryId: string]: number;
}

export interface LeaderboardData {
  leagueName: string;
  lastUpdated: string;
  managers: LeaderboardManager[];
  chart: ChartPoint[];
}

function severityFor(total: number): "low" | "medium" | "high" {
  if (total >= 25) return "high";
  if (total >= 10) return "medium";
  return "low";
}

export function buildLeaderboard(store: FinesStore): LeaderboardData {
  const gwNumbers = Object.keys(store.gameweeks)
    .map(Number)
    .sort((a, b) => a - b);

  const managerMetas = Object.values(store.managers);

  const managers: LeaderboardManager[] = managerMetas.map((meta) => {
    const gameweeks: LeaderboardGwEntry[] = [];
    let totalOwed = 0;
    for (const gw of gwNumbers) {
      const record = store.gameweeks[String(gw)];
      const result = record.managerResults[String(meta.entryId)];
      if (!result) continue;
      totalOwed += result.total;
      gameweeks.push({ gw, status: record.status, result });
    }
    return {
      entryId: meta.entryId,
      managerName: meta.managerName,
      teamName: meta.teamName,
      totalOwed,
      severity: severityFor(totalOwed),
      gameweeks,
    };
  });

  managers.sort((a, b) => b.totalOwed - a.totalOwed);

  const chart: ChartPoint[] = [];
  const running: Record<string, number> = {};
  for (const gw of gwNumbers) {
    const record = store.gameweeks[String(gw)];
    const point: ChartPoint = { gw };
    for (const meta of managerMetas) {
      const key = String(meta.entryId);
      const result: ManagerGameweekResult | undefined = record.managerResults[key];
      running[key] = (running[key] ?? 0) + (result?.total ?? 0);
      point[key] = running[key];
    }
    chart.push(point);
  }

  return {
    leagueName: store.leagueName,
    lastUpdated: store.lastUpdated,
    managers,
    chart,
  };
}
