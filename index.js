import dotenv from 'dotenv';
import app from './src/app.js';

try {
  dotenv.config();
} catch {
  // Allow startup without dotenv when env vars are provided by the host.
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`BridgeJob API listening on port ${PORT}`);
});
