import { chatWithCoach } from '../coachAnalyzer.js';
import { fail, ok } from './analyze/responseEnvelope.js';
import { randomUUID } from 'node:crypto';
import { authenticateAnalyzeRequest } from './analyze/rateLimitStore.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
  if (body == null) return {};
  if (typeof body === 'string') {
    if (body.trim() === '') return {};
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

function validateCoachInput(body) {
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw createRequestError('UNPROCESSABLE_ENTITY', '`messages` must be a non-empty array.');
  }
  return { messages };
}

export function createCoachHandler(deps = {}) {
  const chatWithCoachFn = deps.chatWithCoachFn ?? chatWithCoach;
  const authenticateRequest = deps.authenticateRequest ?? authenticateAnalyzeRequest;

  return async function handler(req, res) {
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
      // Authenticate
      const authContext = await authenticateRequest(req);
      
      // Enforce Pro or Enterprise plan (checking logic)
      const plan = (authContext.plan || '').toLowerCase();
      if (!plan.includes('pro') && !plan.includes('enterprise')) {
          return sendJson(res, 403, fail('FORBIDDEN', 'AI Career Coach is only available to Pro users.'));
      }

      const body = parseRequestBody(req);
      const { messages } = validateCoachInput(body);

      const result = await chatWithCoachFn(messages);

      return sendJson(res, 200, ok(result));
    } catch (err) {
      if (err?.kind === 'BAD_REQUEST') {
        return sendJson(res, 400, fail('BAD_REQUEST', err.message));
      }

      if (err?.kind === 'UNPROCESSABLE_ENTITY') {
        return sendJson(res, 422, fail('UNPROCESSABLE_ENTITY', err.message));
      }

      if (err?.message === 'Authentication required.' || err?.message?.includes('token')) {
        return sendJson(res, 401, fail('UNAUTHORIZED', 'Authentication required.'));
      }

      console.error('Coach API Error:', err);
      return sendJson(res, 500, fail('INTERNAL_ERROR', 'Internal server error.'));
    }
  };
}

const handler = createCoachHandler();

export default handler;
