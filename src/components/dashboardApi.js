function isJsonResponse(response) {
  const contentType = response.headers?.get?.('content-type') ?? '';
  return contentType.toLowerCase().includes('application/json');
}

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return '';

  const trimmed = baseUrl.replace(/\/+$/, '');
  if (trimmed.endsWith('/api/analyze')) {
    return trimmed.slice(0, -'/analyze'.length);
  }
  if (trimmed.endsWith('/api')) {
    return trimmed;
  }
  return trimmed;
}

export function buildAnalyzeEndpoint(baseUrl) {
  const normalized = normalizeBaseUrl(baseUrl);
  if (!normalized) {
    return '/api/analyze';
  }

  return `${normalized}/api/analyze`;
}

async function requestOnce(fetchFn, endpoint, input) {
  let response;

  try {
    response = await fetchFn(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error('Failed to connect to the analysis service.');
  }

  if (!isJsonResponse(response)) {
    const err = new Error(`Analysis service error (${response.status}).`);
    err.status = response.status;
    throw err;
  }

  const payload = await response.json();
  return payload;
}

export async function requestDashboardAnalysis(fetchFn, endpoint, input, fallbackEndpoint) {
  try {
    return await requestOnce(fetchFn, endpoint, input);
  } catch (err) {
    const shouldRetryWithFallback =
      Boolean(fallbackEndpoint) &&
      fallbackEndpoint !== endpoint;

    if (shouldRetryWithFallback) {
      return requestOnce(fetchFn, fallbackEndpoint, input);
    }

    throw err;
  }
}
