import { NextResponse } from "next/server";
import { getAccountForUser } from "@/lib/db-data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const account = getAccountForUser(userId);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  return NextResponse.json(account);
}
