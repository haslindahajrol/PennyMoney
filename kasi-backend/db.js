/*import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Default data matching the schema from the spec
const defaultData = {
  users: [
    {
      id: "user_001",
      name: "Mei Ling",
      monthly_income: 2500,
      income_type: "fixed",
      payday: 28,
      personality: "Disciplined, tracks every ringgit, gets uncomfortable overspending even slightly. Loves data and affirmation.",
      spending_weakness: "Shopee flash sales — tells herself it is a good deal",
      saving_goal: "Emergency fund",
      saving_goal_amount: 10000,
      saving_goal_saved: 6200,
      kasi_tone: "Encouraging and precise. Celebrate wins. Frame issues as small tweaks."
    },
    {
      id: "user_002",
      name: "Jason",
      monthly_income: 6000,
      income_type: "fixed",
      payday: 25,
      personality: "Ambitious and lifestyle-driven. Low-key in denial. Responds better to reality checks than gentle nudges.",
      spending_weakness: "Restaurants, bars, anything that feels like a flex. Treat-yourself mode has no off switch.",
      saving_goal: "Europe trip by end of year",
      saving_goal_amount: 8000,
      saving_goal_saved: 420,
      kasi_tone: "Direct and blunt. Use contrast: 'that dinner cost you 2 days of Europe savings.' Do not sugarcoat."
    },
    {
      id: "user_003",
      name: "Hakim",
      monthly_income: 2200,
      income_type: "freelance",
      payday: null,
      personality: "Resourceful and adaptable but quietly anxious about uncertainty. Good months feel invincible, bad months spiral. Scrappy, independent, secretly wants structure but will not admit it.",
      spending_weakness: "Tools, gear, apps, courses — convinces himself every purchase is a business investment",
      saving_goal: "3-month income buffer",
      saving_goal_amount: 6000,
      saving_goal_saved: 1100,
      kasi_tone: "Grounding and practical. Think in good month vs slow month terms. Remind him a slow month could be next. Celebrate frugality."
    },
    {
      id: "user_004",
      name: "Shoko",
      monthly_income: 1300,
      income_type: "fixed",
      payday: 1,
      personality: "Creative and passionate about hobbies. Hesitant and indecisive with money. Overthinks small purchases but impulse-splurges on hobby items. Skips breakfast and dinner to fund hobbies.",
      spending_weakness: "Manga, art materials, anime merch, craft supplies — rationalises every purchase",
      saving_goal: "Build a hobby fund so she stops skipping meals",
      saving_goal_amount: 500,
      saving_goal_saved: 45,
      kasi_tone: "Big-sister energy — warm but firm. Call out meal-skipping clearly but without shame. When she hesitates, give one clear recommendation, not more options.",
      health_flag: "Known to skip breakfast and dinner to fund hobby spending. Food must always be treated as non-negotiable."
    }
  ],
  accounts: [
    { id: "acc_001", user_id: "user_001", balance: 1820, safe_to_spend: 210 },
    { id: "acc_002", user_id: "user_002", balance: 3140, safe_to_spend: 480 },
    { id: "acc_003", user_id: "user_003", balance: 980, safe_to_spend: 130 },
    { id: "acc_004", user_id: "user_004", balance: 312, safe_to_spend: 47 }
  ],
  transactions: [
    // Mei Ling's transactions
    { id: "txn_001", user_id: "user_001", date: "2024-01-15", merchant: "Shopee", amount: 132, category: "shopping" },
    { id: "txn_002", user_id: "user_001", date: "2024-01-14", merchant: "Grab Food", amount: 18, category: "food" },
    { id: "txn_003", user_id: "user_001", date: "2024-01-13", merchant: "Watsons", amount: 45, category: "personal" },
    
    // Jason's transactions
    { id: "txn_004", user_id: "user_002", date: "2024-01-15", merchant: "Nobu KL", amount: 380, category: "dining" },
    { id: "txn_005", user_id: "user_002", date: "2024-01-14", merchant: "Pavilion", amount: 260, category: "shopping" },
    { id: "txn_006", user_id: "user_002", date: "2024-01-13", merchant: "Marini's on 57", amount: 185, category: "entertainment" },
    
    // Hakim's transactions
    { id: "txn_007", user_id: "user_003", date: "2024-01-15", merchant: "Logitech", amount: 340, category: "work_tools" },
    { id: "txn_008", user_id: "user_003", date: "2024-01-12", merchant: "Udemy", amount: 89, category: "work_tools" },
    { id: "txn_009", user_id: "user_003", date: "2024-01-10", merchant: "Adobe", amount: 52, category: "subscriptions" },
    
    // Shoko's transactions
    { id: "txn_010", user_id: "user_004", date: "2024-01-15", merchant: "Kinokuniya", amount: 189, category: "hobbies" },
    { id: "txn_011", user_id: "user_004", date: "2024-01-13", merchant: "Art Friend", amount: 145, category: "hobbies" },
    { id: "txn_012", user_id: "user_004", date: "2024-01-11", merchant: "Mamak", amount: 6, category: "food" },
    { id: "txn_013", user_id: "user_004", date: "2024-01-09", merchant: "Anime Store", amount: 64, category: "hobbies" },
    { id: "txn_014", user_id: "user_004", date: "2024-01-05", merchant: "7-Eleven", amount: 20, category: "food" }
  ],
  bills: [
    // Mei Ling's bills
    { id: "bill_001", user_id: "user_001", name: "Room rental", amount: 300, due_date: "2024-02-01", recurring: true },
    
    // Jason's bills
    { id: "bill_002", user_id: "user_002", name: "Studio rental", amount: 700, due_date: "2024-02-01", recurring: true },
    { id: "bill_003", user_id: "user_002", name: "Credit card", amount: 500, due_date: "2024-01-25", recurring: true },
    { id: "bill_004", user_id: "user_002", name: "Car loan", amount: 650, due_date: "2024-01-28", recurring: true },
    
    // Hakim's bills
    { id: "bill_005", user_id: "user_003", name: "Room rental", amount: 300, due_date: "2024-02-01", recurring: true },
    { id: "bill_006", user_id: "user_003", name: "Coworking workspace", amount: 200, due_date: "2024-01-17", recurring: true },
    
    // Shoko's bills
    { id: "bill_007", user_id: "user_004", name: "University dorm", amount: 400, due_date: "2024-02-01", recurring: true },
    { id: "bill_008", user_id: "user_004", name: "Rapidbus pass", amount: 30, due_date: "2024-02-01", recurring: true }
  ],
  budgets: [
    // Mei Ling's budgets
    { user_id: "user_001", category: "food", limit: 300 },
    { user_id: "user_001", category: "shopping", limit: 100 },
    { user_id: "user_001", category: "transport", limit: 100 },
    
    // Jason's budgets
    { user_id: "user_002", category: "dining", limit: 200 },
    { user_id: "user_002", category: "shopping", limit: 200 },
    { user_id: "user_002", category: "entertainment", limit: 150 },
    
    // Hakim's budgets
    { user_id: "user_003", category: "work_tools", limit: 100 },
    { user_id: "user_003", category: "subscriptions", limit: 100 },
    { user_id: "user_003", category: "food", limit: 250 },
    
    // Shoko's budgets
    { user_id: "user_004", category: "hobbies", limit: 80 },
    { user_id: "user_004", category: "food", limit: 400 },
    { user_id: "user_004", category: "transport", limit: 50 }
  ]
};

// Initialize database
const adapter = new JSONFile('db.json');
const db = new Low(adapter, defaultData);

// Initialize db on first run
await db.read();
if (!db.data) {
  db.data = defaultData;
  await db.write();
}

export default db;
*/

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const defaultData = {
  users: [
    {
      id: "user_001",
      name: "Mei Ling",
      monthly_income: 2500,
      income_type: "fixed",
      payday: 28,
      personality: "Disciplined, tracks every ringgit, gets uncomfortable overspending even slightly. Loves data and affirmation.",
      spending_weakness: "Shopee flash sales — tells herself it is a good deal",
      saving_goal: "Emergency fund",
      saving_goal_amount: 10000,
      saving_goal_saved: 6200,
      kasi_tone: "Encouraging and precise. Celebrate wins. Frame issues as small tweaks."
    },
    {
      id: "user_002",
      name: "Jason",
      monthly_income: 6000,
      income_type: "fixed",
      payday: 25,
      personality: "Ambitious and lifestyle-driven. Low-key in denial. Responds better to reality checks than gentle nudges.",
      spending_weakness: "Restaurants, bars, anything that feels like a flex. Treat-yourself mode has no off switch.",
      saving_goal: "Europe trip by end of year",
      saving_goal_amount: 8000,
      saving_goal_saved: 420,
      kasi_tone: "Direct and blunt. Use contrast: 'that dinner cost you 2 days of Europe savings.' Do not sugarcoat."
    },
    {
      id: "user_003",
      name: "Hakim",
      monthly_income: 2200,
      income_type: "freelance",
      payday: null,
      personality: "Resourceful and adaptable but quietly anxious about uncertainty. Good months feel invincible, bad months spiral. Scrappy, independent, secretly wants structure but will not admit it.",
      spending_weakness: "Tools, gear, apps, courses — convinces himself every purchase is a business investment",
      saving_goal: "3-month income buffer",
      saving_goal_amount: 6000,
      saving_goal_saved: 1100,
      kasi_tone: "Grounding and practical. Think in good month vs slow month terms. Remind him a slow month could be next. Celebrate frugality."
    },
    {
      id: "user_004",
      name: "Shoko",
      monthly_income: 1300,
      income_type: "fixed",
      payday: 1,
      personality: "Creative and passionate about hobbies. Hesitant and indecisive with money. Overthinks small purchases but impulse-splurges on hobby items. Skips breakfast and dinner to fund hobbies.",
      spending_weakness: "Manga, art materials, anime merch, craft supplies — rationalises every purchase",
      saving_goal: "Build a hobby fund so she stops skipping meals",
      saving_goal_amount: 500,
      saving_goal_saved: 45,
      kasi_tone: "Big-sister energy — warm but firm. Call out meal-skipping clearly but without shame. When she hesitates, give one clear recommendation, not more options.",
      health_flag: "Known to skip breakfast and dinner to fund hobby spending. Food must always be treated as non-negotiable."
    }
  ],

  accounts: [
    { id: "acc_001", user_id: "user_001", balance: 1820, safe_to_spend: 210 },
    { id: "acc_002", user_id: "user_002", balance: 3140, safe_to_spend: 480 },
    { id: "acc_003", user_id: "user_003", balance: 980, safe_to_spend: 130 },
    { id: "acc_004", user_id: "user_004", balance: 312, safe_to_spend: 47 }
  ],

  transactions: [

    // ─────────────────────────────────────────────
    // MEI LING (user_001)
    // Pattern: Payday splurge on Shopee (days 28–30), then disciplined rest of month.
    // One flash sale slip mid-month. Food and transport always within budget.
    // ─────────────────────────────────────────────

    // Last month — payday splurge window (Dec 28–31)
    { id: "txn_ml_001", user_id: "user_001", date: "2024-12-28", merchant: "Shopee", amount: 78, category: "shopping", note: "payday splurge" },
    { id: "txn_ml_002", user_id: "user_001", date: "2024-12-29", merchant: "Shopee", amount: 43, category: "shopping", note: "payday splurge" },
    { id: "txn_ml_003", user_id: "user_001", date: "2024-12-30", merchant: "Grab Food", amount: 22, category: "food" },
    { id: "txn_ml_004", user_id: "user_001", date: "2024-12-31", merchant: "Watsons", amount: 38, category: "personal" },

    // Early January — disciplined, on track
    { id: "txn_ml_005", user_id: "user_001", date: "2024-01-02", merchant: "Grab Food", amount: 15, category: "food" },
    { id: "txn_ml_006", user_id: "user_001", date: "2024-01-03", merchant: "Touch n Go", amount: 20, category: "transport" },
    { id: "txn_ml_007", user_id: "user_001", date: "2024-01-04", merchant: "Aeon", amount: 55, category: "groceries" },
    { id: "txn_ml_008", user_id: "user_001", date: "2024-01-05", merchant: "Grab Food", amount: 12, category: "food" },
    { id: "txn_ml_009", user_id: "user_001", date: "2024-01-07", merchant: "KTM Komuter", amount: 8, category: "transport" },
    { id: "txn_ml_010", user_id: "user_001", date: "2024-01-08", merchant: "Chatime", amount: 9, category: "food" },
    { id: "txn_ml_011", user_id: "user_001", date: "2024-01-09", merchant: "Grab Food", amount: 18, category: "food" },
    { id: "txn_ml_012", user_id: "user_001", date: "2024-01-10", merchant: "Watsons", amount: 30, category: "personal" },

    // Mid January — flash sale slip (this is the problem transaction)
    { id: "txn_ml_013", user_id: "user_001", date: "2024-01-11", merchant: "Shopee", amount: 132, category: "shopping", note: "flash sale — over budget" },

    // Mid-late January — back to discipline after the slip
    { id: "txn_ml_014", user_id: "user_001", date: "2024-01-12", merchant: "Grab Food", amount: 14, category: "food" },
    { id: "txn_ml_015", user_id: "user_001", date: "2024-01-13", merchant: "Watsons", amount: 45, category: "personal" },
    { id: "txn_ml_016", user_id: "user_001", date: "2024-01-14", merchant: "Grab Food", amount: 18, category: "food" },
    { id: "txn_ml_017", user_id: "user_001", date: "2024-01-15", merchant: "Touch n Go", amount: 15, category: "transport" },
    { id: "txn_ml_018", user_id: "user_001", date: "2024-01-16", merchant: "Aeon", amount: 48, category: "groceries" },
    { id: "txn_ml_019", user_id: "user_001", date: "2024-01-18", merchant: "Grab Food", amount: 11, category: "food" },
    { id: "txn_ml_020", user_id: "user_001", date: "2024-01-20", merchant: "Chatime", amount: 8, category: "food" },
    { id: "txn_ml_021", user_id: "user_001", date: "2024-01-22", merchant: "KTM Komuter", amount: 10, category: "transport" },
    { id: "txn_ml_022", user_id: "user_001", date: "2024-01-24", merchant: "Grab Food", amount: 16, category: "food" },

    // ─────────────────────────────────────────────
    // JASON (user_002)
    // Pattern: Payday (25th) triggers instant lifestyle flex.
    // Weekend dining always spikes. Europe savings barely touched.
    // Denial cycle: spends big, convinces himself he'll "cut back next month."
    // ─────────────────────────────────────────────

    // Last month payday window (Dec 25–31) — immediate flex
    { id: "txn_j_001", user_id: "user_002", date: "2024-12-25", merchant: "Isetan KLCC", amount: 420, category: "shopping", note: "payday flex" },
    { id: "txn_j_002", user_id: "user_002", date: "2024-12-26", merchant: "Nobu KL", amount: 350, category: "dining", note: "payday celebration dinner" },
    { id: "txn_j_003", user_id: "user_002", date: "2024-12-27", merchant: "Grab", amount: 35, category: "transport" },
    { id: "txn_j_004", user_id: "user_002", date: "2024-12-28", merchant: "Zouk KL", amount: 180, category: "entertainment", note: "weekend night out" },
    { id: "txn_j_005", user_id: "user_002", date: "2024-12-29", merchant: "Pavilion", amount: 310, category: "shopping" },
    { id: "txn_j_006", user_id: "user_002", date: "2024-12-31", merchant: "New Year Eve dinner", amount: 290, category: "dining" },

    // Early January — slight slowdown but still over
    { id: "txn_j_007", user_id: "user_002", date: "2024-01-02", merchant: "Grab Food", amount: 45, category: "dining" },
    { id: "txn_j_008", user_id: "user_002", date: "2024-01-03", merchant: "Starbucks", amount: 28, category: "dining" },
    { id: "txn_j_009", user_id: "user_002", date: "2024-01-04", merchant: "Grab", amount: 42, category: "transport" },
    { id: "txn_j_010", user_id: "user_002", date: "2024-01-05", merchant: "Naughty Nuri's", amount: 95, category: "dining", note: "weekend" },
    { id: "txn_j_011", user_id: "user_002", date: "2024-01-06", merchant: "Marini's on 57", amount: 185, category: "entertainment", note: "weekend" },

    // Mid January — the denial phase ("I'll save next month")
    { id: "txn_j_012", user_id: "user_002", date: "2024-01-08", merchant: "Grab Food", amount: 38, category: "dining" },
    { id: "txn_j_013", user_id: "user_002", date: "2024-01-09", merchant: "Starbucks", amount: 22, category: "dining" },
    { id: "txn_j_014", user_id: "user_002", date: "2024-01-10", merchant: "Grab", amount: 30, category: "transport" },
    { id: "txn_j_015", user_id: "user_002", date: "2024-01-11", merchant: "Pavilion", amount: 260, category: "shopping" },
    { id: "txn_j_016", user_id: "user_002", date: "2024-01-12", merchant: "Jiro KL", amount: 220, category: "dining", note: "weekend flex" },
    { id: "txn_j_017", user_id: "user_002", date: "2024-01-13", merchant: "SkyBar", amount: 160, category: "entertainment", note: "weekend" },
    { id: "txn_j_018", user_id: "user_002", date: "2024-01-14", merchant: "Grab Food", amount: 35, category: "dining" },
    { id: "txn_j_019", user_id: "user_002", date: "2024-01-15", merchant: "Nobu KL", amount: 380, category: "dining", note: "latest big spend" },

    // ─────────────────────────────────────────────
    // HAKIM (user_003)
    // Pattern: Month started with a "good month" feeling → tool splurge.
    // Mid-month reality check as income uncertainty sets in.
    // Subscriptions eat budget quietly. Coworking bill due in 2 days.
    // ─────────────────────────────────────────────

    // Early January — "good month" invincibility mode
    { id: "txn_h_001", user_id: "user_003", date: "2024-01-01", merchant: "Shopee", amount: 55, category: "work_tools", note: "mouse pad and cable" },
    { id: "txn_h_002", user_id: "user_003", date: "2024-01-02", merchant: "Canva Pro", amount: 55, category: "subscriptions" },
    { id: "txn_h_003", user_id: "user_003", date: "2024-01-03", merchant: "Grab Food", amount: 18, category: "food" },
    { id: "txn_h_004", user_id: "user_003", date: "2024-01-04", merchant: "Figma", amount: 75, category: "subscriptions" },
    { id: "txn_h_005", user_id: "user_003", date: "2024-01-05", merchant: "Mamak", amount: 9, category: "food" },
    { id: "txn_h_006", user_id: "user_003", date: "2024-01-06", merchant: "Logitech", amount: 340, category: "work_tools", note: "keyboard — big splurge" },
    { id: "txn_h_007", user_id: "user_003", date: "2024-01-07", merchant: "Grab Food", amount: 15, category: "food" },
    { id: "txn_h_008", user_id: "user_003", date: "2024-01-08", merchant: "Udemy", amount: 89, category: "work_tools", note: "course — convinced himself it's investment" },
    { id: "txn_h_009", user_id: "user_003", date: "2024-01-09", merchant: "Mamak", amount: 8, category: "food" },

    // Mid January — reality creeping in, spending slows
    { id: "txn_h_010", user_id: "user_003", date: "2024-01-10", merchant: "Adobe", amount: 52, category: "subscriptions" },
    { id: "txn_h_011", user_id: "user_003", date: "2024-01-11", merchant: "Grab Food", amount: 12, category: "food" },
    { id: "txn_h_012", user_id: "user_003", date: "2024-01-12", merchant: "Mamak", amount: 7, category: "food" },
    { id: "txn_h_013", user_id: "user_003", date: "2024-01-13", merchant: "Touch n Go", amount: 15, category: "transport" },
    { id: "txn_h_014", user_id: "user_003", date: "2024-01-14", merchant: "Grab Food", amount: 14, category: "food" },

    // Late January — frugal mode, anxious, coworking bill looming
    { id: "txn_h_015", user_id: "user_003", date: "2024-01-15", merchant: "Mamak", amount: 8, category: "food" },
    { id: "txn_h_016", user_id: "user_003", date: "2024-01-16", merchant: "KTM Komuter", amount: 6, category: "transport" },

    // Last month comparison — December was a slow month (shows the spiral pattern)
    { id: "txn_h_dec_001", user_id: "user_003", date: "2023-12-05", merchant: "Shopee", amount: 220, category: "work_tools", note: "December splurge too" },
    { id: "txn_h_dec_002", user_id: "user_003", date: "2023-12-08", merchant: "Coursera", amount: 120, category: "work_tools" },
    { id: "txn_h_dec_003", user_id: "user_003", date: "2023-12-10", merchant: "Adobe", amount: 52, category: "subscriptions" },
    { id: "txn_h_dec_004", user_id: "user_003", date: "2023-12-12", merchant: "Grab Food", amount: 10, category: "food" },
    { id: "txn_h_dec_005", user_id: "user_003", date: "2023-12-15", merchant: "Mamak", amount: 7, category: "food" },
    { id: "txn_h_dec_006", user_id: "user_003", date: "2023-12-18", merchant: "Mamak", amount: 6, category: "food" },
    { id: "txn_h_dec_007", user_id: "user_003", date: "2023-12-22", merchant: "Grab Food", amount: 9, category: "food" },

    // ─────────────────────────────────────────────
    // SHOKO (user_004)
    // Pattern: Payday (1st) → immediate hobby splurge within first week.
    // Food spending drops sharply after hobbies eat the budget.
    // By mid-month she's surviving on RM 6–8 mamak meals only.
    // ─────────────────────────────────────────────

    // Payday day 1 — immediate hobby spending
    { id: "txn_s_001", user_id: "user_004", date: "2024-01-01", merchant: "Kinokuniya", amount: 89, category: "hobbies", note: "payday, first spend" },
    { id: "txn_s_002", user_id: "user_004", date: "2024-01-01", merchant: "Grab Food", amount: 18, category: "food", note: "only decent meal of month" },

    // Days 2–5 — hobby binge, food still okay
    { id: "txn_s_003", user_id: "user_004", date: "2024-01-02", merchant: "Anime Store", amount: 64, category: "hobbies" },
    { id: "txn_s_004", user_id: "user_004", date: "2024-01-02", merchant: "Mamak", amount: 8, category: "food" },
    { id: "txn_s_005", user_id: "user_004", date: "2024-01-03", merchant: "Rapidbus", amount: 5, category: "transport" },
    { id: "txn_s_006", user_id: "user_004", date: "2024-01-04", merchant: "Art Friend", amount: 145, category: "hobbies" },
    { id: "txn_s_007", user_id: "user_004", date: "2024-01-04", merchant: "7-Eleven", amount: 6, category: "food", note: "food getting cheaper" },
    { id: "txn_s_008", user_id: "user_004", date: "2024-01-05", merchant: "7-Eleven", amount: 20, category: "food" },

    // Days 9–13 — hobby budget blown, food drops to danger zone
    { id: "txn_s_009", user_id: "user_004", date: "2024-01-09", merchant: "Rapidbus", amount: 5, category: "transport" },
    { id: "txn_s_010", user_id: "user_004", date: "2024-01-11", merchant: "Mamak", amount: 6, category: "food", note: "skipping meals" },
    { id: "txn_s_011", user_id: "user_004", date: "2024-01-13", merchant: "Art Friend", amount: 145, category: "hobbies" },
    { id: "txn_s_012", user_id: "user_004", date: "2024-01-13", merchant: "Mamak", amount: 6, category: "food" },

    // Days 14–15 — nearly broke, still eyeing manga
    { id: "txn_s_013", user_id: "user_004", date: "2024-01-15", merchant: "Kinokuniya", amount: 189, category: "hobbies", note: "latest big spend, almost broke now" },

    // Last month (December) — same exact pattern, proves it's recurring
    { id: "txn_s_dec_001", user_id: "user_004", date: "2023-12-01", merchant: "Kinokuniya", amount: 95, category: "hobbies", note: "december payday spend" },
    { id: "txn_s_dec_002", user_id: "user_004", date: "2023-12-01", merchant: "Grab Food", amount: 20, category: "food" },
    { id: "txn_s_dec_003", user_id: "user_004", date: "2023-12-03", merchant: "Anime Store", amount: 78, category: "hobbies" },
    { id: "txn_s_dec_004", user_id: "user_004", date: "2023-12-04", merchant: "Mamak", amount: 8, category: "food" },
    { id: "txn_s_dec_005", user_id: "user_004", date: "2023-12-06", merchant: "Art Friend", amount: 120, category: "hobbies" },
    { id: "txn_s_dec_006", user_id: "user_004", date: "2023-12-10", merchant: "Mamak", amount: 6, category: "food", note: "food dropping" },
    { id: "txn_s_dec_007", user_id: "user_004", date: "2023-12-14", merchant: "Mamak", amount: 6, category: "food" },
    { id: "txn_s_dec_008", user_id: "user_004", date: "2023-12-18", merchant: "7-Eleven", amount: 5, category: "food", note: "surviving on convenience store food" },
    { id: "txn_s_dec_009", user_id: "user_004", date: "2023-12-22", merchant: "Mamak", amount: 6, category: "food" }
  ],

  bills: [
    // Mei Ling
    { id: "bill_001", user_id: "user_001", name: "Room rental", amount: 300, due_date: "2024-02-01", recurring: true },

    // Jason
    { id: "bill_002", user_id: "user_002", name: "Studio rental", amount: 700, due_date: "2024-02-01", recurring: true },
    { id: "bill_003", user_id: "user_002", name: "Credit card", amount: 500, due_date: "2024-01-25", recurring: true },
    { id: "bill_004", user_id: "user_002", name: "Car loan", amount: 650, due_date: "2024-01-28", recurring: true },

    // Hakim
    { id: "bill_005", user_id: "user_003", name: "Room rental", amount: 300, due_date: "2024-02-01", recurring: true },
    { id: "bill_006", user_id: "user_003", name: "Coworking workspace", amount: 200, due_date: "2024-01-17", recurring: true },

    // Shoko
    { id: "bill_007", user_id: "user_004", name: "University dorm", amount: 400, due_date: "2024-02-01", recurring: true },
    { id: "bill_008", user_id: "user_004", name: "Rapidbus pass", amount: 30, due_date: "2024-02-01", recurring: true }
  ],

  budgets: [
    // Mei Ling
    { user_id: "user_001", category: "food", limit: 300 },
    { user_id: "user_001", category: "shopping", limit: 100 },
    { user_id: "user_001", category: "transport", limit: 100 },

    // Jason
    { user_id: "user_002", category: "dining", limit: 200 },
    { user_id: "user_002", category: "shopping", limit: 200 },
    { user_id: "user_002", category: "entertainment", limit: 150 },

    // Hakim
    { user_id: "user_003", category: "work_tools", limit: 100 },
    { user_id: "user_003", category: "subscriptions", limit: 100 },
    { user_id: "user_003", category: "food", limit: 250 },

    // Shoko
    { user_id: "user_004", category: "hobbies", limit: 80 },
    { user_id: "user_004", category: "food", limit: 400 },
    { user_id: "user_004", category: "transport", limit: 50 }
  ],

  malls: [
    { id: "mall_001", name: "Suria KLCC",             lat: 3.1578, lng: 101.7123, type: "luxury" },
    { id: "mall_002", name: "Pavilion KL",             lat: 3.1488, lng: 101.7133, type: "luxury" },
    { id: "mall_003", name: "Starhill Gallery",        lat: 3.1491, lng: 101.7108, type: "luxury" },
    { id: "mall_004", name: "The Gardens Mall",        lat: 3.1185, lng: 101.6771, type: "luxury" },
    { id: "mall_005", name: "Mid Valley Megamall",     lat: 3.1178, lng: 101.6769, type: "mall" },
    { id: "mall_006", name: "1 Utama Shopping Centre", lat: 3.1503, lng: 101.6151, type: "mall" },
    { id: "mall_007", name: "Sunway Pyramid",          lat: 3.0733, lng: 101.6058, type: "mall" }
  ]
};

const adapter = new JSONFile('db.json');
const db = new Low(adapter, defaultData);

await db.read();
if (!db.data) {
  db.data = defaultData;
  await db.write();
} else {
  let dirty = false;
  if (!db.data.users || db.data.users.length === 0) {
    db.data.users = defaultData.users;
    dirty = true;
  }
  if (!db.data.budgets || db.data.budgets.length === 0) {
    db.data.budgets = defaultData.budgets;
    dirty = true;
  }
  if (!db.data.malls || db.data.malls.length === 0) {
    db.data.malls = defaultData.malls;
    dirty = true;
  }
  // Ensure accounts have id and safe_to_spend
  db.data.accounts = db.data.accounts.map((acc) => {
    const seed = defaultData.accounts.find(a => a.user_id === acc.user_id);
    if (!acc.id || acc.safe_to_spend === undefined) {
      dirty = true;
      return { id: seed?.id ?? acc.user_id, safe_to_spend: seed?.safe_to_spend ?? acc.balance, ...acc };
    }
    return acc;
  });
  // Ensure users have home/live location fields
  const locationDefaults = {
    user_001: { home_lat: 3.0838, home_lng: 101.7471 },
    user_002: { home_lat: 3.1729, home_lng: 101.6481 },
    user_003: { home_lat: 3.1160, home_lng: 101.6357 },
    user_004: { home_lat: 3.2109, home_lng: 101.7449 },
  };
  db.data.users = db.data.users.map((u) => {
    const loc = locationDefaults[u.id];
    if (loc && u.home_lat === undefined) {
      dirty = true;
      return { ...u, home_lat: loc.home_lat, home_lng: loc.home_lng, live_lat: loc.home_lat, live_lng: loc.home_lng };
    }
    return u;
  });
  if (dirty) await db.write();
}

export default db;