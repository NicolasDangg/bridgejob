function isJsonResponse(response) {
  const contentType = response.headers?.get?.('content-type') ?? '';
  return contentType.toLowerCase().includes('application/json');
}

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return '';

  return baseUrl.replace(/\/+$/, '');
}

export function buildAnalyzeEndpoint(baseUrl) {
  const normalized = normalizeBaseUrl(baseUrl);
  if (!normalized) {
    return '/api/analyze';
  }

  if (normalized.endsWith('/api/analyze')) {
    return normalized;
  }

  if (normalized.endsWith('/api')) {
    return normalized + '/analyze';
  }

  return normalized + '/api/analyze';
}

export function buildCoachEndpoint(baseUrl) {
  const normalized = normalizeBaseUrl(baseUrl);
  if (!normalized) {
    return '/api/coach';
  }

  if (normalized.endsWith('/api/coach')) {
    return normalized;
  }

  if (normalized.endsWith('/api')) {
    return normalized + '/coach';
  }

  return normalized + '/api/coach';
}

async function requestOnce(fetchFn, endpoint, input, authToken) {
  let response;
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    response = await fetchFn(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error('Failed to connect to the analysis service.');
  }

  if (!isJsonResponse(response)) {
    const err = new Error('Analysis service error (' + response.status + ').');
    err.status = response.status;
    throw err;
  }

  const payload = await response.json();
  return payload;
}

export async function requestDashboardAnalysis(fetchFn, endpoint, input, fallbackEndpoint, authToken) {
  try {
    return await requestOnce(fetchFn, endpoint, input, authToken);
  } catch (err) {
    const shouldRetryWithFallback =
      Boolean(fallbackEndpoint) &&
      fallbackEndpoint !== endpoint;

    if (shouldRetryWithFallback) {
      return requestOnce(fetchFn, fallbackEndpoint, input, authToken);
    }

    throw err;
  }
}

export async function requestCoachChat(fetchFn, endpoint, input, fallbackEndpoint, authToken) {
  try {
    return await requestOnce(fetchFn, endpoint, input, authToken);
  } catch (err) {
    const shouldRetryWithFallback =
      Boolean(fallbackEndpoint) &&
      fallbackEndpoint !== endpoint;

    if (shouldRetryWithFallback) {
      return requestOnce(fetchFn, fallbackEndpoint, input, authToken);
    }

    throw err;
  }
}
