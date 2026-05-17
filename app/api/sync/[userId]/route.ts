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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    const [accRes, txnRes] = await Promise.all([
      fetch(`http://localhost:4000/api/accounts/${userId}`),
      fetch(`http://localhost:4000/api/transactions/${userId}`),
    ]);

    if (!accRes.ok) return NextResponse.json({ error: "User not found in bank" }, { status: 404 });

    const bankAccount = await accRes.json();
    const bankTxns: Array<{
      id: string; user_id: string; date: string;
      merchant: string; amount: number; category: string; type: string;
    }> = await txnRes.json();

    const db = readDb();
    if (!db) return NextResponse.json({ error: "db not found" }, { status: 500 });

    // Sync balance
    const account = db.accounts?.find((a: { user_id: string }) => a.user_id === userId);
    if (account) account.balance = bankAccount.balance;

    // Add any missing transactions
    const existingIds = new Set(db.transactions.map((t: { id: string }) => t.id));
    const newTxns = bankTxns
      .filter(t => !existingIds.has(t.id))
      .map(t => ({
        id: t.id, user_id: t.user_id, date: t.date,
        merchant: t.merchant, amount: t.amount,
        category: t.category ?? "others",
        type: t.type ?? "debit",
      }));

    if (newTxns.length > 0) {
      db.transactions.unshift(...newTxns);
      db.transactions.sort((a: { date: string }, b: { date: string }) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    writeDb(db);

    return NextResponse.json({
      synced: true,
      new_transactions: newTxns.length,
      balance: bankAccount.balance,
    });
  } catch {
    return NextResponse.json({ error: "Bank unreachable — is it running on port 4000?" }, { status: 503 });
  }
}
