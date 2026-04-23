import { analyzeSkills } from '../src/analyzer.js';
import { fail, ok } from '../src/api/analyze/responseEnvelope.js';
import { randomUUID } from 'node:crypto';
import {
  MIN_JD_LENGTH,
  MIN_SKILLS_LENGTH,
  asTrimmedString,
} from '../src/api/analyze/validateAnalyzeRequest.js';
import {
  authenticateAnalyzeRequest,
  checkAndLogAnalysisAttempt,
  logAnalyzeUsageEvent,
  saveAnalysisHistory,
  updateAnalyzeUsageStatus,
} from '../src/api/analyze/rateLimitStore.js';

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

const STORE_ERROR_CODES = new Set([
  'RATE_LIMIT_CONFIG',
  'RATE_LIMIT_CHECK_FAILED',
  'RATE_LIMIT_INVALID_RESPONSE',
  'USAGE_LOG_WRITE_FAILED',
  'USAGE_LOG_UPDATE_FAILED',
  'ANALYSIS_HISTORY_WRITE_FAILED',
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

async function safelyLogUsageEvent(logUsageEvent, payload) {
  try {
    await logUsageEvent(payload);
  } catch (err) {
    console.error('Failed to log usage event:', err);
  }
}

async function safelyUpdateUsageEventStatus(updateUsageEventStatus, payload) {
  try {
    await updateUsageEventStatus(payload);
  } catch (err) {
    console.error('Failed to update usage event status:', err);
  }
}

function buildLimitExceededMessage(limitCount, resetAt) {
  const fallbackMessage = 'Free plan limit reached. Upgrade to Pro for unlimited analysis.';
  if (!limitCount) {
    return fallbackMessage;
  }

  if (!resetAt) {
    return `Free plan limit reached (${limitCount} analyses per rolling 30 days). Upgrade to Pro for unlimited analysis.`;
  }

  return `Free plan limit reached (${limitCount} analyses per rolling 30 days). Try again after ${new Date(resetAt).toISOString()} or upgrade to Pro.`;
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

export function createAnalyzeHandler(deps = {}) {
  const analyzeSkillsFn = deps.analyzeSkillsFn ?? analyzeSkills;
  const authenticateRequest = deps.authenticateRequest ?? authenticateAnalyzeRequest;
  const checkAndLogAttempt = deps.checkAndLogAttempt ?? checkAndLogAnalysisAttempt;
  const persistHistory = deps.saveAnalysisHistory ?? saveAnalysisHistory;
  const logUsageEvent = deps.logUsageEvent ?? logAnalyzeUsageEvent;
  const updateUsageEventStatus = deps.updateUsageEventStatus ?? updateAnalyzeUsageStatus;
  const createRequestId = deps.createRequestId ?? randomUUID;

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

    const requestId = createRequestId();
    let authContext = null;
    let checkCompleted = false;

    try {
      authContext = await authenticateRequest(req);
    } catch (err) {
      await safelyLogUsageEvent(logUsageEvent, {
        requestId,
        status: 'unauthorized',
        reasonCode: 'missing_or_invalid_token',
        metadata: { message: err?.message ?? 'Authentication failed.' },
      });
      return sendJson(res, 401, fail('UNAUTHORIZED', err?.message ?? 'Authentication required.'));
    }

    try {
      const body = parseRequestBody(req);
      const { jd, skills } = validateAnalyzeInput(body);
      req.analyzeInput = { jd, skills };

      const decision = await checkAndLogAttempt({
        userId: authContext.userId,
        plan: authContext.plan,
        requestId,
      });
      checkCompleted = true;

      if (!decision.allowed) {
        return sendJson(
          res,
          429,
          fail(
            'RATE_LIMIT_EXCEEDED',
            buildLimitExceededMessage(decision.limitCount, decision.resetAt),
            {
              plan: authContext.plan,
              usedCount: decision.usedCount,
              limitCount: decision.limitCount,
              remainingCount: decision.remainingCount,
              resetAt: decision.resetAt,
            },
          ),
        );
      }

      const result = await analyzeSkillsFn(jd, skills);

      await persistHistory({
        userId: authContext.userId,
        jobData: {
          jobTitle: result?.job_title ?? '',
          jobDescription: jd,
          candidateProfile: skills,
        },
        analysisResult: result,
      });

      await updateUsageEventStatus({
        requestId,
        status: 'succeeded',
        reasonCode: 'analysis_completed',
        metadata: {
          job_title: result?.job_title ?? null,
        },
      });

      return sendJson(res, 200, ok(result));
    } catch (err) {
      if (err?.kind === 'BAD_REQUEST') {
        await safelyLogUsageEvent(logUsageEvent, {
          requestId,
          userId: authContext.userId,
          plan: authContext.plan,
          status: 'validation_failed',
          reasonCode: 'bad_request',
          metadata: { message: err.message },
        });
        return sendJson(res, 400, fail('BAD_REQUEST', err.message));
      }

      if (err?.kind === 'UNPROCESSABLE_ENTITY') {
        await safelyLogUsageEvent(logUsageEvent, {
          requestId,
          userId: authContext.userId,
          plan: authContext.plan,
          status: 'validation_failed',
          reasonCode: 'unprocessable_entity',
          metadata: { message: err.message },
        });
        return sendJson(res, 422, fail('UNPROCESSABLE_ENTITY', err.message));
      }

      if (DOMAIN_ERROR_CODES.has(err?.code)) {
        if (checkCompleted) {
          await safelyUpdateUsageEventStatus(updateUsageEventStatus, {
            requestId,
            status: 'analyze_failed',
            reasonCode: err.code,
            metadata: { message: err.message },
          });
        }
        return sendJson(res, 500, fail('INTERNAL_ERROR', err.message));
      }

      if (STORE_ERROR_CODES.has(err?.code)) {
        if (checkCompleted) {
          await safelyUpdateUsageEventStatus(updateUsageEventStatus, {
            requestId,
            status: 'analyze_failed',
            reasonCode: err.code,
            metadata: { message: err.message },
          });
        }
        return sendJson(res, 500, fail('INTERNAL_ERROR', err.message));
      }

      if (checkCompleted) {
        await safelyUpdateUsageEventStatus(updateUsageEventStatus, {
          requestId,
          status: 'analyze_failed',
          reasonCode: 'unknown_failure',
          metadata: { message: err?.message ?? 'Unknown failure' },
        });
      }

      return sendJson(res, 500, fail('INTERNAL_ERROR', 'Internal server error.'));
    }
  };
}

const handler = createAnalyzeHandler();

export default handler;
export { fail, ok, sendJson };
