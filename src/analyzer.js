'use strict';

const OpenAI = require('openai').default;
const { buildSystemPrompt, buildUserPrompt } = require('./prompt');

/**
 * Creates an OpenAI client instance.
 * Exported separately to allow easy mocking in tests.
 *
 * @returns {OpenAI} OpenAI client.
 */
function createClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Analyzes a job description against a candidate's skills using the OpenAI API.
 *
 * @param {string} jd - The full text of the job description.
 * @param {string} skills - The candidate's current skills and experience.
 * @param {OpenAI} [client] - Optional OpenAI client (used for testing/injection).
 * @returns {Promise<object>} Parsed JSON analysis result.
 * @throws {Error} If the API response cannot be parsed as valid JSON.
 */
async function analyzeSkills(jd, skills, client) {
  const openai = client || createClient();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(jd, skills) },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content;

  let result;
  try {
    result = JSON.parse(raw);
  } catch {
    throw new Error(`AI returned non-JSON response: ${raw}`);
  }

  return result;
}

module.exports = { analyzeSkills, createClient };
