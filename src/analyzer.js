'use strict';

const { buildSystemPrompt, buildUserPrompt } = require('./prompt');

/**
 * Creates an error with an HTTP-like status code.
 *
 * @param {string} message - Error message.
 * @param {number} status - Error status code.
 * @returns {Error} Error with status attached.
 */
function createStatusError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Analyzes a job description against a candidate's skills using the OpenRouter API.
 *
 * @param {string} jd - The full text of the job description.
 * @param {string} skills - The candidate's current skills and experience.
 * @param {Function} [fetchImpl] - Optional fetch implementation (used for testing/injection).
 * @returns {Promise<object>} Parsed JSON analysis result.
 * @throws {Error} With status=502 for upstream request failures.
 * @throws {Error} With status=422 for non-JSON model responses.
 */
async function analyzeSkills(jd, skills, fetchImpl) {
  const fetchFn = fetchImpl || global.fetch;
  let response;

  try {
    response = await fetchFn('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://bridgejob.app',
        'X-Title': 'BridgeJob',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(jd, skills) },
        ],
      }),
    });
  } catch (err) {
    throw createStatusError(`OpenRouter request failed: ${err.message}`, 502);
  }

  if (!response || !response.ok) {
    throw createStatusError(
      `OpenRouter request failed with status ${response ? response.status : 'unknown'}.`,
      502,
    );
  }

  const data = await response.json();
  const raw = data.choices[0].message.content;
  const normalized = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let result;
  try {
    result = JSON.parse(normalized);
  } catch {
    throw createStatusError(`AI returned non-JSON response: ${raw}`, 422);
  }

  return result;
}

module.exports = { analyzeSkills };
