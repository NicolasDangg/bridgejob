import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { analyzeSkills } from '../src/analyzer.js';

const jd =
  'Senior backend engineer role requiring Go, distributed systems design, AWS deployment ownership, and observability expertise.';
const skills = 'JavaScript, SQL, and basic API development.';

function makeFetchResponse(content, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async json() {
      return { choices: [{ message: { content } }] };
    },
    async text() {
      return content;
    },
  };
}

const validResult = {
  job_title: 'Backend Engineer',
  overall_fit: 'WEAK',
  overall_summary: 'The candidate lacks most required backend skills.',
  strong_matches: [],
  partial_matches: [],
  gaps: [{ skill: 'Go', priority: 'CRITICAL', learnability: 'SLOW', action: 'Build a Go REST API.' }],
  noise_skills: [],
  readiness_score: 20,
  bridge_steps: ['Build one production-style Go service.'],
  analyst_note: 'Major backend gap remains.',
};

let originalKey;

beforeEach(() => {
  originalKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test-key';
});

afterEach(() => {
  process.env.GROQ_API_KEY = originalKey;
});

describe('analyzeSkills', () => {
  test('returns parsed JSON from AI response', async () => {
    const customFetch = async () => makeFetchResponse(JSON.stringify(validResult));
    const result = await analyzeSkills(jd, skills, customFetch);
    assert.deepEqual(result, validResult);
  });

  test('throws ANALYZE_TIMEOUT when request exceeds timeout', async () => {
    const neverResolves = () => new Promise(() => {});
    await assert.rejects(
      analyzeSkills(jd, skills, neverResolves, { timeoutMs: 5 }),
      (err) => err?.code === 'ANALYZE_TIMEOUT',
    );
  });

  test('throws ANALYZE_CONFIG when GROQ key is missing', async () => {
    delete process.env.GROQ_API_KEY;
    const customFetch = async () => makeFetchResponse(JSON.stringify(validResult));
    await assert.rejects(
      analyzeSkills(jd, skills, customFetch),
      (err) => err?.code === 'ANALYZE_CONFIG',
    );
  });

  test('throws ANALYZE_INVALID_RESPONSE on non-JSON content', async () => {
    const customFetch = async () => makeFetchResponse('plain text response');
    await assert.rejects(
      analyzeSkills(jd, skills, customFetch),
      (err) => err?.code === 'ANALYZE_INVALID_RESPONSE',
    );
  });
});
