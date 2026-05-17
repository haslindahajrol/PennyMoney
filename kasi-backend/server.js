import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import { getFinancialSnapshot } from './context.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Kasi backend running', users: db.data.users.length });
});

// Get all users (for login selection)
app.get('/users', (req, res) => {
  const users = db.data.users.map(u => ({
    id: u.id,
    name: u.name
  }));
  res.json(users);
});

// Get dashboard data for a user
app.get('/dashboard/:userId', (req, res) => {
  const { userId } = req.params;
  const snapshot = getFinancialSnapshot(userId);
  
  if (!snapshot) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(snapshot);
});

// ── POST /webhook/bank ────────────────────────────────────────────────────────
// The dummy bank fires here on every new transaction or balance change
app.post("/webhook/bank", async (req, res) => {
  const { event, data } = req.body;
  if (!event || !data) return res.status(400).json({ error: "invalid payload" });

  await db.read();

  if (event === "transaction.created") {
    const { transaction } = data;

    const exists = db.data.transactions.find(t => t.id === transaction.id);
    if (!exists) {
      db.data.transactions.unshift({
        id:         transaction.id,
        user_id:    transaction.user_id,
        date:       transaction.date,
        merchant:   transaction.merchant,
        amount:     transaction.amount,
        category:   transaction.category,
        type:       transaction.type,
        created_at: transaction.created_at,
      });
    }

    const account = db.data.accounts.find(a => a.user_id === transaction.user_id);
    if (account) {
      account.balance = data.account.balance;
      const today = new Date().toISOString().split("T")[0];
      const upcomingBills = db.data.bills.filter(
        b => b.user_id === transaction.user_id && b.due_date >= today
      );
      const totalBills = upcomingBills.reduce((sum, b) => sum + b.amount, 0);
      account.safe_to_spend = Math.max(0,
        parseFloat((account.balance - totalBills).toFixed(2))
      );
    }

    await db.write();
    console.log(`[WEBHOOK] New transaction synced: ${transaction.merchant} RM ${transaction.amount}`);
  }

  if (event === "balance.updated") {
    const { user_id, new_balance } = data;
    const account = db.data.accounts.find(a => a.user_id === user_id);
    if (account) {
      account.balance = new_balance;
      const today = new Date().toISOString().split("T")[0];
      const upcomingBills = db.data.bills.filter(
        b => b.user_id === user_id && b.due_date >= today
      );
      const totalBills = upcomingBills.reduce((sum, b) => sum + b.amount, 0);
      account.safe_to_spend = Math.max(0,
        parseFloat((new_balance - totalBills).toFixed(2))
      );
      await db.write();
      console.log(`[WEBHOOK] Balance updated: ${user_id} → RM ${new_balance}`);
    }
  }

  res.json({ received: true });
});

// ── GET /sync/:userId ─────────────────────────────────────────────────────────
// Manual sync — pulls latest data from the bank's REST API
app.get("/sync/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [accRes, txnRes] = await Promise.all([
      fetch(`http://localhost:4000/api/accounts/${userId}`),
      fetch(`http://localhost:4000/api/transactions/${userId}`),
    ]);

    if (!accRes.ok) return res.status(404).json({ error: "User not found in bank" });

    const bankAccount = await accRes.json();
    const bankTxns    = await txnRes.json();

    await db.read();

    const account = db.data.accounts.find(a => a.user_id === userId);
    if (account) {
      account.balance = bankAccount.balance;
      const today = new Date().toISOString().split("T")[0];
      const bills = db.data.bills.filter(b => b.user_id === userId && b.due_date >= today);
      const totalBills = bills.reduce((s, b) => s + b.amount, 0);
      account.safe_to_spend = Math.max(0, parseFloat((bankAccount.balance - totalBills).toFixed(2)));
    }

    const existingIds = new Set(db.data.transactions.map(t => t.id));
    const newTxns = bankTxns
      .filter(t => !existingIds.has(t.id))
      .map(t => ({
        id: t.id, user_id: t.user_id, date: t.date,
        merchant: t.merchant, amount: t.amount,
        category: t.category, type: t.type,
        created_at: t.created_at,
      }));

    if (newTxns.length > 0) {
      db.data.transactions.unshift(...newTxns);
      db.data.transactions.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );
    }

    await db.write();
    res.json({
      synced: true,
      new_transactions: newTxns.length,
      balance: bankAccount.balance,
      safe_to_spend: account?.safe_to_spend,
    });
  } catch (err) {
    res.status(500).json({ error: "Bank unreachable. Is it running on port 4000?" });
  }
});

// ── GET /transactions/:userId ─────────────────────────────────────────────────
// Returns all transactions for a user, sorted oldest-first for AI analysis
app.get('/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  const txns = db.data.transactions
    .filter(t => t.user_id === userId)
    .sort((a, b) => a.date.localeCompare(b.date));
  res.json(txns);
});

// ── GET /income/:userId ───────────────────────────────────────────────────────
app.get('/income/:userId', (req, res) => {
  const { userId } = req.params;
  const income = (db.data.income || [])
    .filter(i => i.user_id === userId)
    .sort((a, b) => a.date.localeCompare(b.date));
  res.json(income);
});

app.listen(PORT, () => {
  console.log(`Kasi backend running on http://localhost:${PORT}`);
});
