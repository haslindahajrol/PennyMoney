import { NextResponse } from "next/server";

const KASI_URL = process.env.KASI_URL || "http://localhost:3001";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const res = await fetch(`${KASI_URL}/nudge/${userId}`);
    if (!res.ok) return NextResponse.json({ triggered: false });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ triggered: false });
  }
}
