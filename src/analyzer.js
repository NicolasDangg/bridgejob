import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

function createDomainError(code, message, details) {
  const err = new Error(message);
  err.code = code;
  if (details !== undefined) {
    err.details = details;
  }
  return err;
}

function withTimeout(promise, timeoutMs) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(createDomainError('ANALYZE_TIMEOUT', 'Analysis timed out.'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

export async function analyzeSkills(jd, skills, fetchImpl, options = {}) {
  const fetchFn = fetchImpl || globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 20000;
  let response;

  if (!process.env.GROQ_API_KEY) {
    throw createDomainError('ANALYZE_CONFIG', 'Missing GROQ_API_KEY environment variable.');
  }

  try {
    response = await withTimeout(
      fetchFn('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: buildUserPrompt(jd, skills) },
          ],
        }),
      }),
      timeoutMs,
    );
  } catch (err) {
    if (err?.code === 'ANALYZE_TIMEOUT') {
      throw err;
    }
    throw createDomainError('ANALYZE_UPSTREAM', `Groq request failed: ${err.message}`);
  }

  if (!response || !response.ok) {
    let detail = '';

    if (response) {
      try {
        detail = await response.text();
      } catch {
        detail = '';
      }
    }

    const suffix = detail ? ' Detail: ' + detail : '';
    throw createDomainError(
      'ANALYZE_UPSTREAM',
      `Groq request failed with status ${response?.status ?? 500}.${suffix}`,
    );
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;

  if (typeof raw !== 'string' || raw.trim() === '') {
    throw createDomainError('ANALYZE_INVALID_RESPONSE', 'Groq returned an unexpected response format.');
  }

  const normalized = raw
    .replace(/^```(json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let result;
  try {
    result = JSON.parse(normalized);
  } catch {
    throw createDomainError('ANALYZE_INVALID_RESPONSE', 'AI returned non-JSON response.');
  }

  return result;
}

export { createDomainError };
