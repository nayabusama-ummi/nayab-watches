import { createApp } from './app.js';
import { ENV } from './config/env.js';

const app = createApp();

const PORT = parseInt(ENV.PORT, 10) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NAYAB API server running on http://127.0.0.1:${PORT}`);
  console.log(`Health check: http://127.0.0.1:${PORT}/api/health`);
});
