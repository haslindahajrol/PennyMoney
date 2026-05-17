import { NextResponse } from "next/server";
import { getBillsForUser, addBillForUser } from "@/lib/db-data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return NextResponse.json(getBillsForUser(userId));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await req.json();

  const name = (body.name ?? "").trim();
  const amount = Number(body.amount);
  const due_date = (body.due_date ?? "").trim();

  if (!name || !amount || !due_date) {
    return NextResponse.json({ error: "name, amount and due_date are required" }, { status: 400 });
  }

  const newBill = addBillForUser(userId, { name, amount, due_date });
  return NextResponse.json(newBill, { status: 201 });
}
