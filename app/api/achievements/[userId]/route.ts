import { NextResponse } from "next/server";
import { getAchievementsForUser } from "@/lib/db-data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return NextResponse.json(getAchievementsForUser(userId));
}
