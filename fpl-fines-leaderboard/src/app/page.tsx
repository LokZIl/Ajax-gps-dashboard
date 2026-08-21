import { buildLeaderboard } from "@/lib/aggregate";
import { readStore } from "@/lib/store";
import Leaderboard from "@/components/Leaderboard";
import CumulativeChart from "@/components/CumulativeChart";

const LEAGUE_ID = Number(process.env.FPL_LEAGUE_ID ?? 980155);
const NEVER_UPDATED = new Date(0).toISOString();

export default async function Home() {
  const store = await readStore(LEAGUE_ID);
  const data = buildLeaderboard(store);
  const series = data.managers.map((m) => ({ key: String(m.entryId), name: m.teamName }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
          {data.leagueName || "FPL Mini-League"}
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Fines Leaderboard
        </h1>
        <p className="mt-2 text-sm text-white/40">
          {data.lastUpdated && data.lastUpdated !== NEVER_UPDATED
            ? `Last updated ${new Date(data.lastUpdated).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}`
            : "Waiting for the first refresh."}
        </p>
      </header>

      <section className="mb-8">
        <Leaderboard managers={data.managers} />
      </section>

      <section>
        <CumulativeChart chart={data.chart} series={series} />
      </section>
    </main>
  );
}
