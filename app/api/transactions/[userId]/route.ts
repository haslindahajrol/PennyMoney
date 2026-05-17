import { NextResponse } from "next/server";

const KASI_URL = process.env.KASI_URL || "http://localhost:3001";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const res = await fetch(`${KASI_URL}/transactions/${userId}`);
    if (!res.ok) return NextResponse.json([], { status: 200 });
    const txns = await res.json();
    txns.sort((a: { date: string }, b: { date: string }) => b.date.localeCompare(a.date));
    return NextResponse.json(txns);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
