// ============================================================
// location-notification.js
// DROP THIS FILE IN: kasi-backend/location-notification.js
// ============================================================

import { getFinancialSnapshot } from './context.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from './db.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================================
// CONSTANTS
// ============================================================

const RADIUS_THRESHOLD_KM = 1.0;

// In-memory cooldown tracker { userId: timestamp }
const notifiedAt = {};
const NOTIFY_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

// ============================================================
// DISTANCE LOGIC — pure math, no AI
// ============================================================

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isOutsideHomeArea(user) {
  const distance = getDistanceKm(
    user.live_lat,
    user.live_lng,
    user.home_lat,
    user.home_lng
  );
  return distance > RADIUS_THRESHOLD_KM;
}

// ============================================================
// GENERATE NOTIFICATION MESSAGE — uses Gemini (same as ai.js)
// Reuses kasi_tone + spending_weakness + saving goal from DB
// ============================================================

export async function generateLocationNudge(userId) {
  const snapshot = getFinancialSnapshot(userId);
  if (!snapshot) return null;

  const { user, account, savingProgress } = snapshot;

  const prompt = `Write a 1-sentence spending reminder for ${user.name}. Tone: ${user.kasi_tone}. Must include their safe-to-spend (RM${account.safe_to_spend}). Their weakness: ${user.spending_weakness}. Max 15 words. No hashtags.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('[LocationNudge] Gemini error:', err);
    return `You have RM${account.safe_to_spend} left to spend — keep it in check! 💸`;
  }
}

// ============================================================
// CHECK A SINGLE USER — called by demo trigger route
// ============================================================

export async function checkUserLocation(userId) {
  await db.read();
  const user = db.data.users.find(u => u.id === userId);
  if (!user) return { triggered: false, reason: 'User not found' };

  if (!isOutsideHomeArea(user)) {
    return { triggered: false, reason: 'User is within home area' };
  }

  // Check cooldown
  const last = notifiedAt[userId];
  if (last && Date.now() - last < NOTIFY_COOLDOWN_MS) {
    return { triggered: false, reason: 'Cooldown active' };
  }

  const message = await generateLocationNudge(userId);
  notifiedAt[userId] = Date.now();

  return { triggered: true, message };
}

// ============================================================
// DEMO: Set simulated location for a user
// Writes live_lat/live_lng directly to db.json
// ============================================================

export async function setSimulatedLocation(userId, lat, lng) {
  await db.read();
  const user = db.data.users.find(u => u.id === userId);
  if (!user) return false;

  user.live_lat = lat;
  user.live_lng = lng;
  await db.write();
  return true;
}