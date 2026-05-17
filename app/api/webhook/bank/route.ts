import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "kasi-backend", "db.json");

function readDb() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch { }
  return null;
}

function writeDb(data: unknown) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export async function POST(req: Request) {
  const body = await req.json();
  const { event, data } = body;

  if (!event || !data) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const db = readDb();
  if (!db) return NextResponse.json({ error: "database not found" }, { status: 500 });

  if (event === "transaction.created") {
    const { transaction } = data;

    // Add transaction if it doesn't already exist
    const exists = db.transactions?.find((t: { id: string }) => t.id === transaction.id);
    if (!exists) {
      db.transactions = db.transactions ?? [];
      db.transactions.unshift({
        id:         transaction.id,
        user_id:    transaction.user_id,
        date:       transaction.date,
        merchant:   transaction.merchant,
        amount:     transaction.amount,
        category:   transaction.category ?? "other",
        type:       transaction.type ?? "debit",
        created_at: transaction.created_at ?? new Date().toISOString(),
      });
    }

    // Update account balance and recalculate safe_to_spend
    const account = db.accounts?.find((a: { user_id: string }) => a.user_id === transaction.user_id);
    if (account && data.account?.balance !== undefined) {
      account.balance = data.account.balance;
      const today = new Date().toISOString().split("T")[0];
      const bills = (db.bills ?? []).filter((b: { user_id: string; due_date: string }) => b.user_id === transaction.user_id && b.due_date >= today);
      const totalBills = bills.reduce((sum: number, b: { amount: number }) => sum + b.amount, 0);
      account.safe_to_spend = Math.max(0, parseFloat((account.balance - totalBills).toFixed(2)));
    }

    // Grant "Me First!" achievement when Shoko spends on food
    if (transaction.user_id === 'user_004' && transaction.category === 'food') {
      const ach = (db.achievements ?? []).find((a: { id: string }) => a.id === 'ach_s_me_first');
      if (ach && !ach.earned_at) {
        ach.earned_at = transaction.date;
        ach.seen = false;
      }
    }

    writeDb(db);
    console.log(`[WEBHOOK] Synced: ${transaction.merchant} -RM${transaction.amount} for ${transaction.user_id}`);
  }

  if (event === "balance.updated") {
    const { user_id, new_balance } = data;
    const account = db.accounts?.find((a: { user_id: string }) => a.user_id === user_id);
    if (account) {
      account.balance = new_balance;
      const today = new Date().toISOString().split("T")[0];
      const bills = (db.bills ?? []).filter((b: { user_id: string; due_date: string }) => b.user_id === user_id && b.due_date >= today);
      const totalBills = bills.reduce((sum: number, b: { amount: number }) => sum + b.amount, 0);
      account.safe_to_spend = Math.max(0, parseFloat((new_balance - totalBills).toFixed(2)));
      writeDb(db);
      console.log(`[WEBHOOK] Balance updated: ${user_id} → RM${new_balance}, safe_to_spend → RM${account.safe_to_spend}`);
    }
  }

  return NextResponse.json({ received: true });
}
