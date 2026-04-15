function isJsonResponse(response) {
  const contentType = response.headers?.get?.('content-type') ?? '';
  return contentType.toLowerCase().includes('application/json');
}

export function buildAnalyzeEndpoint(baseUrl) {
  if (!baseUrl) {
    return '/api/analyze';
  }

  const trimmed = baseUrl.replace(/\/+$/, '');
  return `${trimmed}/api/analyze`;
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
      fallbackEndpoint !== endpoint &&
      err instanceof Error &&
      /Analysis service error \(500\)\./.test(err.message);

    if (shouldRetryWithFallback) {
      return requestOnce(fetchFn, fallbackEndpoint, input);
    }

    throw err;
  }
}
