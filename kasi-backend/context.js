import db from './db.js';

// Get financial snapshot for a user
export function getFinancialSnapshot(userId) {
  const user = db.data.users.find(u => u.id === userId);
  if (!user) return null;

  const account = db.data.accounts.find(a => a.user_id === userId);
  const transactions = db.data.transactions.filter(t => t.user_id === userId);
  const bills = db.data.bills.filter(b => b.user_id === userId);
  const budgets = db.data.budgets.filter(b => b.user_id === userId);

  // Calculate spend per category
  const spendByCategory = {};
  transactions.forEach(t => {
    spendByCategory[t.category] = (spendByCategory[t.category] || 0) + t.amount;
  });

  // Calculate budget status per category
  const budgetStatus = budgets.map(b => {
    const spent = spendByCategory[b.category] || 0;
    const percentage = Math.round((spent / b.limit) * 100);
    return {
      category: b.category,
      limit: b.limit,
      spent,
      percentage,
      over: spent > b.limit
    };
  });

  // Get bills due in next 7 days
  const today = new Date();
  const next7Days = new Date(today);
  next7Days.setDate(today.getDate() + 7);
  
  const upcomingBills = bills.filter(b => {
    const dueDate = new Date(b.due_date);
    return dueDate >= today && dueDate <= next7Days;
  });

  // Calculate days until payday
  let daysUntilPayday = null;
  if (user.payday) {
    const todayDate = today.getDate();
    if (user.payday > todayDate) {
      daysUntilPayday = user.payday - todayDate;
    } else {
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      daysUntilPayday = (daysInMonth - todayDate) + user.payday;
    }
  }

  // Recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Income history (all records, oldest first)
  const incomeHistory = (db.data.income || [])
    .filter(i => i.user_id === userId)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Saving goal progress
  const savingProgress = Math.round((user.saving_goal_saved / user.saving_goal_amount) * 100);

  return {
    user: {
      id: user.id,
      name: user.name,
      monthly_income: user.monthly_income,
      income_type: user.income_type,
      payday: user.payday,
      personality: user.personality,
      spending_weakness: user.spending_weakness,
      saving_goal: user.saving_goal,
      saving_goal_amount: user.saving_goal_amount,
      saving_goal_saved: user.saving_goal_saved,
      kasi_tone: user.kasi_tone,
      health_flag: user.health_flag || null
    },
    account: {
      balance: account.balance,
      safe_to_spend: account.safe_to_spend
    },
    budgetStatus,
    upcomingBills,
    recentTransactions,
    incomeHistory,
    daysUntilPayday,
    savingProgress
  };
}

// Format snapshot as readable text block for AI prompts
export function formatSnapshotForAI(snapshot) {
  const { user, account, budgetStatus, upcomingBills, daysUntilPayday, savingProgress } = snapshot;

  const budgetLines = budgetStatus.map(b =>
    `  - ${b.category}: RM${b.spent} / RM${b.limit} (${b.percentage}%)${b.over ? ' ⚠️ OVER BUDGET' : ''}`
  ).join('\n');

  const billLines = upcomingBills.length
    ? upcomingBills.map(b => `  - ${b.name}: RM${b.amount} due ${b.due_date}`).join('\n')
    : '  None in next 7 days';

  return `
Balance: RM${account.balance}
Safe to spend: RM${account.safe_to_spend}
Days until payday: ${daysUntilPayday ?? 'unknown'}
Saving goal: ${user.saving_goal} — ${savingProgress}% saved (RM${user.saving_goal_saved} / RM${user.saving_goal_amount})

Budget status:
${budgetLines}

Upcoming bills:
${billLines}
`.trim();
}

// Check which financial conditions should trigger a proactive nudge
export function checkNudgeTriggers(snapshot) {
  const triggers = [];
  const { account, budgetStatus, upcomingBills, daysUntilPayday } = snapshot;

  if (account.safe_to_spend < 50) {
    triggers.push({ type: 'low_safe_to_spend', message: `Safe-to-spend is critically low at RM${account.safe_to_spend}` });
  }

  budgetStatus.forEach(b => {
    if (b.over) {
      triggers.push({ type: 'over_budget', message: `${b.category} is over budget by RM${(b.spent - b.limit).toFixed(2)}` });
    } else if (b.percentage >= 80) {
      triggers.push({ type: 'near_budget_limit', message: `${b.category} is at ${b.percentage}% of budget` });
    }
  });

  if (upcomingBills.length > 0 && daysUntilPayday !== null && daysUntilPayday <= 3) {
    triggers.push({ type: 'bills_near_payday', message: `${upcomingBills.length} bill(s) due in the next 7 days and payday is in ${daysUntilPayday} day(s)` });
  }

  return triggers;
}

