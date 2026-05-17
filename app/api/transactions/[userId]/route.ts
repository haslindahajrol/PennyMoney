import { NextResponse } from "next/server";
import { getTransactionsForUser } from "@/lib/db-data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const transactions = getTransactionsForUser(userId);
  return NextResponse.json(transactions);
}
