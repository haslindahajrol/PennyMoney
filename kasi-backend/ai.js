import Anthropic from '@anthropic-ai/sdk';
import { formatSnapshotForAI, checkNudgeTriggers } from './context.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Build system prompt for a user
function buildSystemPrompt(snapshot) {
  const { user } = snapshot;
  const financialContext = formatSnapshotForAI(snapshot);

  return `You are Kasi, an AI-powered personal finance companion for Gen Z users in Malaysia.

YOUR PERSONALITY FOR THIS USER:
- User: ${user.name}
- Tone: ${user.kasi_tone}
- Their personality: ${user.personality}
- Their spending weakness: ${user.spending_weakness}
${user.health_flag ? `- IMPORTANT HEALTH FLAG: ${user.health_flag}` : ''}

YOUR ROLE:
- Answer "can I afford this?" questions in plain language
- Be proactive about flagging risks BEFORE they spend
- Use local Malaysian references (Grab, Touch n Go, Shopee, Chatime, etc.)
- Give direct yes/no answers, not wishy-washy advice
- Focus on "safe to spend" (balance minus upcoming bills), NOT total balance
- Keep responses concise and conversational

CURRENT FINANCIAL CONTEXT:
${financialContext}

RULES:
1. When asked "can I afford X?", check against safe_to_spend, not balance
2. If a category is over budget, mention it when relevant
3. Reference their saving goal progress when motivating them
4. Match the tone specified above - some users need tough love, others need encouragement
5. Never lecture about financial literacy - just give practical advice
6. Keep responses under 150 words unless they ask for details`;
}

// Chat with Kasi
export async function chat(snapshot, message, history = []) {
  const systemPrompt = buildSystemPrompt(snapshot);

  // Gemini uses 'model' instead of 'assistant' for AI turns
  const geminiHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    const claudeHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages: [...claudeHistory, { role: 'user', content: message }],
    });
    const reply = msg.content[0].text;

    return {
      reply,
      updatedHistory: [
        ...history,
        { role: 'user', content: message },
        { role: 'assistant', content: reply },
      ],
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

// Generate proactive nudge
export async function generateNudge(snapshot) {
  const triggers = checkNudgeTriggers(snapshot);

  if (triggers.length === 0) {
    return null;
  }

  const systemPrompt = buildSystemPrompt(snapshot);
  const triggerText = triggers.map(t => t.message).join('; ');

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Generate a short proactive nudge (max 2 sentences) for this user based on these triggers: ${triggerText}. Be direct and match the tone for this user.` }],
    });
    return msg.content[0].text;
  } catch (error) {
    console.error('Nudge generation error:', error);
    return null;
  }
}

// Generate weekly recap
export async function generateRecap(snapshot) {
  const systemPrompt = buildSystemPrompt(snapshot);

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Write a brief weekly financial recap for this user (3-4 sentences). Highlight wins, concerns, and one actionable tip. Match the tone for this user.` }],
    });
    return msg.content[0].text;
  } catch (error) {
    console.error('Recap generation error:', error);
    return null;
  }
}