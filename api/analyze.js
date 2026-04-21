import { analyzeSkills } from '../src/analyzer.js';
import { fail, ok } from '../src/api/analyze/responseEnvelope.js';
import {
  MIN_JD_LENGTH,
  MIN_SKILLS_LENGTH,
  asTrimmedString,
} from '../src/api/analyze/validateAnalyzeRequest.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const DOMAIN_ERROR_CODES = new Set([
  'ANALYZE_TIMEOUT',
  'ANALYZE_CONFIG',
  'ANALYZE_UPSTREAM',
  'ANALYZE_INVALID_RESPONSE',
]);

function applyCorsHeaders(res) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(key, value);
  }
}

function sendJson(res, statusCode, payload) {
  applyCorsHeaders(res);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function createRequestError(kind, message) {
  const err = new Error(message);
  err.kind = kind;
  return err;
}

function parseRequestBody(req) {
  const body = req.body;

  if (body == null) {
    return {};
  }

  if (typeof body === 'string') {
    if (body.trim() === '') {
      return {};
    }

    try {
      return JSON.parse(body);
    } catch {
      throw createRequestError('BAD_REQUEST', 'Request body must be valid JSON.');
    }
  }

  if (typeof body === 'object' && !Array.isArray(body)) {
    return body;
  }

  throw createRequestError('BAD_REQUEST', 'Request body must be valid JSON.');
}

function validateAnalyzeInput(body) {
  const jd = asTrimmedString(body?.jd);
  const skills = asTrimmedString(body?.skills);

  if (jd === null || skills === null) {
    throw createRequestError('BAD_REQUEST', '`jd` and `skills` must be strings.');
  }

  if (!jd || !skills) {
    throw createRequestError('UNPROCESSABLE_ENTITY', '`jd` and `skills` are required and cannot be empty.');
  }

  if (jd.length < MIN_JD_LENGTH) {
    throw createRequestError('UNPROCESSABLE_ENTITY', `\`jd\` must be at least ${MIN_JD_LENGTH} characters long.`);
  }

  if (skills.length < MIN_SKILLS_LENGTH) {
    throw createRequestError('UNPROCESSABLE_ENTITY', `\`skills\` must be at least ${MIN_SKILLS_LENGTH} characters long.`);
  }

  return { jd, skills };
}

export default async function handler(req, res) {
  applyCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return sendJson(res, 405, fail('METHOD_NOT_ALLOWED', 'Method not allowed.'));
  }

  try {
    const body = parseRequestBody(req);
    const { jd, skills } = validateAnalyzeInput(body);
    req.analyzeInput = { jd, skills };
    const result = await analyzeSkills(jd, skills);
    return sendJson(res, 200, ok(result));
  } catch (err) {
    if (err?.kind === 'BAD_REQUEST') {
      return sendJson(res, 400, fail('BAD_REQUEST', err.message));
    }

    if (err?.kind === 'UNPROCESSABLE_ENTITY') {
      return sendJson(res, 422, fail('UNPROCESSABLE_ENTITY', err.message));
    }

    if (DOMAIN_ERROR_CODES.has(err?.code)) {
      return sendJson(res, 500, fail('INTERNAL_ERROR', err.message));
    }

    return sendJson(res, 500, fail('INTERNAL_ERROR', 'Internal server error.'));
  }
}

export { fail, ok, sendJson };
