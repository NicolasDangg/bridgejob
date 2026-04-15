import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { buildAnalyzeEndpoint, requestDashboardAnalysis } from '../src/components/dashboardApi.js';

describe('buildAnalyzeEndpoint', () => {
  test('uses same-origin api path when no base URL is provided', () => {
    assert.equal(buildAnalyzeEndpoint(), '/api/analyze');
  });

  test('uses explicit base URL when provided', () => {
    assert.equal(
      buildAnalyzeEndpoint('http://localhost:3001'),
      'http://localhost:3001/api/analyze',
    );
    assert.equal(
      buildAnalyzeEndpoint('http://localhost:3001/'),
      'http://localhost:3001/api/analyze',
    );
  });
});

describe('requestDashboardAnalysis', () => {
  test('returns parsed payload on success response', async () => {
    const payload = { success: true, data: { readiness_score: 75 }, error: null };
    const fakeFetch = async () => ({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => payload,
      text: async () => JSON.stringify(payload),
    });

    const result = await requestDashboardAnalysis(fakeFetch, '/api/analyze', {
      jd: 'x'.repeat(100),
      skills: 'y'.repeat(80),
    });

    assert.deepEqual(result, payload);
  });

  test('throws readable connectivity message on network failure', async () => {
    const fakeFetch = async () => {
      throw new Error('socket hang up');
    };

    await assert.rejects(
      requestDashboardAnalysis(fakeFetch, '/api/analyze', {
        jd: 'x'.repeat(100),
        skills: 'y'.repeat(80),
      }),
      /Failed to connect to the analysis service/i,
    );
  });

  test('throws readable message when upstream returns non-json', async () => {
    const fakeFetch = async () => ({
      ok: false,
      status: 502,
      headers: { get: () => 'text/html' },
      json: async () => {
        throw new Error('invalid json');
      },
      text: async () => '<html>bad gateway</html>',
    });

    await assert.rejects(
      requestDashboardAnalysis(fakeFetch, '/api/analyze', {
        jd: 'x'.repeat(100),
        skills: 'y'.repeat(80),
      }),
      /Analysis service error \(502\)/i,
    );
  });

  test('retries against direct endpoint when proxy returns non-json 500', async () => {
    let callCount = 0;
    const fakeFetch = async (url) => {
      callCount += 1;
      if (callCount === 1) {
        assert.equal(url, '/api/analyze');
        return {
          ok: false,
          status: 500,
          headers: { get: () => 'text/html' },
          json: async () => {
            throw new Error('invalid json');
          },
          text: async () => '<html>proxy error</html>',
        };
      }

      assert.equal(url, 'http://localhost:3001/api/analyze');
      return {
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true, data: { readiness_score: 80 }, error: null }),
        text: async () => '',
      };
    };

    const result = await requestDashboardAnalysis(
      fakeFetch,
      '/api/analyze',
      { jd: 'x'.repeat(100), skills: 'y'.repeat(80) },
      'http://localhost:3001/api/analyze',
    );

    assert.equal(callCount, 2);
    assert.equal(result.success, true);
  });
});
