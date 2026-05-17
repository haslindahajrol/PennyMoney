import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

const DB_PATH = path.join(process.cwd(), "kasi-backend", "db.json");

function readDb() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {}
  return null;
}

function writeDb(data: unknown) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const db = readDb();
  const user = db?.users?.find((u: { id: string }) => u.id === userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({
    live_lat: user.live_lat ?? user.home_lat ?? null,
    live_lng: user.live_lng ?? user.home_lng ?? null,
    home_lat: user.home_lat ?? null,
    home_lng: user.home_lng ?? null,
  }, { headers: CORS });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const { lat, lng } = await req.json();
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "lat and lng are required numbers" }, { status: 400 });
  }
  const db = readDb();
  if (!db) return NextResponse.json({ error: "db not found" }, { status: 500 });
  const user = db.users?.find((u: { id: string }) => u.id === userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  user.live_lat = lat;
  user.live_lng = lng;
  writeDb(db);
  return NextResponse.json({ ok: true, live_lat: lat, live_lng: lng }, { headers: CORS });
}
