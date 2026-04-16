function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return '';

  return baseUrl.replace(//+$/, '');
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

  const rawResponseText = await response.text();

  if (!response.ok) {
    console.error('Analysis service returned a non-OK response.', {
      status: response.status,
      rawResponseText,
    });

    const err = new Error('Analysis service error (' + response.status + ').');
    err.status = response.status;
    err.rawResponseText = rawResponseText;
    throw err;
  }

  try {
    return JSON.parse(rawResponseText);
  } catch (parseError) {
    console.error('Failed to parse analysis service JSON response.', {
      status: response.status,
      rawResponseText,
      error: parseError,
    });

    const err = new Error('Analysis service returned invalid JSON.');
    err.status = response.status;
    err.rawResponseText = rawResponseText;
    throw err;
  }
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
