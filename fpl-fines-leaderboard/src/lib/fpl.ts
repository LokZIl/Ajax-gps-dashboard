import type {
  FplBootstrap,
  FplH2HMatch,
  FplH2HMatchesResponse,
  FplLeagueEntry,
  FplLeagueStandings,
  FplLiveResponse,
  FplPicksResponse,
} from "./types";

const BASE_URL = "https://fantasy.premierleague.com/api";

async function fplFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "User-Agent": "fpl-fines-leaderboard/1.0" },
  });
  if (!res.ok) {
    throw new Error(`FPL API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function getBootstrap(): Promise<FplBootstrap> {
  return fplFetch<FplBootstrap>("/bootstrap-static/");
}

// League 980155 is a head-to-head (not classic) mini-league.
export async function getLeagueEntries(leagueId: number): Promise<{
  leagueName: string;
  entries: FplLeagueEntry[];
}> {
  const entries: FplLeagueEntry[] = [];
  let page = 1;
  let leagueName = "";

  while (true) {
    const data = await fplFetch<FplLeagueStandings>(
      `/leagues-h2h/${leagueId}/standings/?page_standings=${page}`,
    );
    leagueName = data.league.name;
    entries.push(...data.standings.results);
    if (!data.standings.has_next) break;
    page += 1;
  }

  return { leagueName, entries };
}

export async function getH2HMatches(leagueId: number, gw: number): Promise<FplH2HMatch[]> {
  const matches: FplH2HMatch[] = [];
  let page = 1;

  while (true) {
    const data = await fplFetch<FplH2HMatchesResponse>(
      `/leagues-h2h-matches/league/${leagueId}/?event=${gw}&page=${page}`,
    );
    matches.push(...data.results);
    if (!data.has_next) break;
    page += 1;
  }

  return matches;
}

export function getEntryPicks(entryId: number, gw: number): Promise<FplPicksResponse> {
  return fplFetch<FplPicksResponse>(`/entry/${entryId}/event/${gw}/picks/`);
}

export function getEventLive(gw: number): Promise<FplLiveResponse> {
  return fplFetch<FplLiveResponse>(`/event/${gw}/live/`);
}
