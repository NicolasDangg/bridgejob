import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

function createStatusError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function analyzeSkills(jd, skills, fetchImpl) {
  const fetchFn = fetchImpl || globalThis.fetch;
  let response;

  if (!process.env.OPENROUTER_API_KEY) {
    throw createStatusError('Missing OPENROUTER_API_KEY environment variable.', 500);
  }

  try {
    response = await fetchFn('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://bridgejob.app',
        'X-Title': 'BridgeJob',
      },
      body: JSON.stringify({
        model: 'z-ai/glm-4.5-air:free',
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(jd, skills) },
        ],
      }),
    });
  } catch (err) {
    throw createStatusError("OpenRouter request failed: " + err.message, 502);
  }

  if (!response || !response.ok) {
    const status = response ? response.status : 502;
    let detail = '';

    if (response) {
      try {
        detail = await response.text();
      } catch {
        detail = '';
      }
    }

    const suffix = detail ? ' Detail: ' + detail : '';
    throw createStatusError('OpenRouter request failed with status ' + status + '.' + suffix, status);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;

  if (typeof raw !== 'string' || raw.trim() === '') {
    throw createStatusError('OpenRouter returned an unexpected response format.', 502);
  }

  const normalized = raw
    .replace(/^```(json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let result;
  try {
    result = JSON.parse(normalized);
  } catch {
    throw createStatusError('AI returned non-JSON response: ' + raw, 422);
  }

  return result;
}

export { createStatusError };
