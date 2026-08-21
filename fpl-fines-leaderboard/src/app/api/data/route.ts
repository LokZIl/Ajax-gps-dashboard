import { NextResponse } from "next/server";
import { buildLeaderboard } from "@/lib/aggregate";
import { readStore } from "@/lib/store";

const LEAGUE_ID = Number(process.env.FPL_LEAGUE_ID ?? 980155);

export async function GET() {
  const store = await readStore(LEAGUE_ID);
  return NextResponse.json(buildLeaderboard(store));
}
