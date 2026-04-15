export function ok(data) {
  return {
    success: true,
    data,
    error: null,
  };
}

export function fail(code, message, details) {
  const error = { code, message };
  if (details !== undefined) {
    error.details = details;
  }

  return {
    success: false,
    data: null,
    error,
  };
}

export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}
