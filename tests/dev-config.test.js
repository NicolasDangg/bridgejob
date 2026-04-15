import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

test('dev:api script runs Express on port 3001 to match Vite /api proxy target', () => {
  assert.match(
    packageJson.scripts?.['dev:api'] ?? '',
    /\bPORT=3001\b/,
    'Expected dev:api script to set PORT=3001',
  );
});
