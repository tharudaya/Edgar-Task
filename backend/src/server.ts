import { createApp } from './app';
import { config } from './config';

if (!config.secUserAgent) {
  console.error('SEC_USER_AGENT is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

createApp().listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});