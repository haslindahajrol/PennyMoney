import { NextResponse } from "next/server";
import { markAchievementSeen } from "@/lib/db-data";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ userId: string; achievementId: string }> }
) {
  const { userId, achievementId } = await params;
  markAchievementSeen(userId, achievementId);
  return NextResponse.json({ ok: true });
}
