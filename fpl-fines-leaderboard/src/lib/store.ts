import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { FinesStore } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "fines.json");

export function emptyStore(leagueId: number): FinesStore {
  return {
    leagueId,
    leagueName: "",
    lastUpdated: new Date(0).toISOString(),
    managers: {},
    gameweeks: {},
  };
}

export async function readStore(leagueId: number): Promise<FinesStore> {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as FinesStore;
  } catch {
    return emptyStore(leagueId);
  }
}

// Only ever called from scripts/refresh.ts (a CI/local process) — the deployed
// app's filesystem is read-only, so it never writes back to this file.
export async function writeStore(store: FinesStore): Promise<void> {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(store, null, 2) + "\n", "utf-8");
}
