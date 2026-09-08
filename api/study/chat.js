// POST /api/study/chat
// Non-streaming fallback used when SSE isn't available or /api/chat/stream
// returns a 5xx. Returns the shape script.js already expects:
//   { success: true, response: "...", sessionId: "...", sources: [] }
// sources is always empty — there is no retrieval/knowledge base here.

import { TOKENROUTER_URL, MODEL, MAX_MESSAGE_LENGTH } from '../_lib/config.js';
import { buildSystemPrompt } from '../_lib/prompt.js';
import { json, relayUpstreamError } from '../_lib/http.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { message, subject, semester, year, mode, sessionId } = body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return json({ error: 'Please enter a message.' }, 400);
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).` }, 400);
  }

  const apiKey = process.env.TOKENROUTER_API_KEY;
  if (!apiKey) {
    return json({ error: 'IGRIS is not configured yet. Please contact the site admin.' }, 500);
  }

  const newSessionId = typeof sessionId === 'string' && sessionId ? sessionId : crypto.randomUUID();
  const systemPrompt = buildSystemPrompt({ subject, semester, year, mode });

  let upstream;
  try {
    upstream = await fetch(TOKENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: mode === 'exam' ? 0.8 : 0.6,
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() }
        ]
      })
    });
  } catch {
    return json({ error: 'Unable to reach IGRIS right now. Please try again.' }, 502);
  }

  if (!upstream.ok) {
    return relayUpstreamError(upstream);
  }

  const data = await upstream.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    return json({ error: 'IGRIS did not return a response. Please try again.' }, 502);
  }

  return json({ success: true, response: reply, sessionId: newSessionId, sources: [] }, 200);
}
