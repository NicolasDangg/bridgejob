import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

const FIT_VALUES = new Set(['STRONG', 'MODERATE', 'WEAK', 'SEVERELY UNDERQUALIFIED']);
const PRIORITY_VALUES = new Set(['CRITICAL', 'IMPORTANT', 'NICE TO HAVE']);
const LEARNABILITY_VALUES = new Set(['FAST', 'MEDIUM', 'SLOW']);

function createDomainError(code, message, details) {
  const err = new Error(message);
  err.code = code;
  if (details !== undefined) {
    err.details = details;
  }
  return err;
}

function withTimeout(promise, timeoutMs) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(createDomainError('ANALYZE_TIMEOUT', 'Analysis timed out.'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isStrongMatchArray(value) {
  return (
    Array.isArray(value) &&
    value.every((item) => isNonEmptyString(item?.skill) && (item.note === undefined || typeof item.note === 'string'))
  );
}

function isPartialMatchArray(value) {
  return (
    Array.isArray(value) &&
    value.every((item) =>
      isNonEmptyString(item?.skill) &&
      isNonEmptyString(item?.gap_detail) &&
      PRIORITY_VALUES.has(item?.priority) &&
      LEARNABILITY_VALUES.has(item?.learnability) &&
      isNonEmptyString(item?.action)
    )
  );
}

function isGapArray(value) {
  return (
    Array.isArray(value) &&
    value.every((item) =>
      isNonEmptyString(item?.skill) &&
      PRIORITY_VALUES.has(item?.priority) &&
      LEARNABILITY_VALUES.has(item?.learnability) &&
      isNonEmptyString(item?.action)
    )
  );
}

function hasValidAnalysisShape(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.job_title) &&
    FIT_VALUES.has(value.overall_fit) &&
    isNonEmptyString(value.overall_summary) &&
    isStrongMatchArray(value.strong_matches) &&
    isPartialMatchArray(value.partial_matches) &&
    isGapArray(value.gaps) &&
    isStringArray(value.noise_skills) &&
    Number.isFinite(value.readiness_score) &&
    value.readiness_score >= 0 &&
    value.readiness_score <= 100 &&
    isStringArray(value.bridge_steps) &&
    isNonEmptyString(value.analyst_note)
  );
}

export async function analyzeSkills(jd, skills, fetchImpl, options = {}) {
  const fetchFn = fetchImpl || globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 20000;
  let response;

  if (!process.env.GROQ_API_KEY) {
    throw createDomainError('ANALYZE_CONFIG', 'Missing GROQ_API_KEY environment variable.');
  }

  try {
    response = await withTimeout(
      fetchFn('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: buildUserPrompt(jd, skills) },
          ],
        }),
      }),
      timeoutMs,
    );
  } catch (err) {
    if (err?.code === 'ANALYZE_TIMEOUT') {
      throw err;
    }
    throw createDomainError('ANALYZE_UPSTREAM', `Groq request failed: ${err.message}`);
  }

  if (!response || !response.ok) {
    let detail = '';

    if (response) {
      try {
        detail = await response.text();
      } catch {
        detail = '';
      }
    }

    const suffix = detail ? ' Detail: ' + detail : '';
    throw createDomainError(
      'ANALYZE_UPSTREAM',
      `Groq request failed with status ${response?.status ?? 500}.${suffix}`,
    );
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;

  if (typeof raw !== 'string' || raw.trim() === '') {
    throw createDomainError('ANALYZE_INVALID_RESPONSE', 'Groq returned an unexpected response format.');
  }

  const normalized = raw
    .replace(/^```(json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let result;
  try {
    result = JSON.parse(normalized);
  } catch (e) {
    const preview = normalized.substring(0, 200);
    throw createDomainError('ANALYZE_INVALID_RESPONSE', `AI returned non-JSON response. First 200 chars: ${preview}`);
  }

  if (!hasValidAnalysisShape(result)) {
    const missingFields = [];
    if (!result.job_title) missingFields.push('job_title');
    if (!result.overall_fit) missingFields.push('overall_fit');
    if (!result.overall_summary) missingFields.push('overall_summary');
    if (!Array.isArray(result.strong_matches)) missingFields.push('strong_matches');
    if (!Array.isArray(result.partial_matches)) missingFields.push('partial_matches');
    if (!Array.isArray(result.gaps)) missingFields.push('gaps');
    if (!Array.isArray(result.noise_skills)) missingFields.push('noise_skills');
    if (typeof result.readiness_score !== 'number') missingFields.push('readiness_score');
    if (!Array.isArray(result.bridge_steps)) missingFields.push('bridge_steps');
    if (!result.analyst_note) missingFields.push('analyst_note');

    const details = missingFields.length > 0
      ? `Missing or invalid fields: ${missingFields.join(', ')}`
      : 'Schema validation failed';

    throw createDomainError(
      'ANALYZE_INVALID_RESPONSE',
      `AI returned invalid JSON schema. ${details}`,
    );
  }

  return result;
}

export { createDomainError };
