// POST /api/chat/stream
// Streams a single-turn chat completion from TokenRouter back to the browser
// as Server-Sent Events, in the exact shape script.js already expects:
//   data: {"type":"session","sessionId":"..."}
//   data: {"type":"chunk","text":"..."}       (repeated)
//   data: {"type":"done","response":"..."}
// or, on failure mid-stream:
//   data: {"type":"error","error":"..."}
//
// Runs on Vercel's Edge Runtime: no cold start, scales per-request, and can
// stream a fetch() response straight through — a good fit for many
// concurrent students with no server to provision.

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
        stream: true,
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

  if (!upstream.ok || !upstream.body) {
    return relayUpstreamError(upstream);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      send({ type: 'session', sessionId: newSessionId });

      const reader = upstream.body.getReader();
      let buffer = '';
      let full = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep possibly-incomplete last line

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (payload === '[DONE]') continue;

            try {
              const parsed = JSON.parse(payload);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (delta) {
                full += delta;
                send({ type: 'chunk', text: delta });
              }
            } catch {
              // Partial JSON split across reads — safe to skip, buffer above
              // makes sure we still see the complete line next time.
            }
          }
        }
      } catch {
        send({ type: 'error', error: 'The connection to IGRIS was interrupted. Please try again.' });
        controller.close();
        return;
      }

      send({ type: 'done', response: full });
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
