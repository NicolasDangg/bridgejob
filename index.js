import dotenv from 'dotenv';
import app from './src/app.js';
import { validateSecurityEnvironment } from './src/api/analyze/rateLimitStore.js';

try {
  dotenv.config();
} catch {
  // Allow startup without dotenv when env vars are provided by the host.
}

// Validate security environment at startup
try {
  validateSecurityEnvironment();
} catch (err) {
  console.error('❌ Security validation failed:', err.message);
  process.exit(1);
}

const PORT = process.env.PORT || 3001;
const HOST = '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(
    `gapless API listening on ${HOST}:${PORT}`,
  );
});
