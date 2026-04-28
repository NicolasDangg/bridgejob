import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnalyzeHandler } from './analyze.js';

function createMockRes() {
    const headers = new Map();
    return {
        statusCode: 0,
        body: '',
        setHeader(name, value) {
            headers.set(name.toLowerCase(), value);
        },
        getHeader(name) {
            return headers.get(name.toLowerCase());
        },
        end(payload = '') {
            this.body = payload;
        },
    };
}

function createValidRequest(overrides = {}) {
    return {
        method: 'POST',
        headers: {
            authorization: 'Bearer token',
        },
        body: {
            jd: 'Senior backend engineer role requiring robust API design and cloud architecture experience.',
            skills: 'Node.js, TypeScript, PostgreSQL, REST API design, and production operations.',
        },
        ...overrides,
    };
}

test('returns 401 when authentication fails', async () => {
    const logCalls = [];
    const handler = createAnalyzeHandler({
        createRequestId: () => '11111111-1111-1111-1111-111111111111',
        authenticateRequest: async () => {
            const err = new Error('Authorization token is required.');
            err.kind = 'UNAUTHORIZED';
            throw err;
        },
        logUsageEvent: async (event) => {
            logCalls.push(event);
        },
    });

    const req = createValidRequest({ headers: {} });
    const res = createMockRes();
    await handler(req, res);

    const payload = JSON.parse(res.body);
    assert.equal(res.statusCode, 401);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, 'UNAUTHORIZED');
    assert.equal(logCalls.length, 1);
    assert.equal(logCalls[0].status, 'unauthorized');
});

test('returns 429 when free plan rate limit is exceeded', async () => {
    let analyzeCalled = false;
    const handler = createAnalyzeHandler({
        createRequestId: () => '22222222-2222-2222-2222-222222222222',
        authenticateRequest: async () => ({ userId: '6f48b4f8-c0af-477b-aa4b-f2cf4a43ff3e', plan: 'free' }),
        checkAndLogAttempt: async () => ({
            allowed: false,
            usedCount: 3,
            limitCount: 3,
            remainingCount: 0,
            resetAt: '2026-05-01T00:00:00.000Z',
        }),
        analyzeSkillsFn: async () => {
            analyzeCalled = true;
            return {};
        },
    });

    const req = createValidRequest();
    const res = createMockRes();
    await handler(req, res);

    const payload = JSON.parse(res.body);
    assert.equal(res.statusCode, 429);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, 'RATE_LIMIT_EXCEEDED');
    assert.equal(analyzeCalled, false);
});

test('returns 200 and marks usage succeeded when analysis succeeds', async () => {
    const savedRows = [];
    const finalized = [];
    const analysisResult = { job_title: 'Backend Engineer', readiness_score: 72 };

    const handler = createAnalyzeHandler({
        createRequestId: () => '33333333-3333-3333-3333-333333333333',
        authenticateRequest: async () => ({ userId: '4e821431-96ea-48cf-9a34-7cb04287f28f', plan: 'pro' }),
        checkAndLogAttempt: async () => ({
            allowed: true,
            usedCount: 0,
            limitCount: null,
            remainingCount: null,
            resetAt: null,
        }),
        analyzeSkillsFn: async () => analysisResult,
        saveAnalysisHistory: async (row) => {
            savedRows.push(row);
        },
        updateUsageEventStatus: async (event) => {
            finalized.push(event);
        },
    });

    const req = createValidRequest();
    const res = createMockRes();
    await handler(req, res);

    const payload = JSON.parse(res.body);
    assert.equal(res.statusCode, 200);
    assert.equal(payload.success, true);
    assert.deepEqual(payload.data, analysisResult);
    assert.equal(savedRows.length, 1);
    assert.equal(savedRows[0].userId, '4e821431-96ea-48cf-9a34-7cb04287f28f');
    assert.equal(finalized.length, 1);
    assert.equal(finalized[0].status, 'succeeded');
});