// Pulls the latest FPL data for the configured league, recomputes fines for
// every gameweek that isn't locked in as "final" yet, and writes the result
// to data/fines.json. Run via `npm run refresh`, normally on a daily cron
// (see .github/workflows/refresh-fines.yml).

import { buildLiveMap, computeManagerGameweek, finalizeGameweekFines } from "../src/lib/fines";
import {
  getBootstrap,
  getEntryPicks,
  getEventLive,
  getH2HMatches,
  getLeagueEntries,
} from "../src/lib/fpl";
import { readStore, writeStore } from "../src/lib/store";
import type { FineHit, ManagerGameweekResult } from "../src/lib/types";

const LEAGUE_ID = Number(process.env.FPL_LEAGUE_ID ?? 980155);

async function main() {
  console.log(`Refreshing fines for league ${LEAGUE_ID}...`);

  const [bootstrap, { leagueName, entries }, store] = await Promise.all([
    getBootstrap(),
    getLeagueEntries(LEAGUE_ID),
    readStore(LEAGUE_ID),
  ]);

  store.leagueId = LEAGUE_ID;
  store.leagueName = leagueName;

  for (const entry of entries) {
    store.managers[String(entry.entry)] = {
      entryId: entry.entry,
      managerName: entry.player_name,
      teamName: entry.entry_name,
    };
  }

  const now = new Date();
  const startedEvents = bootstrap.events.filter((e) => new Date(e.deadline_time) <= now);

  if (startedEvents.length === 0) {
    console.log("No gameweek has started yet — nothing to compute.");
  }

  for (const event of startedEvents) {
    const existing = store.gameweeks[String(event.id)];
    if (existing?.status === "final") {
      console.log(`GW${event.id}: already final, skipping.`);
      continue;
    }

    console.log(`GW${event.id}: fetching live data + picks for ${entries.length} managers...`);
    const [live, h2hMatches] = await Promise.all([
      getEventLive(event.id).then(buildLiveMap),
      getH2HMatches(LEAGUE_ID, event.id),
    ]);

    const partials: (Omit<ManagerGameweekResult, "fines" | "total"> & { fines: FineHit[] })[] = [];
    for (const entry of entries) {
      try {
        const picks = await getEntryPicks(entry.entry, event.id);
        partials.push(computeManagerGameweek(entry.entry, picks, live));
      } catch (err) {
        console.warn(`  skipping manager ${entry.entry} for GW${event.id}: ${(err as Error).message}`);
      }
    }

    if (partials.length === 0) {
      console.warn(`GW${event.id}: no manager data available, skipping.`);
      continue;
    }

    store.gameweeks[String(event.id)] = {
      status: event.finished && event.data_checked ? "final" : "provisional",
      computedAt: now.toISOString(),
      managerResults: finalizeGameweekFines(partials, h2hMatches),
    };
    console.log(`GW${event.id}: stored as ${store.gameweeks[String(event.id)].status}.`);
  }

  store.lastUpdated = now.toISOString();
  await writeStore(store);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
