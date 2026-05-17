import fs from "fs";
import path from "path";

type DbBill = { id: string; user_id: string; name: string; amount: number; due_date: string; recurring: boolean };

// Mirrors the defaultData in kasi-backend/db.js
const DEFAULT_BILLS = [
  { id: "bill_001", user_id: "user_001", name: "Room rental", amount: 300, due_date: "2024-02-01", recurring: true },
  { id: "bill_002", user_id: "user_002", name: "Studio rental", amount: 700, due_date: "2024-02-01", recurring: true },
  { id: "bill_003", user_id: "user_002", name: "Credit card", amount: 500, due_date: "2024-01-25", recurring: true },
  { id: "bill_004", user_id: "user_002", name: "Car loan", amount: 650, due_date: "2024-01-28", recurring: true },
  { id: "bill_005", user_id: "user_003", name: "Room rental", amount: 300, due_date: "2024-02-01", recurring: true },
  { id: "bill_006", user_id: "user_003", name: "Coworking workspace", amount: 200, due_date: "2024-01-17", recurring: true },
  { id: "bill_007", user_id: "user_004", name: "University dorm", amount: 400, due_date: "2024-02-01", recurring: true },
  { id: "bill_008", user_id: "user_004", name: "Rapidbus pass", amount: 30, due_date: "2024-02-01", recurring: true },
];

const DEFAULT_TRANSACTIONS = [
  { id: "txn_001", user_id: "user_001", date: "2024-01-15", merchant: "Shopee", amount: 132, category: "shopping" },
  { id: "txn_002", user_id: "user_001", date: "2024-01-14", merchant: "Grab Food", amount: 18, category: "food" },
  { id: "txn_003", user_id: "user_001", date: "2024-01-13", merchant: "Watsons", amount: 45, category: "personal" },
  { id: "txn_004", user_id: "user_002", date: "2024-01-15", merchant: "Nobu KL", amount: 380, category: "dining" },
  { id: "txn_005", user_id: "user_002", date: "2024-01-14", merchant: "Pavilion", amount: 260, category: "shopping" },
  { id: "txn_006", user_id: "user_002", date: "2024-01-13", merchant: "Marini's on 57", amount: 185, category: "entertainment" },
  { id: "txn_007", user_id: "user_003", date: "2024-01-15", merchant: "Logitech", amount: 340, category: "work_tools" },
  { id: "txn_008", user_id: "user_003", date: "2024-01-12", merchant: "Udemy", amount: 89, category: "work_tools" },
  { id: "txn_009", user_id: "user_003", date: "2024-01-10", merchant: "Adobe", amount: 52, category: "subscriptions" },
  { id: "txn_010", user_id: "user_004", date: "2024-01-15", merchant: "Kinokuniya", amount: 189, category: "hobbies" },
  { id: "txn_011", user_id: "user_004", date: "2024-01-13", merchant: "Art Friend", amount: 145, category: "hobbies" },
  { id: "txn_012", user_id: "user_004", date: "2024-01-11", merchant: "Mamak", amount: 6, category: "food" },
  { id: "txn_013", user_id: "user_004", date: "2024-01-09", merchant: "Anime Store", amount: 64, category: "hobbies" },
  { id: "txn_014", user_id: "user_004", date: "2024-01-05", merchant: "7-Eleven", amount: 20, category: "food" },
];

function readDb() {
  try {
    const dbPath = path.join(process.cwd(), "kasi-backend", "db.json");
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    }
  } catch {
    // fall through to defaults
  }
  return null;
}

export function getBillsForUser(userId: string) {
  const db = readDb();
  const bills: typeof DEFAULT_BILLS = db?.bills ?? DEFAULT_BILLS;
  return bills
    .filter((b) => b.user_id === userId)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
}

export function getTransactionsForUser(userId: string) {
  const db = readDb();
  const txns: typeof DEFAULT_TRANSACTIONS = db?.transactions ?? DEFAULT_TRANSACTIONS;
  return txns
    .filter((t) => t.user_id === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function deleteBillForUser(userId: string, billId: string): boolean {
  const dbPath = path.join(process.cwd(), "kasi-backend", "db.json");
  let db = readDb();
  if (!db) {
    db = { users: [], accounts: [], transactions: [...DEFAULT_TRANSACTIONS], bills: [...DEFAULT_BILLS], budgets: [] };
  }
  const before = (db.bills ?? []).length;
  db.bills = (db.bills ?? []).filter((b: DbBill) => !(b.id === billId && b.user_id === userId));
  if (db.bills.length === before) return false;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  return true;
}

export function getAccountForUser(userId: string) {
  const db = readDb();
  const accounts: Array<{ user_id: string; balance: number; currency: string }> = db?.accounts ?? [];
  return accounts.find((a) => a.user_id === userId) ?? null;
}

export function addBillForUser(userId: string, fields: { name: string; amount: number; due_date: string }): DbBill {
  const dbPath = path.join(process.cwd(), "kasi-backend", "db.json");
  // Seed db.json with defaults if it doesn't exist yet
  let db = readDb();
  if (!db) {
    db = { users: [], accounts: [], transactions: [...DEFAULT_TRANSACTIONS], bills: [...DEFAULT_BILLS], budgets: [] };
  }

  const newBill: DbBill = {
    id: `bill_${Date.now()}`,
    user_id: userId,
    name: fields.name,
    amount: fields.amount,
    due_date: fields.due_date,
    recurring: true,
  };

  db.bills = [...(db.bills ?? []), newBill];
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  return newBill;
}
