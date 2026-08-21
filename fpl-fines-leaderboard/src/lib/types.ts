// Shapes we actually use from the public FPL API, plus our own derived/stored types.

export interface FplEvent {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  data_checked: boolean;
  is_current: boolean;
  is_next: boolean;
}

export interface FplBootstrap {
  events: FplEvent[];
}

export interface FplLeagueEntry {
  entry: number; // manager id
  entry_name: string; // team name
  player_name: string; // manager's real name
  rank: number;
  total: number;
}

// Pre-season (or for a manager not yet slotted into a scored gameweek), FPL
// lists league members here instead of standings.results.
export interface FplNewEntry {
  entry: number;
  entry_name: string;
  player_first_name: string;
  player_last_name: string;
}

export interface FplLeagueStandings {
  league: { id: number; name: string };
  standings: {
    results: FplLeagueEntry[];
    has_next: boolean;
    page: number;
  };
  new_entries: {
    results: FplNewEntry[];
    has_next: boolean;
    page: number;
  };
}

export interface FplH2HMatch {
  event: number;
  entry_1_entry: number | null;
  entry_1_points: number;
  entry_2_entry: number | null;
  entry_2_points: number;
}

export interface FplH2HMatchesResponse {
  has_next: boolean;
  page: number;
  results: FplH2HMatch[];
}

export interface FplPick {
  element: number;
  position: number; // 1-11 starting, 12-15 bench
  multiplier: number; // 0 bench, 1 starter, 2 captain, 3 triple captain
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface FplAutomaticSub {
  entry: number;
  element_in: number;
  element_out: number;
  event: number;
}

export interface FplEntryHistory {
  event: number;
  points: number; // net GW points, transfer cost already deducted
  total_points: number;
  event_transfers: number;
  event_transfers_cost: number;
  points_on_bench: number;
}

export interface FplPicksResponse {
  active_chip: string | null;
  automatic_subs: FplAutomaticSub[];
  entry_history: FplEntryHistory;
  picks: FplPick[];
}

export interface FplLiveElementStats {
  total_points: number;
  minutes: number;
}

export interface FplLiveResponse {
  elements: { id: number; stats: FplLiveElementStats }[];
}

// --- Our domain types ---

export type FineCode =
  | "under_30"
  | "lowest_score"
  | "h2h_loss_20"
  | "bench_15"
  | "bench_25"
  | "transfer_hit"
  | "bench_beats_starter"
  | "captain_zero"
  | "captain_negative";

export interface FineHit {
  code: FineCode;
  label: string;
  amount: number;
}

export interface ManagerGameweekResult {
  entryId: number;
  gwScore: number;
  benchPoints: number;
  transferCost: number;
  captainPoints: number;
  maxStarterPoints: number;
  maxBenchPoints: number;
  fines: FineHit[];
  total: number;
}

export interface GameweekRecord {
  status: "provisional" | "final";
  computedAt: string;
  managerResults: Record<string, ManagerGameweekResult>;
}

export interface ManagerMeta {
  entryId: number;
  managerName: string;
  teamName: string;
}

export interface FinesStore {
  leagueId: number;
  leagueName: string;
  lastUpdated: string;
  managers: Record<string, ManagerMeta>;
  gameweeks: Record<string, GameweekRecord>;
}
