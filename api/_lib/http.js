// Small shared helpers so api/chat/stream.js and api/study/chat.js return
// errors in exactly the same shape the frontend already expects:
// { error: "<friendly message meant to be shown to the user>" }

export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Turns a non-OK response from TokenRouter into a friendly, user-facing
// { error } response, without ever leaking upstream error detail (API key
// hints, raw provider errors, etc.) to the browser.
export async function relayUpstreamError(upstream) {
  let message = 'IGRIS is temporarily unavailable. Please try again in a moment.';
  let status = upstream.status >= 500 ? 502 : upstream.status;

  try {
    const data = await upstream.json();
    const raw = (data && data.error && data.error.message) || '';

    if (upstream.status === 429 || /rate.?limit/i.test(raw)) {
      message = 'IGRIS is getting a lot of questions right now — please wait a few seconds and try again.';
      status = 429;
    } else if (upstream.status === 401 || upstream.status === 403) {
      message = 'IGRIS is not configured correctly. Please contact the site admin.';
      status = 500;
    } else if (raw) {
      // Not something the student needs the detail of — log for the admin,
      // show the generic message.
      console.error('TokenRouter error:', raw);
    }
  } catch {
    // Body wasn't JSON — fall back to the generic message above.
  }

  return json({ error: message }, status);
}
