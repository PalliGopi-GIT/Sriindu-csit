// Shared configuration for IGRIS's serverless endpoints.
// Kept in one place so api/chat/stream.js and api/study/chat.js can't drift.

// TokenRouter is OpenAI-compatible: uses the same messages/model/stream
// request shape — only the base URL and auth key env-var differ.
export const TOKENROUTER_URL =
  `${process.env.TOKENROUTER_BASE_URL || 'https://api.tokenrouter.io/v1'}/chat/completions`;

// Override with CHAT_MODEL in Vercel's env vars to choose a specific model.
export const MODEL = process.env.CHAT_MODEL || 'meta-llama/llama-3.1-8b-instruct';

// Used for the SITE_URL env-var (informational / analytics purposes only).
export const SITE_URL = process.env.SITE_URL || 'https://csit-igris.vercel.app';

// Keep prompts small: shorter upstream calls = faster responses under load
// and cheaper/less likely to hit free-tier rate limits.
export const MAX_MESSAGE_LENGTH = 2000;
