# API Analyze (Vite + Express) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `POST /api/analyze` as a Vite-compatible Express API with strict middleware validation, pure `analyzeSkills()` business logic, timeout handling, and consistent JSON response envelopes.

**Architecture:** Express owns API concerns (validation, status mapping, envelope shaping), while `analyzeSkills()` remains HTTP-agnostic domain logic. Vite proxies `/api/*` to Express in development, and Express serves `dist/` plus SPA fallback in production after API routes. Error flow is normalized through a single API error middleware to guarantee JSON responses.

**Tech Stack:** Node.js (ESM), Express, Vite, React, TypeScript (frontend), Jest/Supertest tests

---

## File Structure and Responsibilities

- Create: `src/api/analyze/validateAnalyzeRequest.js` — request-shape (400) and semantic (422) validators.
- Create: `src/api/analyze/responseEnvelope.js` — `ok()` and `fail()` JSON envelope builders.
- Create: `src/api/analyze/handleAnalyze.js` — controller that invokes `analyzeSkills()` and returns normalized envelopes.
- Modify: `src/app.js` — mount `/api/analyze`, wire middleware order, JSON-only API error middleware, SPA fallback ordering.
- Modify: `src/analyzer.js` — pure business logic timeout handling and domain errors without HTTP status coupling.
- Modify: `src/components/SampleResult.tsx` — call canonical `/api/analyze` and parse envelope format.
- Modify: `tests/app.test.js` — assert 400/422/500 mapping and envelope shape.
- Modify: `tests/analyzer.test.js` — assert timeout/domain error behavior in pure logic.
- Modify: `package.json` — ensure deterministic API test command.

### Task 1: Add envelope and validation modules (TDD-first)

**Files:**
- Create: `src/api/analyze/responseEnvelope.js`
- Create: `src/api/analyze/validateAnalyzeRequest.js`
- Test: `tests/app.test.js`

- [ ] **Step 1: Write the failing tests for envelope + 400/422 split**

```js
test('returns 400 envelope for malformed shape', async () => {
  const res = await request(app).post('/api/analyze').send({ jd: 123, skills: 'abc' });
  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    success: false,
    data: null,
    error: expect.objectContaining({ code: 'BAD_REQUEST' }),
  });
});

test('returns 422 envelope for semantically invalid content', async () => {
  const res = await request(app).post('/api/analyze').send({ jd: 'short', skills: 'short' });
  expect(res.status).toBe(422);
  expect(res.body).toEqual({
    success: false,
    data: null,
    error: expect.objectContaining({ code: 'UNPROCESSABLE_ENTITY' }),
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/app.test.js -i`  
Expected: FAIL on missing envelope keys and/or wrong status mapping.

- [ ] **Step 3: Implement envelope and validators**

```js
// src/api/analyze/responseEnvelope.js
export function ok(data) {
  return { success: true, data, error: null };
}

export function fail(code, message, details) {
  return {
    success: false,
    data: null,
    error: details === undefined ? { code, message } : { code, message, details },
  };
}
```

```js
// src/api/analyze/validateAnalyzeRequest.js
const MIN_JD_LENGTH = 50;
const MIN_SKILLS_LENGTH = 20;

function asTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : null;
}

export function validateAnalyzeRequestShape(req, _res, next) {
  const jd = asTrimmedString(req.body?.jd);
  const skills = asTrimmedString(req.body?.skills);

  if (jd === null || skills === null) {
    const err = new Error('`jd` and `skills` must be strings.');
    err.kind = 'BAD_REQUEST';
    return next(err);
  }

  req.analyzeInput = { jd, skills };
  return next();
}

export function validateAnalyzeRequestSemantic(req, _res, next) {
  const { jd, skills } = req.analyzeInput;
  if (!jd || !skills || jd.length < MIN_JD_LENGTH || skills.length < MIN_SKILLS_LENGTH) {
    const err = new Error('`jd` and `skills` do not meet minimum content requirements.');
    err.kind = 'UNPROCESSABLE_ENTITY';
    return next(err);
  }
  return next();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/app.test.js -i`  
Expected: PASS for new 400/422 validation tests.

- [ ] **Step 5: Commit**

```bash
git add src/api/analyze/responseEnvelope.js src/api/analyze/validateAnalyzeRequest.js tests/app.test.js
git commit -m "feat(api): add request validators and response envelope"
```

### Task 2: Rebuild `/api/analyze` controller and Express route order

**Files:**
- Create: `src/api/analyze/handleAnalyze.js`
- Modify: `src/app.js`
- Test: `tests/app.test.js`

- [ ] **Step 1: Write failing API flow tests**

```js
test('returns success envelope for valid analyze input', async () => {
  analyzeSkills.mockResolvedValue(MOCK_ANALYSIS);
  const res = await request(app).post('/api/analyze').send(validPayload);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    success: true,
    data: expect.any(Object),
    error: null,
  });
});

test('returns JSON 500 envelope for analyzer failure', async () => {
  analyzeSkills.mockRejectedValue(new Error('unexpected failure'));
  const res = await request(app).post('/api/analyze').send(validPayload);
  expect(res.status).toBe(500);
  expect(res.headers['content-type']).toMatch(/application\/json/);
  expect(res.body.success).toBe(false);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/app.test.js -i`  
Expected: FAIL because route/controller still returns legacy shape/status handling.

- [ ] **Step 3: Implement controller + app wiring**

```js
// src/api/analyze/handleAnalyze.js
import { analyzeSkills } from '../../analyzer.js';
import { ok } from './responseEnvelope.js';

export async function handleAnalyze(req, res, next) {
  try {
    const { jd, skills } = req.analyzeInput;
    const result = await analyzeSkills(jd, skills);
    return res.status(200).json(ok(result));
  } catch (err) {
    return next(err);
  }
}
```

```js
// src/app.js (core route/middleware shape)
app.use(express.json());
app.use('/api/analyze', validateAnalyzeRequestShape, validateAnalyzeRequestSemantic, handleAnalyze);

app.use('/api', (err, _req, res, _next) => {
  if (err?.kind === 'BAD_REQUEST') {
    return res.status(400).json(fail('BAD_REQUEST', err.message));
  }
  if (err?.kind === 'UNPROCESSABLE_ENTITY') {
    return res.status(422).json(fail('UNPROCESSABLE_ENTITY', err.message));
  }
  return res.status(500).json(fail('INTERNAL_ERROR', 'Internal server error.'));
});

app.use(express.static(distDir));
app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/app.test.js -i`  
Expected: PASS for envelope shape, JSON-only errors, and status mapping.

- [ ] **Step 5: Commit**

```bash
git add src/api/analyze/handleAnalyze.js src/app.js tests/app.test.js
git commit -m "feat(api): rebuild /api/analyze route with middleware validation"
```

### Task 3: Make `analyzeSkills()` HTTP-agnostic with timeout domain errors

**Files:**
- Modify: `src/analyzer.js`
- Test: `tests/analyzer.test.js`

- [ ] **Step 1: Write failing timeout/domain tests**

```js
test('throws timeout domain error when upstream does not respond in time', async () => {
  const neverResolves = () => new Promise(() => {});
  await expect(analyzeSkills('Senior backend engineer role requiring Go and AWS expertise for production APIs.', 'JavaScript and SQL only', neverResolves, { timeoutMs: 5 }))
    .rejects.toMatchObject({ code: 'ANALYZE_TIMEOUT' });
});

test('throws domain error when GROQ_API_KEY is missing', async () => {
  const previous = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  await expect(analyzeSkills('Senior backend engineer role requiring Go and AWS expertise for production APIs.', 'JavaScript and SQL only', jest.fn()))
    .rejects.toMatchObject({ code: 'ANALYZE_CONFIG' });
  process.env.GROQ_API_KEY = previous;
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/analyzer.test.js -i`  
Expected: FAIL because timeout option and domain error codes are not yet implemented.

- [ ] **Step 3: Implement timeout + domain errors in pure logic**

```js
function createDomainError(code, message, details) {
  const err = new Error(message);
  err.code = code;
  if (details !== undefined) err.details = details;
  return err;
}

function withTimeout(promise, timeoutMs) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(createDomainError('ANALYZE_TIMEOUT', 'Analysis timed out.')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function analyzeSkills(jd, skills, fetchImpl, options = {}) {
  const timeoutMs = options.timeoutMs ?? 20000;
  const fetchFn = fetchImpl || globalThis.fetch;
  if (!process.env.GROQ_API_KEY) {
    throw createDomainError('ANALYZE_CONFIG', 'Missing GROQ_API_KEY environment variable.');
  }

  const requestInit = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(jd, skills) },
      ],
    }),
  };

  let response;
  try {
    response = await withTimeout(
      fetchFn('https://api.groq.com/openai/v1/chat/completions', requestInit),
      timeoutMs,
    );
  } catch (err) {
    if (err?.code === 'ANALYZE_TIMEOUT') throw err;
    throw createDomainError('ANALYZE_UPSTREAM', `Groq request failed: ${err.message}`);
  }

  if (!response.ok) {
    throw createDomainError('ANALYZE_UPSTREAM', `Groq request failed with status ${response.status}.`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw createDomainError('ANALYZE_INVALID_RESPONSE', 'Groq returned an unexpected response format.');
  }

  const normalized = raw.replace(/^```(json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(normalized);
  } catch {
    throw createDomainError('ANALYZE_INVALID_RESPONSE', 'AI returned non-JSON response.');
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/analyzer.test.js -i`  
Expected: PASS for timeout/domain error tests and existing parsing tests.

- [ ] **Step 5: Commit**

```bash
git add src/analyzer.js tests/analyzer.test.js
git commit -m "feat(analyzer): add timeout and domain error model"
```

### Task 4: Map domain errors to HTTP + normalized API failures

**Files:**
- Modify: `src/app.js`
- Modify: `tests/app.test.js`

- [ ] **Step 1: Write failing mapping tests**

```js
test('maps ANALYZE_TIMEOUT to 500 envelope', async () => {
  const err = new Error('timeout');
  err.code = 'ANALYZE_TIMEOUT';
  analyzeSkills.mockRejectedValue(err);
  const res = await request(app).post('/api/analyze').send(validPayload);
  expect(res.status).toBe(500);
  expect(res.body.error.code).toBe('INTERNAL_ERROR');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/app.test.js -i`  
Expected: FAIL on missing error-code mapping.

- [ ] **Step 3: Implement mapping in API error middleware**

```js
const DOMAIN_TO_HTTP = {
  ANALYZE_TIMEOUT: 500,
  ANALYZE_CONFIG: 500,
  ANALYZE_UPSTREAM: 500,
  ANALYZE_INVALID_RESPONSE: 500,
};

app.use('/api', (err, _req, res, _next) => {
  if (err?.kind === 'BAD_REQUEST') return res.status(400).json(fail('BAD_REQUEST', err.message));
  if (err?.kind === 'UNPROCESSABLE_ENTITY') return res.status(422).json(fail('UNPROCESSABLE_ENTITY', err.message));

  const status = DOMAIN_TO_HTTP[err?.code] ?? 500;
  return res.status(status).json(fail('INTERNAL_ERROR', err?.message ?? 'Internal server error.'));
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/app.test.js -i`  
Expected: PASS for domain-error-to-HTTP mapping.

- [ ] **Step 5: Commit**

```bash
git add src/app.js tests/app.test.js
git commit -m "feat(api): normalize analyzer domain errors into HTTP envelopes"
```

### Task 5: Frontend integration + Vite/prod verification

**Files:**
- Modify: `src/components/SampleResult.tsx`
- Modify: `vite.config.ts`
- Modify: `README.md`
- Test: `tests/app.test.js`, `tests/analyzer.test.js`

- [ ] **Step 1: Write failing frontend expectation**

```ts
// In SampleResult component behavior:
// - call POST /api/analyze
// - expect envelope { success, data, error }
// - render data when success=true
// - render error.message when success=false
```

- [ ] **Step 2: Run lint/build to capture current failure**

Run: `npm run lint && npm run build`  
Expected: FAIL or stale behavior due mock response path/shape mismatch.

- [ ] **Step 3: Implement frontend envelope parsing and error display**

```tsx
const res = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jd: jdText, skills: candidateText }),
});
const payload = await res.json();
if (!payload.success) {
  throw new Error(payload.error?.message ?? 'Failed to analyze skills.');
}
setResponse(payload.data);
```

- [ ] **Step 4: Final verification run**

Run: `npx jest tests/app.test.js tests/analyzer.test.js -i && npm run lint && npm run build`  
Expected: PASS tests, PASS lint, PASS production build.

- [ ] **Step 5: Commit**

```bash
git add src/components/SampleResult.tsx vite.config.ts README.md tests/app.test.js tests/analyzer.test.js
git commit -m "feat(fullstack): wire frontend to canonical /api/analyze envelope"
```

## Spec Coverage Check

- Endpoint + canonical path (`/api/analyze`) → Tasks 2 and 5.
- Validation split (400 shape, 422 semantic) → Task 1.
- Pure business logic + timeout in `analyzeSkills()` → Task 3.
- Consistent JSON response envelope for all outcomes → Tasks 1, 2, and 4.
- Production route ordering and SPA fallback behavior → Task 2.
- Vite dev proxy compatibility → Task 5.
