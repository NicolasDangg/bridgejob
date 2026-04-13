'use strict';

try {
  require('dotenv').config();
} catch {
  // Allow startup without dotenv when env vars are provided by the host.
}

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`BridgeJob API listening on port ${PORT}`);
});
