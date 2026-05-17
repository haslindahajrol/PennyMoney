import { NextResponse } from "next/server";
import { deleteBillForUser } from "@/lib/db-data";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string; billId: string }> }
) {
  const { userId, billId } = await params;
  const deleted = deleteBillForUser(userId, billId);
  if (!deleted) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
