import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const KASI_URL = process.env.KASI_URL || 'http://localhost:3001';

type Txn = { date: string; amount: number; category: string };
type Income = { date: string; amount: number; source: string };
type HistoryMsg = { role: 'user' | 'assistant'; content: string };

function buildTxnSummary(txns: Txn[]): string {
  const byMonth: Record<string, Record<string, number>> = {};
  txns.forEach(t => {
    const month = t.date.substring(0, 7);
    if (!byMonth[month]) byMonth[month] = {};
    byMonth[month][t.category] = (byMonth[month][t.category] || 0) + t.amount;
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, cats]) => {
      const catList = Object.entries(cats)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, amt]) => `${cat}: RM${amt.toFixed(0)}`)
        .join(' | ');
      return `  ${month}: ${catList}`;
    })
    .join('\n');
}

function buildIncomeLines(income: Income[]): string {
  return income
    .map(i => `  ${i.date}: RM${i.amount} (${i.source})`)
    .join('\n');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSystemPrompt(snapshot: any, txnSummary: string, incomeLines: string): string {
  const { user, account, daysUntilPayday } = snapshot;

  const paydayLine =
    daysUntilPayday != null
      ? `${daysUntilPayday} days until next paycheck`
      : 'Freelancer — no fixed payday';

  return `You are Penny, the user's money buddy. Text like a close friend — direct, casual, zero fluff.

WHO YOU'RE TALKING TO:
Name: ${user.name}
Personality: ${user.personality}
Spending weakness: ${user.spending_weakness}${user.health_flag ? `\nHEALTH FLAG (always mention when relevant): ${user.health_flag}` : ''}
Tone to use: ${user.kasi_tone}

THEIR MONEY RIGHT NOW:
• Safe to spend: RM${account.safe_to_spend} (balance minus upcoming bills — use THIS for any "can I afford" question)
• Full balance: RM${account.balance}
• ${paydayLine}
• Savings goal: ${user.saving_goal} — RM${user.saving_goal_saved} / RM${user.saving_goal_amount}

INCOME HISTORY:
${incomeLines || '  No income records'}

SPENDING HISTORY (per category per month):
${txnSummary || '  No transaction history'}

━━━ REPLY RULES — NON-NEGOTIABLE ━━━
1. MAX 3 sentences. No exceptions. If it can be 2, make it 2.
2. Lead with the key NUMBER or FACT. Don't warm up with filler.
3. End with ONE specific action they can do TODAY. Not tomorrow, not "consider".
4. If yes/no question → first word is yes or no.
5. Spot patterns across months → say it plainly ("you do this every month").
6. Malaysian context: mention Grab, mamak, Shopee, Touch n Go by name when fitting.
7. Never write a list longer than 3 items. Pick the most important one.
8. No jargon. No headers. No bullet points in your reply — just plain sentences.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not set. Add it to .env.local and restart.' },
      { status: 500 }
    );
  }

  try {
    const { userId, message, history = [] }: { userId: string; message: string; history: HistoryMsg[] } =
      await req.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'userId and message are required' }, { status: 400 });
    }

    const [snapshotRes, txnsRes, incomeRes] = await Promise.all([
      fetch(`${KASI_URL}/dashboard/${userId}`),
      fetch(`${KASI_URL}/transactions/${userId}`),
      fetch(`${KASI_URL}/income/${userId}`),
    ]);

    if (!snapshotRes.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const snapshot = await snapshotRes.json();
    const txns: Txn[] = txnsRes.ok ? await txnsRes.json() : [];
    const income: Income[] = incomeRes.ok ? await incomeRes.json() : [];

    const txnSummary = buildTxnSummary(txns);
    const incomeLines = buildIncomeLines(income);
    const systemPrompt = buildSystemPrompt(snapshot, txnSummary, incomeLines);

    const client = new Anthropic({ apiKey });

    const claudeMessages = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: message },
    ];

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const reply =
      response.content[0].type === 'text' ? response.content[0].text : '(no response)';

    return NextResponse.json({
      reply,
      history: [
        ...history,
        { role: 'user', content: message },
        { role: 'assistant', content: reply },
      ],
    });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Check the backend is running and your API key is valid.' },
      { status: 500 }
    );
  }
}
