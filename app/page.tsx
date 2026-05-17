"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  Home,
  Wallet,
  MessageSquare,
  Target,
  User,
  TrendingUp,
  AlertTriangle,
  Calendar,
  CreditCard,
  Clock,
  LogOut,
  Plus,
  ChevronRight,
  Send,
  Pencil,
  Trash2,
  Check,
  Undo2,
  Bell,
  Moon,
  Shield,
  HelpCircle,
  Banknote,
  PiggyBank,
  BookOpen,
  Briefcase,
  MapPin,
  ArrowLeft,
} from "lucide-react";

// ─── Theme ─────────────────────────────────────────────────────────────────
// Matcha green + white jasmine palette
// bg:      #F7F9EE  (jasmine)
// card:    #FFFFFF  (white)
// card2:   #EEF3E3  (light jasmine)
// border:  #C8E0A8  (soft matcha border)
// matcha:  #5D8733  (accent)
// text:    #1B2A16  (dark forest)
// muted:   #748A68  (sage)
// faint:   #9DAD8F  (lighter sage)

// ─── Data ──────────────────────────────────────────────────────────────────

const TEST_USERS = [
  {
    id: "user_001",
    name: "Mei Ling",
    avatar: "/mei-ling.jpg",
    role: "Full-time employee",
    balance: 1800,
    available: 700,
    savings: 1100,
    monthlyIncome: 2500,
    payday: 28,
    incomeType: "fixed" as const,
    budgetAlert: "Shopping 32% over budget (RM 132 vs RM 100 limit).",
    status: "warning" as const,
  },
  {
    id: "user_002",
    name: "Jason",
    avatar: "/jason.jpg",
    role: "Full-time employee",
    balance: 3140,
    available: 480,
    savings: 500,
    monthlyIncome: 6000,
    payday: 25,
    incomeType: "fixed" as const,
    budgetAlert:
      "Dining 90% over budget (RM 380 vs RM 200 limit). Shopping 30% over budget (RM 260 vs RM 200...",
    status: "danger" as const,
  },
  {
    id: "user_003",
    name: "Hakim",
    avatar: "/hakim.jpg",
    role: "Freelancer, variable income",
    balance: 980,
    available: 130,
    savings: 200,
    monthlyIncome: 2200,
    payday: null,
    incomeType: "freelance" as const,
    budgetAlert: "Work tools 329% over budget (RM 429 vs RM 100 limit).",
    status: "danger" as const,
  },
  {
    id: "user_004",
    name: "Shoko",
    avatar: "/shoko.jpg",
    role: "Full-time employee",
    balance: 312,
    available: 47,
    savings: 80,
    monthlyIncome: 1300,
    payday: 1,
    incomeType: "fixed" as const,
    budgetAlert: "Hobbies 398% over budget (RM 398 vs RM 80 limit).",
    status: "danger" as const,
  },
];

type Bill = { id: string; user_id: string; name: string; amount: number; due_date: string; recurring: boolean };
type Transaction = { id: string; user_id: string; date: string; merchant: string; amount: number; category: string; type: "credit" | "debit" };
type Achievement = { id: string; name: string; description: string; voucher_code: string; voucher_desc: string; earned_at: string; seen: boolean };


// ─── Helpers ───────────────────────────────────────────────────────────────

function fmt(amount: number) {
  return `RM ${amount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function daysUntilPayday(payday: number | null): number | null {
  if (!payday) return null;
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), payday);
  if (thisMonth <= today) {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, payday);
    return Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((thisMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-MY", { month: "short", day: "numeric" });
}

function daysUntilBillDue(dueDate: string): number {
  const dueDay = new Date(dueDate + "T00:00:00").getDate();
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (thisMonth <= today) {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
    return Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((thisMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getBillStyle(name: string): { icon: ReactNode; color: string } {
  const n = name.toLowerCase();
  if (n.includes("credit") || n.includes("card"))
    return { icon: <CreditCard size={18} />, color: "bg-red-500" };
  if (n.includes("car") || n.includes("loan"))
    return { icon: <Banknote size={18} />, color: "bg-orange-500" };
  if (n.includes("cowork") || n.includes("workspace") || n.includes("studio"))
    return { icon: <Briefcase size={18} />, color: "bg-purple-500" };
  if (n.includes("university") || n.includes("school") || n.includes("dorm"))
    return { icon: <BookOpen size={18} />, color: "bg-amber-500" };
  if (n.includes("bus") || n.includes("rapid") || n.includes("pass") || n.includes("transport"))
    return { icon: <MapPin size={18} />, color: "bg-teal-600" };
  if (n.includes("rental") || n.includes("rent") || n.includes("room"))
    return { icon: <Home size={18} />, color: "bg-blue-500" };
  return { icon: <PiggyBank size={18} />, color: "bg-[#5D8733]" };
}

// ─── Bottom Nav ────────────────────────────────────────────────────────────

type Tab = "home" | "wallet" | "chat" | "contributions" | "profile";

function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home size={20} /> },
    { id: "wallet", label: "Wallet", icon: <Wallet size={20} /> },
    { id: "chat", label: "Chat", icon: <MessageSquare size={20} /> },
    { id: "contributions", label: "Contributions", icon: <Target size={20} /> },
    { id: "profile", label: "Profile", icon: <User size={20} /> },
  ];
  return (
    <nav className="flex items-center border-t border-[#C8E0A8] bg-white">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] transition-colors ${
            active === t.id ? "text-[#5D8733]" : "text-[#9DAD8F]"
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </nav>
  );
}

// ─── Login Screen ──────────────────────────────────────────────────────────

function LoginScreen({ onSelect }: { onSelect: (user: (typeof TEST_USERS)[0]) => void }) {
  return (
    <div className="flex flex-col flex-1 bg-[#F7F9EE]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#7AAD47] to-[#5D8733] rounded-b-3xl px-6 pt-14 pb-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
          <Wallet size={28} className="text-white" />
        </div>
        <h1 className="text-white text-2xl font-bold">Penny</h1>
        <p className="text-white/80 text-sm mt-1">Tap an account to get started</p>
      </div>

      <div className="flex-1 px-4 pt-6 pb-4 overflow-y-auto">
        <p className="text-[#748A68] text-xs uppercase tracking-wider mb-3 px-1">Test Accounts</p>
        <div className="space-y-3">
          {TEST_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className="w-full text-left p-4 rounded-2xl border border-[#C8E0A8] bg-white hover:border-[#5D8733] hover:bg-[#5D8733]/5 active:scale-[0.98] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EEF3E3] flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.removeAttribute("style");
                    }}
                  />
                  <span style={{ display: "none" }} className="text-[#748A68] text-sm font-bold">{user.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[#1B2A16] font-semibold">{user.name}</span>
                    <div className="flex items-center gap-1.5">
                      {user.status === "warning" ? (
                        <TrendingUp size={14} className="text-[#5D8733]" />
                      ) : (
                        <AlertTriangle size={14} className="text-red-400" />
                      )}
                      <ChevronRight size={14} className="text-[#9DAD8F]" />
                    </div>
                  </div>
                  <p className="text-[#748A68] text-xs mt-0.5">{user.role}</p>
                  <p className="text-[#748A68] text-xs mt-0.5 truncate">{user.budgetAlert}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="pb-4 text-center">
        <a href="/demo.html" className="text-[#C8E0A8] text-[10px] hover:text-[#748A68]">⚙ demo controls</a>
      </div>
    </div>
  );
}

// ─── Home Screen ───────────────────────────────────────────────────────────

type Mall = { id: string; name: string; lat: number; lng: number; type: string };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function HomeScreen({
  user,
  onLogout,
  onTabChange,
  onSeeAllTransactions,
}: {
  user: (typeof TEST_USERS)[0];
  onLogout: () => void;
  onTabChange: (t: Tab) => void;
  onSeeAllTransactions: () => void;
}) {
  const days = daysUntilPayday(user.payday);
  const [bills, setBills] = useState<Bill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [nearbyMall, setNearbyMall] = useState<Mall | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [aiNudge, setAiNudge] = useState<string | null>(null);
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [voucherCopied, setVoucherCopied] = useState(false);
  const [copiedVoucherId, setCopiedVoucherId] = useState<string | null>(null);

  useEffect(() => {
    function checkAchievements() {
      fetch(`/api/achievements/${user.id}`)
        .then((r) => r.json())
        .then((list: Achievement[]) => {
          setEarnedAchievements(list);
          const unseen = list.find((a) => !a.seen);
          if (unseen) setAchievement((prev) => prev ?? unseen);
        })
        .catch(() => null);
    }
    checkAchievements();
    const interval = setInterval(checkAchievements, 4000);
    return () => clearInterval(interval);
  }, [user.id]);

  function dismissAchievement() {
    if (!achievement) return;
    fetch(`/api/achievements/${user.id}/${achievement.id}/seen`, { method: "POST" }).catch(() => null);
    setAchievement(null);
    setVoucherCopied(false);
  }

  function copyVoucher(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setVoucherCopied(true);
      setTimeout(() => setVoucherCopied(false), 2000);
    });
  }

  function copyVoucherById(id: string, code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedVoucherId(id);
      setTimeout(() => setCopiedVoucherId(null), 2000);
    });
  }

  useEffect(() => {
    setLoadingBills(true);
    fetch(`/api/bills/${user.id}`)
      .then((r) => r.json())
      .then((data) => setBills(data))
      .finally(() => setLoadingBills(false));
  }, [user.id]);

  useEffect(() => {
    setLoadingTxns(true);
    fetch(`/api/transactions/${user.id}`)
      .then((r) => r.json())
      .then((data) => setTransactions(data))
      .finally(() => setLoadingTxns(false));
  }, [user.id]);

  useEffect(() => {
    fetch(`/api/accounts/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.balance !== undefined) setLiveBalance(data.balance);
      });
  }, [user.id]);

  // Check proximity to malls every 8 seconds
  useEffect(() => {
    let malls: Mall[] = [];
    fetch("/api/malls").then((r) => r.json()).then((data) => { malls = data; });

    function checkProximity() {
      if (!malls.length) return;
      fetch(`/api/location/${user.id}`)
        .then((r) => r.json())
        .then((loc) => {
          if (!loc.live_lat || !loc.live_lng) return;
          const found = malls.find(
            (m) => haversineKm(loc.live_lat, loc.live_lng, m.lat, m.lng) <= 2
          ) ?? null;
          setNearbyMall((prev) => {
            if (found?.id !== prev?.id) setAlertDismissed(false);
            return found;
          });
        });
    }

    checkProximity();
    const interval = setInterval(checkProximity, 8000);
    return () => clearInterval(interval);
  }, [user.id]);

  // Poll AI location nudge when user is near a mall; AI message takes priority over hardcoded text
  useEffect(() => {
    if (!nearbyMall || alertDismissed) return;
    fetch(`/api/nudge/${user.id}`)
      .then((r) => r.json())
      .then((data) => { if (data?.triggered && data?.message) setAiNudge(data.message); })
      .catch(() => null);
    const interval = setInterval(() => {
      fetch(`/api/nudge/${user.id}`)
        .then((r) => r.json())
        .then((data) => { if (data?.triggered && data?.message) setAiNudge(data.message); })
        .catch(() => null);
    }, 30000);
    return () => clearInterval(interval);
  }, [nearbyMall, alertDismissed, user.id]);

  // Auto-refresh every 10 seconds to pick up bank webhook updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      fetch(`/api/transactions/${user.id}`)
        .then((r) => r.json())
        .then((data) => setTransactions(data));
      fetch(`/api/bills/${user.id}`)
        .then((r) => r.json())
        .then((data) => setBills(data));
      fetch(`/api/accounts/${user.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.balance !== undefined) setLiveBalance(data.balance);
        });
    }, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  return (
    <>
    {/* Achievement Modal */}
    {achievement && (
      <div className="absolute inset-0 z-50 flex items-end justify-center pb-6 px-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-[360px]">
          <div className="text-center mb-4">
            <span className="text-4xl">🎉</span>
            <p className="text-[#748A68] text-[10px] uppercase tracking-widest font-semibold mt-1">Achievement Unlocked</p>
          </div>
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-[#7AAD47] to-[#3A5C20] rounded-2xl px-8 py-4 flex flex-col items-center gap-2 shadow-lg">
              <span className="text-3xl">🏅</span>
              <span className="text-white font-bold text-lg tracking-wide">{achievement.name}</span>
              <span className="text-white/80 text-xs text-center">{achievement.description}</span>
            </div>
          </div>
          <p className="text-[#1B2A16] text-sm text-center mb-4 leading-relaxed">
            Yes Shoko! You actually bought a proper meal — that&apos;s the most important thing.
            Your body thanks you. Keep feeding yourself first, always.
          </p>
          <div className="bg-[#EEF3E3] border border-dashed border-[#5D8733] rounded-2xl p-4 mb-4">
            <p className="text-[#748A68] text-[10px] uppercase tracking-wider mb-1">Your Reward</p>
            <p className="text-[#1B2A16] font-semibold text-sm mb-2">{achievement.voucher_desc}</p>
            <div className="bg-white rounded-xl px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-[#5D8733] font-bold text-sm tracking-widest">{achievement.voucher_code}</span>
              <button
                onClick={() => copyVoucher(achievement.voucher_code)}
                className="text-xs text-[#748A68] hover:text-[#5D8733] font-medium shrink-0"
              >
                {voucherCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <button
            onClick={dismissAchievement}
            className="w-full bg-[#5D8733] text-white rounded-2xl py-3 font-semibold text-sm active:scale-[0.98] transition-transform"
          >
            Awesome, thanks!
          </button>
        </div>
      </div>
    )}
    <div className="flex-1 overflow-y-auto bg-[#F7F9EE] px-4 pt-6 pb-4 space-y-4">
      {/* Proximity Alert — AI-generated message takes priority over hardcoded fallback */}
      {nearbyMall && !alertDismissed && (
        <div className="mx-0 -mt-2 bg-amber-50 border border-amber-300 rounded-2xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-800 text-sm font-semibold">Heads up, {user.name.split(" ")[0]}!</p>
            <p className="text-amber-700 text-xs mt-0.5">
              {aiNudge ?? <>Near <span className="font-semibold">{nearbyMall.name}</span> — you have <span className="font-semibold">{fmt(Math.max(0, (liveBalance ?? user.balance) - user.savings))}</span> safe to spend.</>}
            </p>
          </div>
          <button onClick={() => { setAlertDismissed(true); setAiNudge(null); }} className="text-amber-400 hover:text-amber-600 text-lg leading-none">✕</button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#748A68] text-sm">Good evening</p>
          <h1 className="text-[#1B2A16] text-2xl font-bold">{user.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLogout} className="w-9 h-9 rounded-full bg-[#EEF3E3] flex items-center justify-center">
            <LogOut size={16} className="text-[#748A68]" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#5D8733] flex items-center justify-center overflow-hidden">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.removeAttribute("style");
              }}
            />
            <span style={{ display: "none" }} className="text-white text-sm font-bold">{user.name[0]}</span>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      {earnedAchievements.length > 0 && (
        <div className="bg-white border border-[#C8E0A8] rounded-2xl p-4">
          <p className="text-[#748A68] text-xs uppercase tracking-wider mb-3">Achievements</p>
          <div className="flex gap-4 flex-wrap">
            {earnedAchievements.map((ach) => (
              <div key={ach.id} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7AAD47] to-[#3A5C20] flex items-center justify-center shadow-md">
                  <span className="text-2xl">🏅</span>
                </div>
                <span className="text-[#1B2A16] text-[10px] font-semibold text-center leading-tight max-w-[56px]">{ach.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#C8E0A8] rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-[#748A68] text-xs mb-2">
            <CreditCard size={12} /> Safe to spend
          </div>
          <p className="text-[#1B2A16] text-xl font-bold">{fmt(Math.max(0, (liveBalance ?? user.balance) - user.savings))}</p>
        </div>
        <div className="bg-white border border-[#5D8733]/30 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-[#748A68] text-xs mb-2">
            <PiggyBank size={12} /> Savings
          </div>
          <p className="text-[#5D8733] text-xl font-bold">{fmt(user.savings)}</p>
        </div>
      </div>

      {/* Paycheck Countdown */}
      <div className="bg-white border border-[#C8E0A8] rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#5D8733]/10 flex items-center justify-center flex-shrink-0">
          <Clock size={18} className="text-[#5D8733]" />
        </div>
        <div className="flex-1">
          <p className="text-[#748A68] text-xs">Next paycheck in</p>
          <p className="text-[#1B2A16] text-xl font-bold">
            {days !== null ? `${days} days` : "Variable income"}
          </p>
        </div>
        {user.payday && (
          <div className="text-right">
            <p className="text-[#748A68] text-[10px]">Pay day</p>
            <p className="text-[#1B2A16] text-sm font-semibold">{ordinal(user.payday)}</p>
          </div>
        )}
      </div>

      {/* Upcoming Bills — from bills table */}
      <div className="bg-white border border-[#C8E0A8] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[#5D8733]" />
            <span className="text-[#1B2A16] font-semibold text-sm">Upcoming</span>
          </div>
          {bills.length > 3 && (
            <button
              onClick={() => onTabChange("contributions")}
              className="text-[#5D8733] text-xs flex items-center gap-0.5 hover:underline"
            >
              See all <ChevronRight size={12} />
            </button>
          )}
        </div>
        {loadingBills ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF3E3]" />
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-[#EEF3E3] rounded" />
                    <div className="h-2 w-14 bg-[#EEF3E3] rounded" />
                  </div>
                </div>
                <div className="h-3 w-16 bg-[#EEF3E3] rounded" />
              </div>
            ))}
          </div>
        ) : bills.length === 0 ? (
          <p className="text-[#748A68] text-sm text-center py-2">No upcoming bills</p>
        ) : (
          <div className="space-y-3">
            {bills.slice(0, 3).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF3E3] flex items-center justify-center">
                    <CreditCard size={14} className="text-[#748A68]" />
                  </div>
                  <div>
                    <p className="text-[#1B2A16] text-sm">{bill.name}</p>
                    <p className="text-[#748A68] text-xs">{fmtDate(bill.due_date)}</p>
                  </div>
                </div>
                <span className="text-[#1B2A16] text-sm font-medium">{fmt(bill.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Expenses — from transactions table */}
      <div className="bg-white border border-[#C8E0A8] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-[#5D8733]" />
            <span className="text-[#1B2A16] font-semibold text-sm">Recent Expenses</span>
          </div>
          {transactions.length > 3 && (
            <button
              onClick={onSeeAllTransactions}
              className="text-[#5D8733] text-xs flex items-center gap-0.5 hover:underline"
            >
              See all <ChevronRight size={12} />
            </button>
          )}
        </div>
        {loadingTxns ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="space-y-1">
                  <div className="h-3 w-28 bg-[#EEF3E3] rounded" />
                  <div className="h-2 w-14 bg-[#EEF3E3] rounded" />
                </div>
                <div className="h-3 w-16 bg-[#EEF3E3] rounded" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-[#748A68] text-sm text-center py-2">No recent transactions</p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 3).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between">
                <div>
                  <p className="text-[#1B2A16] text-sm">{txn.merchant}</p>
                  <p className="text-[#748A68] text-xs capitalize">{txn.category} · {fmtDate(txn.date)}</p>
                </div>
                <span className={`text-sm font-medium ${txn.type === "credit" ? "text-[#5D8733]" : "text-red-500"}`}>
                  {txn.type === "credit" ? "+" : "-"}{fmt(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vouchers */}
      {earnedAchievements.length > 0 && (
        <div className="bg-white border border-[#C8E0A8] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">🎟️</span>
            <span className="text-[#1B2A16] font-semibold text-sm">My Vouchers</span>
          </div>
          <div className="space-y-3">
            {earnedAchievements.map((ach) => (
              <div key={ach.id} className="bg-[#EEF3E3] border border-dashed border-[#5D8733] rounded-xl p-3">
                <p className="text-[#748A68] text-[10px] uppercase tracking-wider mb-0.5">{ach.name}</p>
                <p className="text-[#1B2A16] font-semibold text-sm mb-2">{ach.voucher_desc}</p>
                <div className="bg-white rounded-lg px-3 py-1.5 flex items-center justify-between gap-2">
                  <span className="text-[#5D8733] font-bold text-sm tracking-widest">{ach.voucher_code}</span>
                  <button
                    onClick={() => copyVoucherById(ach.id, ach.voucher_code)}
                    className="text-xs text-[#748A68] hover:text-[#5D8733] font-medium shrink-0"
                  >
                    {copiedVoucherId === ach.id ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
    </>
  );
}

// ─── Wallet Screen ─────────────────────────────────────────────────────────

function WalletScreen({ user }: { user: (typeof TEST_USERS)[0] }) {
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/accounts/${user.id}`)
      .then((r) => r.json())
      .then((data) => { if (data?.balance !== undefined) setLiveBalance(data.balance); })
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      fetch(`/api/accounts/${user.id}`)
        .then((r) => r.json())
        .then((data) => { if (data?.balance !== undefined) setLiveBalance(data.balance); });
    }, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  const balance = liveBalance ?? user.balance;
  const safeToSpend = Math.max(0, balance - user.savings);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F9EE] px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#748A68] text-xs">My Wallet</p>
          <h1 className="text-[#1B2A16] text-2xl font-bold">Cards & Wallets</h1>
        </div>
      </div>

      {/* Total Balance */}
      <div className="bg-white border border-[#C8E0A8] rounded-2xl p-4">
        <div className="flex items-center gap-2 text-[#748A68] text-xs mb-1">
          <CreditCard size={12} /> Total Balance
        </div>
        {loading ? (
          <div className="h-9 w-40 bg-[#EEF3E3] rounded animate-pulse mt-1" />
        ) : (
          <p className="text-[#1B2A16] text-3xl font-bold">{fmt(balance)}</p>
        )}
        <div className="mt-2 pt-2 border-t border-[#EEF3E3] flex items-center justify-between">
          <span className="text-[#748A68] text-xs">Safe to spend</span>
          {loading ? (
            <div className="h-3 w-16 bg-[#EEF3E3] rounded animate-pulse" />
          ) : (
            <span className="text-[#5D8733] text-sm font-semibold">{fmt(safeToSpend)}</span>
          )}
        </div>
      </div>

      {/* Linked Bank Card */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#1B2A16] font-semibold text-sm">Linked Bank</span>
        </div>
        <div className="bg-gradient-to-br from-[#5D8733] to-[#3A5C20] rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <CreditCard size={16} className="text-white" />
                </div>
                <span className="text-white font-bold text-lg">Penny Bank</span>
              </div>
              <span className="text-white/80 text-xs border border-white/30 rounded px-2 py-0.5">
                DEBIT
              </span>
            </div>
            <p className="text-white/70 text-sm mb-0.5">{user.name}</p>
            <p className="text-white/50 text-xs mb-3">MYR Account</p>
            {loading ? (
              <div className="h-8 w-36 bg-white/20 rounded animate-pulse" />
            ) : (
              <p className="text-white text-2xl font-bold">{fmt(balance)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Screen ───────────────────────────────────────────────────────────

type Message = { role: "user" | "ai"; text: string };
type HistoryMsg = { role: "user" | "assistant"; content: string };

const QUICK_PROMPTS = [
  { label: "How am I doing this month?", icon: <TrendingUp size={12} /> },
  { label: "How long can I stretch?", icon: <Clock size={12} /> },
  { label: "Where am I overspending?", icon: <Target size={12} /> },
  { label: "Help me cut expenses", icon: <CreditCard size={12} /> },
];

function ChatScreen({ user }: { user: (typeof TEST_USERS)[0] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<HistoryMsg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function send(text: string) {
    if (!text.trim() || isLoading) return;
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, message: text, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
        setHistory(data.history);
      }
    } catch {
      setError("Can't reach the server. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9EE] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3 border-b border-[#C8E0A8] bg-white">
        <div className="w-10 h-10 rounded-full bg-[#5D8733] flex items-center justify-center">
          <MessageSquare size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[#1B2A16] font-semibold">Penny</p>
          <p className="text-[#5D8733] text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5D8733] inline-block" />
            {isLoading ? "Thinking..." : "Online"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Greeting */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EEF3E3] border border-[#C8E0A8] flex items-center justify-center flex-shrink-0">
            <span className="text-[#5D8733] text-xs font-bold">P</span>
          </div>
          <div className="bg-white border border-[#C8E0A8] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[78%]">
            <p className="text-[#1B2A16] text-sm">
              Hey {user.name}! 👋 I know your spending inside out — ask me anything about your money.
            </p>
          </div>
        </div>

        {/* Conversation */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-[#EEF3E3] border border-[#C8E0A8] flex items-center justify-center flex-shrink-0">
                <span className="text-[#5D8733] text-xs font-bold">P</span>
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[78%] text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#5D8733] text-white rounded-tr-sm"
                  : "bg-white border border-[#C8E0A8] text-[#1B2A16] rounded-tl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EEF3E3] border border-[#C8E0A8] flex items-center justify-center flex-shrink-0">
              <span className="text-[#5D8733] text-xs font-bold">P</span>
            </div>
            <div className="bg-white border border-[#C8E0A8] rounded-2xl rounded-tl-sm px-4 py-3.5">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-[#5D8733] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-[#5D8733] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-[#5D8733] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={14} className="text-red-500" />
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[78%]">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts — shown only before first message */}
      {messages.length === 0 && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => send(p.label)}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white border border-[#C8E0A8] rounded-xl px-3 py-2.5 text-[#1B2A16] text-xs text-left hover:border-[#5D8733] transition-colors disabled:opacity-50"
            >
              <span className="text-[#5D8733]">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-[#C8E0A8] bg-white">
        <div className="flex items-center gap-2 bg-[#F7F9EE] border border-[#C8E0A8] rounded-2xl px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && send(input)}
            placeholder="Ask about your finances..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-[#1B2A16] text-sm placeholder-[#9DAD8F] outline-none disabled:opacity-60"
          />
          <button
            onClick={() => send(input)}
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-full bg-[#5D8733] flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Contributions Screen ──────────────────────────────────────────────────

function ContributionsScreen({ user }: { user: (typeof TEST_USERS)[0] }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDueDay, setFormDueDay] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function fetchBills() {
    setLoading(true);
    fetch(`/api/bills/${user.id}`)
      .then((r) => r.json())
      .then((data) => setBills(data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchBills();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  function togglePaid(id: string) {
    setPaidIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleAddBill(e: { preventDefault(): void }) {
    e.preventDefault();
    const day = parseInt(formDueDay, 10);
    if (!formName.trim() || !formAmount || !day || day < 1 || day > 31) return;
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const due_date = `${today.getFullYear()}-${month}-${dayStr}`;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bills/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim(), amount: parseFloat(formAmount), due_date }),
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormName("");
        setFormAmount("");
        setFormDueDay("");
        fetchBills();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(billId: string) {
    setDeletingId(billId);
    try {
      await fetch(`/api/bills/${user.id}/${billId}`, { method: "DELETE" });
      fetchBills();
    } finally {
      setDeletingId(null);
    }
  }

  const total = bills.reduce((s, b) => s + b.amount, 0);
  const paidAmount = bills.filter((b) => paidIds.has(b.id)).reduce((s, b) => s + b.amount, 0);
  const paidCount = paidIds.size;
  const pct = total > 0 ? Math.round((paidAmount / total) * 100) : 0;

  return (
    <div className="flex-1 relative overflow-hidden">
    <div className="h-full overflow-y-auto bg-[#F7F9EE] px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#748A68] text-xs">Monthly</p>
          <h1 className="text-[#1B2A16] text-2xl font-bold">Bills</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#5D8733] text-white text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white border border-[#C8E0A8] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[#748A68] text-xs">Total Monthly</p>
            <p className="text-[#1B2A16] text-2xl font-bold">RM {total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[#748A68] text-xs">Paid</p>
            <p className="text-[#5D8733] text-2xl font-bold">RM {paidAmount.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-[#748A68] text-xs mt-2 mb-1">
          {paidCount} of {bills.length} paid
          <span className="float-right">{pct}%</span>
        </p>
        <div className="w-full bg-[#EEF3E3] rounded-full h-1.5">
          <div
            className="bg-[#5D8733] h-1.5 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Bill Items */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#C8E0A8] rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#EEF3E3]" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 bg-[#EEF3E3] rounded" />
                  <div className="h-2 w-20 bg-[#EEF3E3] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : bills.length === 0 ? (
        <p className="text-[#748A68] text-sm text-center py-6">No bills found</p>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => {
            const isPaid = paidIds.has(bill.id);
            const { icon, color } = getBillStyle(bill.name);
            const dueDay = new Date(bill.due_date + "T00:00:00").getDate();
            const daysLeft = daysUntilBillDue(bill.due_date);

            return (
              <div
                key={bill.id}
                className={`bg-white border rounded-2xl p-4 transition-all ${
                  isPaid ? "border-[#C8E0A8] opacity-70" : "border-[#C8E0A8]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white`}>
                      {icon}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isPaid ? "text-[#748A68] line-through" : "text-[#1B2A16]"}`}>
                        {bill.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[#748A68] text-xs">Due {ordinal(dueDay)}</span>
                        {isPaid ? (
                          <span className="bg-[#5D8733]/15 text-[#5D8733] text-[10px] px-1.5 py-0.5 rounded-full">
                            Paid
                          </span>
                        ) : (
                          <span className="bg-[#EEF3E3] text-[#748A68] text-[10px] px-1.5 py-0.5 rounded-full">
                            {daysLeft}d
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[#1B2A16] font-bold">RM {bill.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4 border-t border-[#EEF3E3] pt-3">
                  <button className="flex items-center gap-1.5 text-[#748A68] text-xs hover:text-[#1B2A16] transition-colors">
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => togglePaid(bill.id)}
                    className="flex items-center gap-1.5 text-[#5D8733] text-xs hover:text-[#4A6F28] transition-colors"
                  >
                    {isPaid ? (
                      <><Undo2 size={12} /> Undo</>
                    ) : (
                      <><Check size={12} /> Paid</>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(bill.id)}
                    disabled={deletingId === bill.id}
                    className="flex items-center gap-1.5 text-red-400 text-xs hover:text-red-500 transition-colors ml-auto disabled:opacity-40"
                  >
                    <Trash2 size={12} />
                    {deletingId === bill.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Add Bill Modal */}
    {showAddForm && (
      <div
        className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40"
        onClick={() => setShowAddForm(false)}
      >
        <div
          className="bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[#1B2A16] text-lg font-bold">Add New Bill</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="w-8 h-8 rounded-full bg-[#EEF3E3] flex items-center justify-center text-[#748A68]"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddBill} className="space-y-4">
            <div>
              <label className="text-[#748A68] text-xs mb-1 block">Bill Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Room rental"
                required
                className="w-full bg-[#F7F9EE] border border-[#C8E0A8] rounded-xl px-4 py-3 text-[#1B2A16] text-sm placeholder-[#9DAD8F] outline-none focus:border-[#5D8733]"
              />
            </div>
            <div>
              <label className="text-[#748A68] text-xs mb-1 block">Amount (RM)</label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="w-full bg-[#F7F9EE] border border-[#C8E0A8] rounded-xl px-4 py-3 text-[#1B2A16] text-sm placeholder-[#9DAD8F] outline-none focus:border-[#5D8733]"
              />
            </div>
            <div>
              <label className="text-[#748A68] text-xs mb-1 block">Due Day of Month</label>
              <input
                type="number"
                value={formDueDay}
                onChange={(e) => setFormDueDay(e.target.value)}
                placeholder="e.g. 1 – 31"
                min="1"
                max="31"
                required
                className="w-full bg-[#F7F9EE] border border-[#C8E0A8] rounded-xl px-4 py-3 text-[#1B2A16] text-sm placeholder-[#9DAD8F] outline-none focus:border-[#5D8733]"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 rounded-xl border border-[#C8E0A8] text-[#748A68] font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-[#5D8733] text-white font-semibold text-sm disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Save Bill"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </div>
  );
}

// ─── Profile Screen ────────────────────────────────────────────────────────

function ProfileScreen({
  user,
  onLogout,
}: {
  user: (typeof TEST_USERS)[0];
  onLogout: () => void;
}) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [liveBalance, setLiveBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/accounts/${user.id}`)
      .then((r) => r.json())
      .then((data) => { if (data?.balance !== undefined) setLiveBalance(data.balance); })
      .catch(() => null);
  }, [user.id]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F9EE] px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div>
        <p className="text-[#748A68] text-xs">Account</p>
        <h1 className="text-[#1B2A16] text-2xl font-bold">Profile</h1>
      </div>

      {/* User Card */}
      <div className="bg-white border border-[#C8E0A8] rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#5D8733] flex items-center justify-center overflow-hidden">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.removeAttribute("style");
            }}
          />
          <span style={{ display: "none" }} className="text-white text-xl font-bold">{user.name[0]}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[#1B2A16] text-lg font-semibold">{user.name}</p>
            <button>
              <Pencil size={14} className="text-[#748A68]" />
            </button>
          </div>
          <p className="text-[#748A68] text-sm">Penny Member</p>
        </div>
      </div>

      {/* Financial Info */}
      <div>
        <p className="text-[#748A68] text-xs uppercase tracking-wider mb-2 px-1">Financial Info</p>
        <div className="bg-white border border-[#C8E0A8] rounded-2xl divide-y divide-[#EEF3E3]">
          {[
            {
              icon: <span className="text-[#5D8733] font-bold">$</span>,
              label: "Monthly Income",
              value: `RM ${user.monthlyIncome.toLocaleString()}`,
              color: "bg-[#5D8733]/10",
            },
            {
              icon: <Calendar size={16} className="text-[#5D8733]" />,
              label: "Pay Day",
              value: user.payday ? `${ordinal(user.payday)} of month` : "Variable",
              color: "bg-[#5D8733]/10",
            },
            {
              icon: <CreditCard size={16} className="text-blue-500" />,
              label: "Current Balance",
              value: liveBalance !== null ? `RM ${liveBalance.toLocaleString()}` : `RM ${user.balance.toLocaleString()}`,
              color: "bg-blue-50",
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4">
              <div className={`w-9 h-9 rounded-full ${item.color} flex items-center justify-center`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-[#748A68] text-xs">{item.label}</p>
                <p className="text-[#1B2A16] font-semibold">{item.value}</p>
              </div>
              <button>
                <Pencil size={14} className="text-[#9DAD8F]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div>
        <p className="text-[#748A68] text-xs uppercase tracking-wider mb-2 px-1">Settings</p>
        <div className="bg-white border border-[#C8E0A8] rounded-2xl divide-y divide-[#EEF3E3]">
          {/* Notifications Toggle */}
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
              <Bell size={16} className="text-amber-500" />
            </div>
            <p className="text-[#1B2A16] flex-1 font-medium">Notifications</p>
            <button
              onClick={() => setNotifications((v) => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? "bg-[#5D8733]" : "bg-[#C8E0A8]"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notifications ? "left-6" : "left-0.5"}`}
              />
            </button>
          </div>
          {/* Dark Mode Toggle */}
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center">
              <Moon size={16} className="text-purple-500" />
            </div>
            <p className="text-[#1B2A16] flex-1 font-medium">Dark Mode</p>
            <button
              onClick={() => setDarkMode((v) => !v)}
              className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? "bg-[#5D8733]" : "bg-[#C8E0A8]"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${darkMode ? "left-6" : "left-0.5"}`}
              />
            </button>
          </div>
          {/* Privacy */}
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <Shield size={16} className="text-red-400" />
            </div>
            <p className="text-[#1B2A16] flex-1 font-medium">Privacy & Security</p>
            <ChevronRight size={16} className="text-[#9DAD8F]" />
          </div>
          {/* Help */}
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-full bg-[#5D8733]/10 flex items-center justify-center">
              <HelpCircle size={16} className="text-[#5D8733]" />
            </div>
            <p className="text-[#1B2A16] flex-1 font-medium">Help & Support</p>
            <ChevronRight size={16} className="text-[#9DAD8F]" />
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-4 rounded-2xl border border-red-300 text-red-500 font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} /> Log Out
      </button>

      <p className="text-center text-[#9DAD8F] text-xs pb-2">Penny v1.0.0</p>
    </div>
  );
}

// ─── All Transactions Screen ───────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  shopping: "bg-blue-100 text-blue-700",
  food: "bg-green-100 text-green-700",
  dining: "bg-orange-100 text-orange-700",
  entertainment: "bg-purple-100 text-purple-700",
  work_tools: "bg-amber-100 text-amber-700",
  subscriptions: "bg-teal-100 text-teal-700",
  hobbies: "bg-pink-100 text-pink-700",
  personal: "bg-gray-100 text-gray-600",
  transport: "bg-cyan-100 text-cyan-700",
};

function AllTransactionsScreen({
  user,
  onBack,
}: {
  user: (typeof TEST_USERS)[0];
  onBack: () => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/transactions/${user.id}`)
      .then((r) => r.json())
      .then((data) => setTransactions(data))
      .finally(() => setLoading(false));
  }, [user.id]);

  // Auto-refresh every 10 seconds to pick up bank webhook updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      fetch(`/api/transactions/${user.id}`)
        .then((r) => r.json())
        .then((data) => setTransactions(data));
    }, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  // Group by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, txn) => {
    (acc[txn.date] ??= []).push(txn);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const total = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9EE] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#C8E0A8] px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-[#EEF3E3] flex items-center justify-center"
          >
            <ArrowLeft size={16} className="text-[#5D8733]" />
          </button>
          <div>
            <p className="text-[#748A68] text-xs">All Expenses</p>
            <h1 className="text-[#1B2A16] text-xl font-bold leading-tight">Transactions</h1>
          </div>
        </div>
        {!loading && transactions.length > 0 && (
          <div className="mt-3 flex items-center justify-between bg-[#EEF3E3] rounded-xl px-4 py-2.5">
            <span className="text-[#748A68] text-xs">{transactions.length} transactions</span>
            <span className="text-red-500 font-semibold text-sm">-{fmt(total)}</span>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-2.5 w-20 bg-[#EEF3E3] rounded" />
                <div className="bg-white border border-[#C8E0A8] rounded-2xl p-4 space-y-3">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="h-3 w-28 bg-[#EEF3E3] rounded" />
                        <div className="h-2 w-16 bg-[#EEF3E3] rounded" />
                      </div>
                      <div className="h-3 w-14 bg-[#EEF3E3] rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-[#748A68]">
            <CreditCard size={32} className="text-[#C8E0A8]" />
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          dates.map((date) => (
            <div key={date}>
              <p className="text-[#748A68] text-xs font-medium mb-2 px-1">{fmtDate(date)}</p>
              <div className="bg-white border border-[#C8E0A8] rounded-2xl divide-y divide-[#EEF3E3]">
                {grouped[date].map((txn) => {
                  const catColor = CATEGORY_COLORS[txn.category] ?? "bg-gray-100 text-gray-600";
                  return (
                    <div key={txn.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EEF3E3] flex items-center justify-center flex-shrink-0">
                          <CreditCard size={14} className="text-[#748A68]" />
                        </div>
                        <div>
                          <p className="text-[#1B2A16] text-sm font-medium">{txn.merchant}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${catColor}`}>
                            {txn.category.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${txn.type === "credit" ? "text-[#5D8733]" : "text-red-500"}`}>
                        {txn.type === "credit" ? "+" : "-"}{fmt(txn.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<(typeof TEST_USERS)[0] | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [showAllTxns, setShowAllTxns] = useState(false);

  function handleSelect(u: (typeof TEST_USERS)[0]) {
    setUser(u);
    setTab("home");
    setShowAllTxns(false);
  }

  function handleLogout() {
    setUser(null);
    setTab("home");
    setShowAllTxns(false);
  }

  function handleTabChange(t: Tab) {
    setTab(t);
    setShowAllTxns(false);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#D6E8B8] flex items-center justify-center">
        <div className="w-full max-w-[420px] h-screen max-h-[900px] flex flex-col bg-[#F7F9EE] shadow-2xl">
          <LoginScreen onSelect={handleSelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D6E8B8] flex items-center justify-center">
      <div className="w-full max-w-[420px] h-screen max-h-[900px] flex flex-col bg-[#F7F9EE] overflow-hidden relative shadow-2xl">
        {showAllTxns ? (
          <AllTransactionsScreen user={user} onBack={() => setShowAllTxns(false)} />
        ) : (
          <>
            {tab === "home" && (
              <HomeScreen
                user={user}
                onLogout={handleLogout}
                onTabChange={handleTabChange}
                onSeeAllTransactions={() => setShowAllTxns(true)}
              />
            )}
            {tab === "wallet" && <WalletScreen user={user} />}
            {tab === "chat" && <ChatScreen user={user} />}
            {tab === "contributions" && <ContributionsScreen user={user} />}
            {tab === "profile" && <ProfileScreen user={user} onLogout={handleLogout} />}
            <BottomNav active={tab} onChange={handleTabChange} />
          </>
        )}
      </div>
    </div>
  );
}
