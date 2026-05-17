import { NextResponse } from "next/server";
import { resetAchievement } from "@/lib/db-data";

export async function POST() {
  resetAchievement("ach_s_me_first");
  return NextResponse.json({ ok: true });
}
