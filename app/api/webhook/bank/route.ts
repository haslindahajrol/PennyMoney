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
        id:       transaction.id,
        user_id:  transaction.user_id,
        date:     transaction.date,
        merchant: transaction.merchant,
        amount:   transaction.amount,
        category: transaction.category ?? "other",
        type:     transaction.type ?? "debit",
      });
    }

    // Update account balance
    const account = db.accounts?.find((a: { user_id: string }) => a.user_id === transaction.user_id);
    if (account && data.account?.balance !== undefined) {
      account.balance = data.account.balance;
    }

    writeDb(db);
    console.log(`[WEBHOOK] Synced: ${transaction.merchant} -RM${transaction.amount} for ${transaction.user_id}`);
  }

  if (event === "balance.updated") {
    const { user_id, new_balance } = data;
    const account = db.accounts?.find((a: { user_id: string }) => a.user_id === user_id);
    if (account) {
      account.balance = new_balance;
      writeDb(db);
      console.log(`[WEBHOOK] Balance updated: ${user_id} → RM${new_balance}`);
    }
  }

  return NextResponse.json({ received: true });
}
