const WORKSPACE_VERSION = 1;

export const DECISIONS = Object.freeze(['undecided', 'advance', 'hold', 'reject']);

export const SORT_KEYS = Object.freeze(['name', 'score', 'evidence', 'gaps', 'decision']);

export const EMPTY_WORKSPACE = Object.freeze({
  version: WORKSPACE_VERSION,
  selectedJobId: null,
  jobs: Object.freeze([]),
});

const VALID_DECISIONS = new Set(DECISIONS);
const VALID_IMPORTANCE = new Set(['required', 'preferred']);
const VALID_STATUSES = new Set(['met', 'unclear', 'missing']);
const VALID_EXTENSIONS = /\.(zip|pdf|docx)$/i;


function emptyWorkspace() {
  return { version: WORKSPACE_VERSION, selectedJobId: null, jobs: [] };
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  return structuredClone(value);
}

function fileName(file) {
  if (typeof file === 'string') return file;
  if (isRecord(file) && typeof file.name === 'string') return file.name;
  return '';
}

export function validateResumeFiles(files) {
  let entries;
  try {
    entries = Array.from(files ?? []);
  } catch {
    return { valid: false, accepted: [], rejected: [] };
  }
  const names = entries.map(fileName);
  const rejected = names.filter((name) => !name || !VALID_EXTENSIONS.test(name));
  return {
    accepted: names.length > 0 && rejected.length === 0 ? names : [],
    rejected,
    valid: names.length > 0 && rejected.length === 0,
  };
}

function normalizeCriterion(criterion) {
  if (!isRecord(criterion)
    || typeof criterion.id !== 'string' || !criterion.id
    || typeof criterion.name !== 'string' || !criterion.name
    || !VALID_IMPORTANCE.has(criterion.importance)
    || !Number.isInteger(criterion.weight) || criterion.weight < 1 || criterion.weight > 5) {
    return null;
  }
  return {
    id: criterion.id,
    name: criterion.name,
    importance: criterion.importance,
    weight: criterion.weight,
  };
}

function normalizeAssessment(assessment) {
  if (!isRecord(assessment)
    || typeof assessment.criterionId !== 'string' || !assessment.criterionId
    || typeof assessment.criterionName !== 'string' || !assessment.criterionName
    || !VALID_IMPORTANCE.has(assessment.importance)
    || !Number.isInteger(assessment.weight) || assessment.weight < 1 || assessment.weight > 5
    || !VALID_STATUSES.has(assessment.status)
    || typeof assessment.evidence !== 'string'
    || typeof assessment.contribution !== 'number' || !Number.isFinite(assessment.contribution)) {
    return null;
  }
  return {
    criterionId: assessment.criterionId,
    criterionName: assessment.criterionName,
    importance: assessment.importance,
    weight: assessment.weight,
    status: assessment.status,
    evidence: assessment.evidence,
    contribution: assessment.contribution,
  };
}

function normalizeCandidate(candidate) {
  if (!isRecord(candidate)
    || typeof candidate.id !== 'string' || !candidate.id
    || typeof candidate.name !== 'string'
    || typeof candidate.sourceFile !== 'string'
    || typeof candidate.score !== 'number' || !Number.isFinite(candidate.score)
    || !VALID_DECISIONS.has(candidate.decision)
    || typeof candidate.createdAt !== 'string'
    || !Array.isArray(candidate.assessments)) {
    return null;
  }
  const assessments = candidate.assessments.map(normalizeAssessment);
  if (assessments.some((assessment) => assessment === null)) return null;
  return { ...clone(candidate), assessments };
}

function normalizeJob(job) {
  if (!isRecord(job)
    || typeof job.id !== 'string' || !job.id
    || typeof job.title !== 'string' || !job.title
    || !Array.isArray(job.scorecard)
    || !Array.isArray(job.candidates)) {
    return null;
  }
  const scorecard = job.scorecard.map(normalizeCriterion).filter(Boolean);
  const candidates = job.candidates.map(normalizeCandidate).filter(Boolean);
  return {
    id: job.id,
    title: job.title,
    department: typeof job.department === 'string' ? job.department : '',
    location: typeof job.location === 'string' ? job.location : '',
    description: typeof job.description === 'string' ? job.description : '',
    createdAt: typeof job.createdAt === 'string' ? job.createdAt : '',
    scorecard,
    candidates,
  };
}


export function normalizeWorkspace(value) {
  if (!isRecord(value) || value.version !== WORKSPACE_VERSION || !Array.isArray(value.jobs)) {
    return emptyWorkspace();
  }
  const jobs = value.jobs.map(normalizeJob).filter(Boolean);
  const selectedJobId = jobs.some((job) => job.id === value.selectedJobId)
    ? value.selectedJobId
    : jobs[0]?.id ?? null;
  return { version: WORKSPACE_VERSION, selectedJobId, jobs };
}

function hash(text) {
  let result = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    result ^= text.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function statusFor(seed) {
  const value = hash(seed) % 100;
  if (value < 55) return 'met';
  if (value < 80) return 'unclear';
  return 'missing';
}

function evidenceFor(status, criterion, sourceFile) {
  if (status === 'missing') return '';
  const qualifier = status === 'met' ? 'demonstrates' : 'suggests experience with';
  return `${criterion.name}: ${sourceFile} ${qualifier} relevant work and outcomes.`;
}

function candidateTimestamp(seed) {
  const start = Date.parse('2020-01-01T00:00:00.000Z');
  const end = Date.parse('2030-01-01T00:00:00.000Z');
  return new Date(start + (hash(seed) % (end - start))).toISOString();
}

function candidateName(sourceFile, index, isArchive) {
  const base = sourceFile.replace(/\.[^.]+$/, '') || sourceFile;
  return isArchive ? `${base} candidate ${index + 1}` : base;
}

export function createCandidateResults(job, files, batchId = 'batch') {
  if (!isRecord(job) || typeof job.id !== 'string' || !Array.isArray(job.scorecard)) return [];
  const validation = validateResumeFiles(files);
  if (!validation.valid) return [];
  const results = [];
  for (let filePosition = 0; filePosition < validation.accepted.length; filePosition += 1) {
    const sourceFile = validation.accepted[filePosition];
    const isArchive = /\.zip$/i.test(sourceFile);
    const count = isArchive ? 3 : 1;
    for (let index = 0; index < count; index += 1) {
      const assessments = job.scorecard.map((criterion) => {
        const normalized = normalizeCriterion(criterion) ?? {
          id: String(criterion?.id ?? ''),
          name: String(criterion?.name ?? 'Criterion'),
          importance: VALID_IMPORTANCE.has(criterion?.importance) ? criterion.importance : 'preferred',
          weight: Number.isInteger(criterion?.weight) && criterion.weight > 0 ? criterion.weight : 1,
        };
        const status = statusFor(`${job.id}|${sourceFile}|${index}|${normalized.id}`);
        const factor = status === 'met' ? 1 : status === 'unclear' ? 0.5 : 0;
        return {
          criterionId: normalized.id,
          criterionName: normalized.name,
          importance: normalized.importance,
          weight: normalized.weight,
          status,
          evidence: evidenceFor(status, normalized, sourceFile),
          contribution: normalized.weight * factor,
        };
      });
      const totalWeight = assessments.reduce((sum, assessment) => sum + assessment.weight, 0);
      const contribution = assessments.reduce((sum, assessment) => sum + assessment.contribution, 0);
      const score = totalWeight === 0 ? 0 : Math.round((contribution / totalWeight) * 100);
      const identitySeed = `${job.id}|${batchId}|${sourceFile}|${filePosition}|${index}`;
      results.push({
        id: `candidate-${hash(identitySeed).toString(16).padStart(8, '0')}`,
        name: candidateName(sourceFile, index, isArchive),
        sourceFile,
        score,
        decision: DECISIONS[0],
        createdAt: candidateTimestamp(identitySeed),
        assessments,
      });
    }
  }
  return results;
}
function metric(candidate, key) {
  const assessments = Array.isArray(candidate.assessments) ? candidate.assessments : [];
  if (key === 'name') return String(candidate.name ?? '').toLocaleLowerCase();
  if (key === 'score') return Number(candidate.score) || 0;
  if (key === 'evidence') return assessments.filter((assessment) => assessment.status === 'met').length;
  if (key === 'gaps') return assessments.filter((assessment) => assessment.status === 'missing' || assessment.status === 'unclear').length;
  if (key === 'decision') return String(candidate.decision ?? '');
  return 0;
}

export function sortCandidates(candidates, options = {}) {
  if (!Array.isArray(candidates)) return [];
  const key = options.key ?? 'score';
  const direction = options.direction === 'asc' ? 1 : -1;
  return [...candidates].sort((left, right) => {
    const a = metric(left, key);
    const b = metric(right, key);
    if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b) * direction;
    return (a - b) * direction;
  });
}

export function updateCandidateDecision(workspace, jobId, candidateId, decision) {
  if (!VALID_DECISIONS.has(decision) || !isRecord(workspace) || !Array.isArray(workspace.jobs)) return workspace;
  const jobIndex = workspace.jobs.findIndex((job) => job?.id === jobId && Array.isArray(job.candidates));
  if (jobIndex === -1 || !workspace.jobs[jobIndex].candidates.some((candidate) => candidate?.id === candidateId)) return workspace;
  const jobs = [...workspace.jobs];
  const job = workspace.jobs[jobIndex];
  jobs[jobIndex] = {
    ...job,
    candidates: job.candidates.map((candidate) => candidate.id === candidateId ? { ...candidate, decision } : candidate),
  };
  return { ...workspace, jobs };
}

function csvField(value) {
  const text = value == null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function serializeCandidatesCsv(candidates) {
  const rows = [[
    'Candidate', 'Source file', 'Score', 'Evidence count', 'Missing criteria', 'Unclear criteria', 'Decision', 'Evidence details',
  ]];
  for (const candidate of Array.isArray(candidates) ? candidates : []) {
    const assessments = Array.isArray(candidate.assessments) ? candidate.assessments : [];
    const evidence = assessments.filter((assessment) => typeof assessment.evidence === 'string' && assessment.evidence.trim().length > 0);
    const missing = assessments.filter((assessment) => assessment.status === 'missing').map((assessment) => assessment.criterionName).join('; ');
    const unclear = assessments.filter((assessment) => assessment.status === 'unclear').map((assessment) => assessment.criterionName).join('; ');
    const details = evidence.map((assessment) => `${assessment.criterionName}: ${assessment.evidence}`).join(' | ');
    rows.push([
      candidate.name,
      candidate.sourceFile,
      candidate.score,
      evidence.length,
      missing,
      unclear,
      candidate.decision,
      details,
    ]);
  }
  return rows.map((row) => row.map(csvField).join(',')).join('\n');
}
