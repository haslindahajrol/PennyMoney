import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

const DB_PATH = path.join(process.cwd(), "kasi-backend", "db.json");

const DEFAULT_MALLS = [
  { id: "mall_001", name: "Suria KLCC",             lat: 3.1578, lng: 101.7123, type: "luxury" },
  { id: "mall_002", name: "Pavilion KL",             lat: 3.1488, lng: 101.7133, type: "luxury" },
  { id: "mall_003", name: "Starhill Gallery",        lat: 3.1491, lng: 101.7108, type: "luxury" },
  { id: "mall_004", name: "The Gardens Mall",        lat: 3.1185, lng: 101.6771, type: "luxury" },
  { id: "mall_005", name: "Mid Valley Megamall",     lat: 3.1178, lng: 101.6769, type: "mall" },
  { id: "mall_006", name: "1 Utama Shopping Centre", lat: 3.1503, lng: 101.6151, type: "mall" },
  { id: "mall_007", name: "Sunway Pyramid",          lat: 3.0733, lng: 101.6058, type: "mall" },
];

export async function GET() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      if (db?.malls?.length) return NextResponse.json(db.malls, { headers: CORS });
    }
  } catch {}
  return NextResponse.json(DEFAULT_MALLS, { headers: CORS });
}
