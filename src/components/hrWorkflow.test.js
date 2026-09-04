import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EMPTY_WORKSPACE,
  DECISIONS,
  SORT_KEYS,
  validateResumeFiles,
  normalizeWorkspace,
  createCandidateResults,
  sortCandidates,
  updateCandidateDecision,
  serializeCandidatesCsv,
} from './hrWorkflow.js';

const scorecard = [
  { id: 'leadership', name: 'Leadership', importance: 'required', weight: 5 },
  { id: 'sql', name: 'SQL fluency', importance: 'required', weight: 3 },
  { id: 'communication', name: 'Communication', importance: 'preferred', weight: 2 },
];

assert.deepEqual(DECISIONS, ['undecided', 'advance', 'hold', 'reject']);
assert.deepEqual(SORT_KEYS, ['score', 'name', 'evidence', 'gaps', 'decision']);

const job = {
  id: 'job-42', title: 'Data Lead', department: 'Engineering', location: 'Remote',
  description: 'Lead data systems.', createdAt: '2026-01-01T00:00:00.000Z', scorecard, candidates: [],
};
const files = ['Alice.PDF', 'Bob.DoCx', 'portfolio.ZIP'];

function makeCandidates(batchId = 'batch-a') {
  return createCandidateResults(job, files, batchId);
}

test('accepts supported resume extensions case-insensitively', () => {
  const result = validateResumeFiles(['resume.ZIP', 'resume.PdF', 'resume.DoCx']);
  assert.deepEqual(result, { valid: true, accepted: ['resume.ZIP', 'resume.PdF', 'resume.DoCx'], rejected: [] });
});

test('rejects the whole batch when any resume extension is unsupported', () => {
  const result = validateResumeFiles(['resume.pdf', 'notes.txt', 'resume.docx']);
  assert.deepEqual(result, { valid: false, accepted: [], rejected: ['notes.txt'] });
});

test('normalizes malformed and version-mismatched workspace data to a fresh empty workspace', () => {
  assert.deepEqual(normalizeWorkspace(null), EMPTY_WORKSPACE);
  assert.deepEqual(normalizeWorkspace({ version: 99, jobs: [job] }), EMPTY_WORKSPACE);
  assert.deepEqual(normalizeWorkspace({ version: 1, jobs: 'not-an-array' }), EMPTY_WORKSPACE);
});
test('rejects an empty file batch', () => {
  assert.deepEqual(validateResumeFiles([]), { valid: false, accepted: [], rejected: [] });
});

test('discards malformed jobs and keeps the persisted valid selection or first job', () => {
  const secondJob = { ...job, id: 'job-43', title: 'Designer' };
  const input = { version: 1, selectedJobId: 'missing', jobs: [job, { id: '', title: 'bad' }, secondJob] };
  const normalized = normalizeWorkspace(input);
  assert.equal(normalized.selectedJobId, 'job-42');
  assert.notEqual(normalized.jobs, input.jobs);
  assert.notEqual(normalized.jobs[0].scorecard, input.jobs[0].scorecard);
});
test('filters malformed criteria and candidates with malformed assessments inside valid jobs', () => {
  const validCandidate = makeCandidates()[0];
  const malformedCandidate = {
    ...validCandidate,
    id: 'malformed-assessment',
    assessments: [{ ...validCandidate.assessments[0], status: 'invalid' }],
  };
  const input = {
    version: 1,
    selectedJobId: job.id,
    jobs: [{
      ...job,
      scorecard: [scorecard[0], { id: 'bad-criterion' }],
      candidates: [validCandidate, malformedCandidate],
    }],
  };
  const normalized = normalizeWorkspace(input);
  assert.deepEqual(normalized.jobs[0].scorecard.map(({ id }) => id), ['leadership']);
  assert.deepEqual(normalized.jobs[0].candidates.map(({ id }) => id), [validCandidate.id]);
});

test('generates one PDF/DOCX candidate and three candidates per ZIP with evidence assessments', () => {
  const candidates = makeCandidates();
  assert.equal(candidates.length, 5);
  for (const candidate of candidates) {
    assert.equal(typeof candidate.id, 'string');
    assert.equal(typeof candidate.name, 'string');
    assert.equal(typeof candidate.sourceFile, 'string');
    assert.equal(typeof candidate.score, 'number');
    assert.equal(candidate.decision, DECISIONS[0]);
    assert.equal(typeof candidate.createdAt, 'string');
    assert.equal(candidate.assessments.length, scorecard.length);
    for (const assessment of candidate.assessments) {
      assert.ok(assessment.criterionId);
      assert.ok(assessment.criterionName);
      assert.ok(assessment.importance);
      assert.equal(typeof assessment.weight, 'number');
      assert.ok(['met', 'unclear', 'missing'].includes(assessment.status));
      assert.equal(typeof assessment.evidence, 'string');
      assert.equal(typeof assessment.contribution, 'number');
    }
  }
});

test('candidate scoring and evidence are deterministic and independent of batch identity', () => {
  const first = makeCandidates('batch-a');
  const second = makeCandidates('batch-b');
  const third = makeCandidates('batch-a');
  assert.deepEqual(first, third);
  assert.deepEqual(
    first.map(({ score, sourceFile, assessments }) => ({ score, sourceFile, assessments })),
    second.map(({ score, sourceFile, assessments }) => ({ score, sourceFile, assessments })),
  );
  assert.notEqual(first[0].id, second[0].id);
  assert.notEqual(first[0].createdAt, second[0].createdAt);
});
test('includes file position in generated identity while keeping duplicate-file evidence stable', () => {
  const first = createCandidateResults(job, ['duplicate.pdf', 'duplicate.pdf'], 'batch-a');
  const second = createCandidateResults(job, ['duplicate.pdf', 'duplicate.pdf'], 'batch-b');
  assert.equal(first.length, 2);
  assert.notEqual(first[0].id, first[1].id);
  assert.deepEqual(
    first.map(({ score, assessments }) => ({ score, assessments })),
    second.map(({ score, assessments }) => ({ score, assessments })),
  );
});

test('sorts candidates by every key in both directions without mutating input', () => {
  const candidates = [
    { id: '1', name: 'Zed', score: 70, assessments: [{ status: 'met', evidence: 'a' }], decision: 'hold' },
    { id: '2', name: 'Amy', score: 90, assessments: [{ status: 'missing', evidence: '' }], decision: 'advance' },
    { id: '3', name: 'Bea', score: 90, assessments: [{ status: 'met', evidence: 'a' }, { status: 'unclear', evidence: 'b' }], decision: 'undecided' },
  ];
  const original = structuredClone(candidates);
  assert.deepEqual(sortCandidates(candidates, { key: SORT_KEYS[0], direction: 'desc' }).map(({ id }) => id), ['2', '3', '1']);
  assert.deepEqual(sortCandidates(candidates, { key: SORT_KEYS[0], direction: 'asc' }).map(({ id }) => id), ['1', '2', '3']);
  assert.deepEqual(sortCandidates(candidates, { key: SORT_KEYS[1], direction: 'asc' }).map(({ name }) => name), ['Amy', 'Bea', 'Zed']);
  assert.deepEqual(sortCandidates(candidates, { key: SORT_KEYS[1], direction: 'desc' }).map(({ name }) => name), ['Zed', 'Bea', 'Amy']);
  assert.deepEqual(sortCandidates(candidates, { key: SORT_KEYS[2], direction: 'desc' }).map(({ id }) => id), ['1', '3', '2']);
  assert.deepEqual(sortCandidates(candidates, { key: SORT_KEYS[2], direction: 'asc' }).map(({ id }) => id), ['2', '1', '3']);
  assert.deepEqual(sortCandidates(candidates, { key: SORT_KEYS[3], direction: 'asc' }).map(({ id }) => id), ['1', '2', '3']);
  assert.deepEqual(sortCandidates(candidates, { key: SORT_KEYS[3], direction: 'desc' }).map(({ id }) => id), ['2', '3', '1']);
  assert.deepEqual(sortCandidates(candidates, { key: SORT_KEYS[4], direction: 'asc' }).map(({ id }) => id), ['2', '1', '3']);
  assert.deepEqual(sortCandidates(candidates, { key: SORT_KEYS[4], direction: 'desc' }).map(({ id }) => id), ['3', '1', '2']);
  assert.deepEqual(candidates, original);
});

test('updates a decision immutably by job and candidate identity and rejects invalid decisions', () => {
  const candidates = makeCandidates();
  const workspace = { ...EMPTY_WORKSPACE, selectedJobId: job.id, jobs: [{ ...job, candidates }] };
  const id = candidates[0].id;
  const updated = updateCandidateDecision(workspace, job.id, id, DECISIONS[1]);
  assert.notEqual(updated, workspace);
  assert.equal(updated.jobs[0].candidates[0].decision, DECISIONS[1]);
  assert.equal(workspace.jobs[0].candidates[0].decision, DECISIONS[0]);
  assert.equal(updateCandidateDecision(workspace, job.id, id, 'maybe'), workspace);
  assert.equal(updateCandidateDecision(workspace, job.id, 'unknown-id', DECISIONS[2]), workspace);
});

test('serializes supplied candidate order and RFC-style quotes CSV fields', () => {
  const candidates = [
    {
      name: 'Smith, Alex', sourceFile: 'alex.pdf', score: 88, decision: 'hold',
      assessments: [
        { criterionName: 'Communication', status: 'met', evidence: 'Said "hello"\nwith clarity' },
        { criterionName: 'SQL', status: 'missing', evidence: '' },
      ],
    },
    {
      name: 'Zoe', sourceFile: 'zoe.pdf', score: 42, decision: 'reject',
      assessments: [{ criterionName: 'Communication', status: 'unclear', evidence: 'Needs review' }],
    },
  ];
  const csv = serializeCandidatesCsv(candidates);
  assert.equal(csv, [
    'Candidate,Source file,Score,Evidence count,Missing criteria,Unclear criteria,Decision,Evidence details',
    '"Smith, Alex",alex.pdf,88,1,SQL,,hold,"Communication: Said ""hello""\nwith clarity"',
    'Zoe,zoe.pdf,42,1,,Communication,reject,Communication: Needs review',
  ].join('\n'));
});
