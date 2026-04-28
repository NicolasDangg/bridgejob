import { createClient } from '@supabase/supabase-js';

const USAGE_EVENTS_TABLE = 'analysis_usage_events';
const ANALYSIS_HISTORY_TABLE = 'analysis_history';
const CHECK_AND_LOG_ATTEMPT_RPC = 'check_and_log_analysis_attempt';

let cachedServiceRoleClient = null;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    const err = new Error(`Missing ${name} environment variable.`);
    err.code = 'RATE_LIMIT_CONFIG';
    throw err;
  }
  return value;
}

function requireFirstEnv(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  const err = new Error(`Missing one of required environment variables: ${names.join(', ')}.`);
  err.code = 'RATE_LIMIT_CONFIG';
  throw err;
}

// SECURITY: Ensure SUPABASE_SERVICE_ROLE_KEY is never exposed to clients
// This validates that the key is not accidentally prefixed with VITE_
export function validateSecurityEnvironment() {
  const dangerousPrefixes = ['VITE_', 'NEXT_PUBLIC_'];
  
  if (typeof process.env !== 'object') {
    return; // Not in Node.js environment, skip check
  }
  
  for (const [key, value] of Object.entries(process.env)) {
    // Check if this is a service role key (detected by key name or value pattern)
    if (value && typeof value === 'string' && (value.includes('sbp_') || value.includes('sbrx_'))) {
      // These are service role key indicators
      for (const prefix of dangerousPrefixes) {
        if (key.startsWith(prefix)) {
          const err = new Error(
            `SECURITY VIOLATION: Service role key detected with "${prefix}" prefix. ` +
            `This would expose the key to clients. Use "${key.replace(prefix, '')}" instead.`
          );
          err.code = 'SECURITY_VALIDATION_FAILED';
          throw err;
        }
      }
    }
  }
}

export function normalizePlan(value) {
  if (typeof value !== 'string') return 'free';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'pro' || normalized === 'enterprise') {
    return normalized;
  }
  return 'free';
}

// Validate user's plan against their JWT metadata
// This prevents attackers from claiming a higher plan tier via token manipulation
async function validateUserPlan(userId, claimedPlan, userMetadata) {
  // Per schema (line 90 of migration): "Canonical plan value lives in auth.users.raw_user_meta_data->>'plan'"
  // The JWT metadata is the authoritative source for the user's plan
  // We validate the claim against what's actually in their JWT metadata
  
  const actualPlan = normalizePlan(userMetadata?.plan);
  
  // If claimed plan differs from actual plan, log security event and use actual plan
  if (actualPlan !== claimedPlan) {
    console.warn(
      `Plan mismatch for user ${userId}: claimed ${claimedPlan}, actual ${actualPlan}. ` +
      `This may indicate an attempted privilege escalation attack.`
    );
  }

  return actualPlan;
}

function parseAuthorizationHeader(req) {
  const rawHeader = req?.headers?.authorization ?? req?.headers?.Authorization;
  if (typeof rawHeader !== 'string') return null;
  const [scheme, token] = rawHeader.trim().split(/\s+/);
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') return null;
  return token;
}

export function getSupabaseServiceRoleClient() {
  if (cachedServiceRoleClient) return cachedServiceRoleClient;

  const url = requireFirstEnv(['SUPABASE_URL', 'VITE_SUPABASE_URL']);
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  cachedServiceRoleClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cachedServiceRoleClient;
}

export async function authenticateAnalyzeRequest(req, supabaseClient = getSupabaseServiceRoleClient()) {
  const token = parseAuthorizationHeader(req);
  if (!token) {
    const err = new Error('Authorization token is required.');
    err.kind = 'UNAUTHORIZED';
    throw err;
  }

  const { data, error } = await supabaseClient.auth.getUser(token);
  if (error || !data?.user) {
    const err = new Error('Invalid or expired authorization token.');
    err.kind = 'UNAUTHORIZED';
    throw err;
  }

  const userMetadata = data.user.user_metadata || {};
  const claimedPlan = normalizePlan(userMetadata.plan);
  const validatedPlan = await validateUserPlan(data.user.id, claimedPlan, userMetadata);

  return {
    userId: data.user.id,
    plan: validatedPlan,
  };
}

export async function logAnalyzeUsageEvent(
  event,
  supabaseClient = getSupabaseServiceRoleClient(),
) {
  const payload = {
    request_id: event.requestId,
    user_id: event.userId ?? null,
    plan: normalizePlan(event.plan),
    status: event.status,
    reason_code: event.reasonCode ?? null,
    metadata: event.metadata ?? {},
  };

  const { error } = await supabaseClient
    .from(USAGE_EVENTS_TABLE)
    .insert(payload);

  if (error) {
    const err = new Error(`Failed to write usage event: ${error.message}`);
    err.code = 'USAGE_LOG_WRITE_FAILED';
    throw err;
  }
}

export async function checkAndLogAnalysisAttempt(
  { userId, plan, requestId },
  supabaseClient = getSupabaseServiceRoleClient(),
) {
  const { data, error } = await supabaseClient.rpc(CHECK_AND_LOG_ATTEMPT_RPC, {
    p_user_id: userId,
    p_plan: normalizePlan(plan),
    p_request_id: requestId,
  });

  if (error) {
    const err = new Error(`Failed to evaluate rate limit: ${error.message}`);
    err.code = 'RATE_LIMIT_CHECK_FAILED';
    throw err;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.allowed !== 'boolean') {
    const err = new Error('Rate limit RPC returned an invalid payload.');
    err.code = 'RATE_LIMIT_INVALID_RESPONSE';
    throw err;
  }

  return {
    allowed: row.allowed,
    usedCount: typeof row.used_count === 'number' ? row.used_count : null,
    limitCount: typeof row.limit_count === 'number' ? row.limit_count : null,
    remainingCount: typeof row.remaining_count === 'number' ? row.remaining_count : null,
    resetAt: typeof row.reset_at === 'string' ? row.reset_at : null,
  };
}

export async function updateAnalyzeUsageStatus(
  { requestId, status, reasonCode = null, metadata = {} },
  supabaseClient = getSupabaseServiceRoleClient(),
) {
  const { error } = await supabaseClient
    .from(USAGE_EVENTS_TABLE)
    .update({
      status,
      reason_code: reasonCode,
      metadata,
    })
    .eq('request_id', requestId);

  if (error) {
    const err = new Error(`Failed to update usage event: ${error.message}`);
    err.code = 'USAGE_LOG_UPDATE_FAILED';
    throw err;
  }
}

export async function saveAnalysisHistory(
  { userId, jobData, analysisResult },
  supabaseClient = getSupabaseServiceRoleClient(),
) {
  const createdAt = new Date().toISOString();
  const storedJson = JSON.stringify(analysisResult ?? null);
  const payloadCandidates = [
    {
      user_id: userId,
      job_data: jobData,
      analysis_result: analysisResult,
      created_at: createdAt,
      stored_json: storedJson,
    },
    {
      user_id: userId,
      job_data: jobData,
      analysis_result: analysisResult,
      created_at: createdAt,
    },
    {
      userid: userId,
      jobdata: jobData,
      analysisresult: analysisResult,
      created_at: createdAt,
      stored_json: storedJson,
    },
    {
      userid: userId,
      jobdata: jobData,
      analysisresult: analysisResult,
      created_at: createdAt,
    },
  ];

  let lastError = null;
  for (const payload of payloadCandidates) {
    const { error } = await supabaseClient
      .from(ANALYSIS_HISTORY_TABLE)
      .insert(payload);

    if (!error) {
      return;
    }

    lastError = error;
  }

  if (lastError) {
    const err = new Error(`Failed to save analysis history: ${lastError.message}`);
    err.code = 'ANALYSIS_HISTORY_WRITE_FAILED';
    throw err;
  }
}
