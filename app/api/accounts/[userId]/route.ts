import { NextResponse } from "next/server";

const KASI_URL = process.env.KASI_URL || "http://localhost:3001";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const res = await fetch(`${KASI_URL}/dashboard/${userId}`);
    if (!res.ok) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    const snapshot = await res.json();
    return NextResponse.json(snapshot.account);
  } catch {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
