# FPL Fines Leaderboard

A dark-themed, auto-updating dashboard that tracks fines for FPL mini-league
980155, calculated automatically from real gameweek data.

## How it works

- **`scripts/refresh.ts`** talks to the public FPL API server-side (no CORS
  issue there — the browser never calls FPL directly), computes every fine
  in the rules table below for each manager/gameweek, and merges the result
  into `data/fines.json`. Gameweeks are marked `"provisional"` until FPL
  marks the event `finished` and `data_checked` (bonus points can still
  shift before then); once a gameweek is `"final"` it's never re-fetched.
- **`.github/workflows/refresh-fines.yml`** runs that script daily at 06:00
  UTC and commits `data/fines.json` if it changed. That's the whole
  "database" — a JSON file in git, per the brief's "keep it dead simple"
  option. No external DB/KV service to provision.
- The **Next.js app** reads `data/fines.json` straight off disk (server
  component + `/api/data` route) and renders the leaderboard. Deploying to
  Vercel just means pointing a Vercel project at this subdirectory — a new
  commit from the cron job triggers a redeploy with the latest numbers.

## Fine rules implemented

| Offence | Fine | Notes |
|---|---|---|
| Score under 30 in a GW | $5 | `entry_history.points` (net of transfer hits, matches what FPL displays) |
| Lowest score in the league that GW | $5 | all managers tied for the minimum are fined |
| Leave 15+ / 25+ points on the bench | $3 / $5 | uses FPL's own `points_on_bench` (already accounts for automatic substitutions); highest tier only |
| Take a -12+ transfer hit | $3 | `event_transfers_cost >= 12` |
| Bench player outscores best starter | $2 | compares raw (non-captain-multiplied) live points, using the effective lineup after FPL's automatic subs |
| Captain scores 0 / negative | $3 / $5 | "captain" = whoever actually received the points multiplier (handles the automatic vice-captain swap and Triple Captain chip); negative overrides zero |
| Lose by 20+ head-to-head | $3 | **not applicable** — league 980155 is a classic league, not head-to-head, so this rule is defined but never fires. The logic is isolated in `src/lib/fines.ts` if a H2H league is ever added. |

## Local development

```bash
npm install
npm run refresh   # pulls live FPL data into data/fines.json
npm run dev        # http://localhost:3000
```

`npm run build` / `npm start` for a production build.

> Note: this sandbox's outbound network policy blocks
> `fantasy.premierleague.com`, so `npm run refresh` couldn't be exercised
> against the live API here. Everything downstream of it (types, fine math,
> aggregation, UI) was verified with synthetic fixtures dropped into
> `data/fines.json`; the FPL fetch/parse layer (`src/lib/fpl.ts`) should be
> smoke-tested against the real API on first run (locally or via the GitHub
> Action, both of which have normal network access).

## Deploying

1. Create a Vercel project pointed at this repo with **Root Directory** set
   to `fpl-fines-leaderboard`.
2. No environment variables are required (`FPL_LEAGUE_ID` defaults to
   `980155`; override it if needed).
3. Merge this branch to the repo's default branch so the scheduled GitHub
   Action (which only fires on the default branch) starts committing daily
   refreshes.

## Known issue

`npm run lint` currently crashes with a circular-JSON error coming from
`eslint-config-next`'s `next/core-web-vitals` preset under `eslint@9.39.x`
(reproducible even with a stock create-next-app config) — an upstream
`eslint-plugin-react` / `FlatCompat` incompatibility, not app code. `tsc
--noEmit` and `next build` both pass cleanly, which is what CI/deploys
actually depend on.
