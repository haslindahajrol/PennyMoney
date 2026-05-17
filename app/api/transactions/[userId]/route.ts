import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "kasi-backend", "db.json");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    const txns = (db.transactions ?? [])
      .filter((t: { user_id: string }) => t.user_id === userId)
      .sort((a: { date: string; created_at?: string }, b: { date: string; created_at?: string }) => {
        const aTime = a.created_at ?? a.date;
        const bTime = b.created_at ?? b.date;
        return bTime.localeCompare(aTime);
      });
    return NextResponse.json(txns, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
