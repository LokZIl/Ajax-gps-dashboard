import type { LeaderboardManager } from "@/lib/aggregate";
import ManagerRow from "./ManagerRow";

export default function Leaderboard({ managers }: { managers: LeaderboardManager[] }) {
  if (managers.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center text-white/40">
        No managers found yet. Run the refresh script once the season kicks off.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {managers.map((manager, i) => (
        <ManagerRow key={manager.entryId} manager={manager} rank={i + 1} />
      ))}
    </div>
  );
}
