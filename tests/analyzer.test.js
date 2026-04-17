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
  test('returns parsed JSON from AI response and coerces readiness_score strings', async () => {
    const customFetch = async () =>
      makeFetchResponse(
        'Here is the analysis:\n```json\n' +
          JSON.stringify({ ...validResult, readiness_score: '20' }) +
          '\n```',
      );

    const result = await analyzeSkills(jd, skills, customFetch);
    assert.deepEqual(result.readiness_score, 20);
    assert.deepEqual(result, validResult);
  });

  test('recovers JSON from wrapped text and normalizes minor field variations', async () => {
    const customFetch = async () =>
      makeFetchResponse(
        'Analysis output follows:\n' +
          JSON.stringify({
            job_title: 'Backend Engineer',
            overall_fit: 'MODERATE',
            overall_summary: 'Okay fit',
            strong_matches: [{ skill: 'SQL', evidence: 'Used spreadsheets' }],
            partial_matches: [],
            gaps: [],
            noise_skills: 'communication',
            bridge_steps: 'Build a small project',
            analyst_note: 'Fine',
          }) +
          '\nThanks.',
      );

    const result = await analyzeSkills(jd, skills, customFetch);
    assert.equal(result.readiness_score, 65);
    assert.deepEqual(result.strong_matches, [{ skill: 'SQL', note: 'Used spreadsheets' }]);
    assert.deepEqual(result.noise_skills, ['communication']);
    assert.deepEqual(result.bridge_steps, ['Build a small project']);
    assert.equal(result.overall_fit, 'MODERATE');
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
