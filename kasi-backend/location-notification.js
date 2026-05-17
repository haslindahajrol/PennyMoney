// ============================================================
// location-notification.js
// DROP THIS FILE IN: kasi-backend/location-notification.js
// ============================================================

import { getFinancialSnapshot } from './context.js';
import Anthropic from '@anthropic-ai/sdk';
import db from './db.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

  const rmLeft = `RM${account.safe_to_spend}`;
  const goalProgress = `${savingProgress}% to ${user.saving_goal}`;
  const healthLine = user.health_flag ? ` PRIORITY: ${user.health_flag}` : '';

  const prompt = `You are sending ${user.name} a push notification as they step out.
Tone: ${user.kasi_tone}
Their goal: ${user.saving_goal} — currently at ${goalProgress}
Their spending weakness right now: ${user.spending_weakness}
Safe to spend: ${rmLeft}${healthLine}

Write EXACTLY 2 short lines (like a phone notification). Line 1: one punchy hook referencing their goal or weakness. Line 2: their safe-to-spend figure + one concrete action. No hashtags. No emojis unless it helps. Under 20 words total.`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      messages: [{ role: 'user', content: prompt }],
    });
    return msg.content[0].text.trim();
  } catch (err) {
    console.error('[LocationNudge] Claude error:', err);
    return `${user.saving_goal}: ${goalProgress}.\nYou have ${rmLeft} — spend with that in mind.`;
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