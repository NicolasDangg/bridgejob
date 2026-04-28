import test from 'node:test';
import assert from 'node:assert/strict';
import { saveAnalysisHistory } from './rateLimitStore.js';

function createInsertClient(insertResponses) {
  const payloads = [];

  return {
    payloads,
    from(tableName) {
      assert.equal(tableName, 'analysis_history');
      return {
        async insert(payload) {
          payloads.push(payload);
          return insertResponses.shift() ?? { error: null };
        },
      };
    },
  };
}

test('saveAnalysisHistory writes created_at and stored_json when supported', async () => {
  const client = createInsertClient([{ error: null }]);

  await saveAnalysisHistory(
    {
      userId: '9eb1f6a9-8c8c-4757-8aa0-6f07cf00b7f6',
      jobData: { jobTitle: 'Backend Engineer' },
      analysisResult: { readiness_score: 80 },
    },
    client,
  );

  assert.equal(client.payloads.length, 1);
  assert.equal(client.payloads[0].user_id, '9eb1f6a9-8c8c-4757-8aa0-6f07cf00b7f6');
  assert.ok(typeof client.payloads[0].created_at === 'string');
  assert.ok(typeof client.payloads[0].stored_json === 'string');
});

test('saveAnalysisHistory falls back to legacy column names when snake_case columns are missing', async () => {
  const client = createInsertClient([
    { error: { message: "Could not find the 'user_id' column of 'analysis_history' in the schema cache" } },
    { error: { message: "Could not find the 'user_id' column of 'analysis_history' in the schema cache" } },
    { error: null },
  ]);

  await saveAnalysisHistory(
    {
      userId: 'f4a0b2a3-9cf8-4a11-a9a2-7fd1fd89bc4f',
      jobData: { jobTitle: 'Platform Engineer' },
      analysisResult: { readiness_score: 90 },
    },
    client,
  );

  assert.equal(client.payloads.length, 3);
  assert.equal(client.payloads[2].userid, 'f4a0b2a3-9cf8-4a11-a9a2-7fd1fd89bc4f');
  assert.ok(typeof client.payloads[2].created_at === 'string');
  assert.ok(typeof client.payloads[2].stored_json === 'string');
});
