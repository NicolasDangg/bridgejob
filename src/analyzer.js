import { buildSystemPrompt, buildUserPrompt } from './prompt.js';

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

function stripMarkdownCodeFences(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function extractJsonCandidate(text) {
  const cleaned = stripMarkdownCodeFences(text);

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return match[0].trim();
    }
    return cleaned;
  }
}

function coerceNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEnum(value, allowed) {
  const candidate = normalizeString(value).toUpperCase();
  return allowed.includes(candidate) ? candidate : '';
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item)).filter(Boolean);
  }

  const normalized = normalizeString(value);
  return normalized ? [normalized] : [];
}

function normalizeMatchItem(item, kind) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return null;
  }

  const skill = normalizeString(item.skill ?? item.name ?? item.title);
  if (!skill) {
    return null;
  }

  if (kind === 'strong') {
    const note = normalizeString(item.note ?? item.evidence ?? item.description ?? item.details);
    return {
      skill,
      note,
    };
  }

  const gapDetail = normalizeString(
    item.gap_detail ?? item.gapDetail ?? item.detail ?? item.note ?? item.evidence ?? item.description,
  );
  const priority = normalizeEnum(item.priority, ['CRITICAL', 'IMPORTANT', 'NICE TO HAVE']);
  const learnability = normalizeEnum(item.learnability, ['FAST', 'MEDIUM', 'SLOW']);
  const action = normalizeString(item.action ?? item.suggestion ?? item.recommendation ?? item.next_step);

  const normalized = { skill };

  if (gapDetail) {
    normalized.gap_detail = gapDetail;
  }
  if (priority) {
    normalized.priority = priority;
  }
  if (learnability) {
    normalized.learnability = learnability;
  }
  if (action) {
    normalized.action = action;
  }

  return normalized;
}

function normalizeMatchArray(value, kind) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeMatchItem(item, kind)).filter(Boolean);
}

function fallbackReadinessScore(result) {
  const fit = normalizeEnum(result?.overall_fit ?? result?.overallFit ?? result?.fit, [
    'STRONG',
    'MODERATE',
    'WEAK',
    'SEVERELY UNDERQUALIFIED',
  ]);

  switch (fit) {
    case 'STRONG':
      return 90;
    case 'MODERATE':
      return 65;
    case 'WEAK':
      return 35;
    case 'SEVERELY UNDERQUALIFIED':
      return 10;
    default:
      return 50;
  }
}

function normalizeAnalysisResult(result) {
  const readinessScoreCandidate = coerceNumber(
    result?.readiness_score ?? result?.readinessScore ?? result?.score,
  );

  const readinessScore = Number.isFinite(readinessScoreCandidate)
    ? Math.max(0, Math.min(100, Math.round(readinessScoreCandidate)))
    : fallbackReadinessScore(result);

  return {
    job_title: normalizeString(result?.job_title ?? result?.jobTitle ?? result?.title),
    overall_fit: normalizeEnum(
      result?.overall_fit ?? result?.overallFit ?? result?.fit,
      ['STRONG', 'MODERATE', 'WEAK', 'SEVERELY UNDERQUALIFIED'],
    ),
    overall_summary: normalizeString(result?.overall_summary ?? result?.overallSummary ?? result?.summary),
    strong_matches: normalizeMatchArray(result?.strong_matches ?? result?.strongMatches, 'strong'),
    partial_matches: normalizeMatchArray(result?.partial_matches ?? result?.partialMatches, 'partial'),
    gaps: normalizeMatchArray(result?.gaps ?? result?.missing_skills ?? result?.missingSkills, 'gap'),
    noise_skills: normalizeStringArray(result?.noise_skills ?? result?.noiseSkills ?? result?.noise),
    readiness_score: readinessScore,
    bridge_steps: normalizeStringArray(
      result?.bridge_steps ?? result?.bridgeSteps ?? result?.next_steps ?? result?.nextSteps,
    ),
    analyst_note: normalizeString(result?.analyst_note ?? result?.analystNote),
  };
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

  const candidate = extractJsonCandidate(raw);

  let parsed;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw createDomainError('ANALYZE_INVALID_RESPONSE', 'AI returned non-JSON response.');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw createDomainError('ANALYZE_INVALID_RESPONSE', 'AI returned non-object JSON response.');
  }

  return normalizeAnalysisResult(parsed);
}

export { createDomainError };
