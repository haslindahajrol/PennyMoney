import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "kasi-backend", "db.json");

function readFromDb(userId: string) {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const db = JSON.parse(raw);
    return db.accounts?.find((a: { user_id: string }) => a.user_id === userId) ?? null;
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Read directly from db.json — the webhook writes here, so this is always current
  const account = readFromDb(userId);
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  return NextResponse.json(account, {
    headers: { "Cache-Control": "no-store" },
  });
}
