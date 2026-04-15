import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import http from 'node:http';
import app from '../src/app.js';

const nativeFetch = globalThis.fetch;

const validPayload = {
  jd: 'Senior frontend engineer role requiring React architecture, testing, performance tuning, and collaboration.',
  skills: 'React, TypeScript, component architecture, basic performance optimization, and API integration.',
};

function makeGroqResponse(content, { ok = true, status = 200 } = {}) {
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

async function requestApi(server, path, body) {
  const address = server.address();
  const res = await nativeFetch(`http://127.0.0.1:${address.port}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return {
    status: res.status,
    headers: res.headers,
    body: await res.json(),
  };
}

let server;
let originalFetch;
let originalKey;

beforeEach(async () => {
  originalFetch = global.fetch;
  originalKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'test-key';
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
});

afterEach(async () => {
  global.fetch = originalFetch;
  process.env.GROQ_API_KEY = originalKey;
  await new Promise((resolve) => server.close(resolve));
});

describe('POST /api/analyze', () => {
  test('returns 400 envelope for malformed shape', async () => {
    const res = await requestApi(server, '/api/analyze', { jd: 123, skills: 'abc' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.data, null);
    assert.equal(res.body.error.code, 'BAD_REQUEST');
  });

  test('returns 422 envelope for semantic validation failure', async () => {
    const res = await requestApi(server, '/api/analyze', { jd: 'short', skills: 'short' });
    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNPROCESSABLE_ENTITY');
  });

  test('returns success envelope for valid input', async () => {
    global.fetch = async () =>
      makeGroqResponse(
        JSON.stringify({
          job_title: 'Senior Frontend Engineer',
          overall_fit: 'MODERATE',
          overall_summary: 'Good foundation with a few critical gaps.',
          strong_matches: [{ skill: 'React', note: 'Solid production experience.' }],
          partial_matches: [],
          gaps: [],
          noise_skills: [],
          readiness_score: 62,
          bridge_steps: ['Strengthen testing strategy for larger applications.'],
          analyst_note: 'Strong fit with targeted improvements needed.',
        }),
      );

    const res = await requestApi(server, '/api/analyze', validPayload);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.error, null);
    assert.equal(typeof res.body.data.job_title, 'string');
  });

  test('returns 500 envelope for analyzer internal failure', async () => {
    delete process.env.GROQ_API_KEY;
    const res = await requestApi(server, '/api/analyze', validPayload);
    assert.equal(res.status, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INTERNAL_ERROR');
  });
});
