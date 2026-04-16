import dotenv from 'dotenv';
import app from './src/app.js';

try {
  dotenv.config();
} catch {
  // Allow startup without dotenv when env vars are provided by the host.
}

const PORT = process.env.PORT || 3001;
const HOST = '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(
    `BridgeJob API listening on ${HOST}:${PORT}`,
  );
});
