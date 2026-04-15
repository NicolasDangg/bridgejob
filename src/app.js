import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleAnalyze } from './api/analyze/handleAnalyze.js';
import {
  validateAnalyzeRequestShape,
  validateAnalyzeRequestSemantic,
} from './api/analyze/validateAnalyzeRequest.js';
import { fail, sendJson } from './api/analyze/responseEnvelope.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.post(
  '/api/analyze',
  validateAnalyzeRequestShape,
  validateAnalyzeRequestSemantic,
  handleAnalyze,
);

app.use('/api', (err, _req, res, _next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return sendJson(res, 400, fail('BAD_REQUEST', 'Request body must be valid JSON.'));
  }

  if (err?.kind === 'BAD_REQUEST') {
    return sendJson(res, 400, fail('BAD_REQUEST', err.message));
  }

  if (err?.kind === 'UNPROCESSABLE_ENTITY') {
    return sendJson(res, 422, fail('UNPROCESSABLE_ENTITY', err.message));
  }

  const domainErrorCodes = new Set([
    'ANALYZE_TIMEOUT',
    'ANALYZE_CONFIG',
    'ANALYZE_UPSTREAM',
    'ANALYZE_INVALID_RESPONSE',
  ]);

  if (domainErrorCodes.has(err?.code)) {
    return sendJson(res, 500, fail('INTERNAL_ERROR', err.message));
  }

  return sendJson(res, 500, fail('INTERNAL_ERROR', 'Internal server error.'));
});

app.use(express.static(distDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

export default app;
