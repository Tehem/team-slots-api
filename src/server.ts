import * as Sentry from '@sentry/node';
import * as http from 'http';

import app from './app';

import config from './config';
import logger from './lib/logger';

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.env,
  });
}

const server = http.createServer(app);

/**
 * Catch EACCES & EADDRINUSE errors
 */
server.on('error', (error: NodeJS.ErrnoException): void => {
  if (error.syscall !== 'listen') throw error;

  switch (error.code) {
    case 'EACCES':
      logger.error(`Port ${config.port} requires elevated privileges`);
      break;

    case 'EADDRINUSE':
      logger.error(`Port ${config.port} is already in use`);
      break;

    default:
      throw error;
  }
  return process.exit(1);
});

/**
 * Start the web app.
 */
server.listen(config.port, () => logger.info(`✔ Server running on port ${config.port} 🍺`));
