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
    daysUntilPayday,
    savingProgress
  };
}

