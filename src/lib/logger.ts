import config from '../config';
import { createLogger } from './logger/creator';

const logger = createLogger({
  defaultMeta: config.appName ? { appName: config.appName } : {},
  level: config.logger.level,
  json: config.logger.logAsJson || true,
  enableConsoleTransport: config.logger.consoleEnabled,
  exitOnError: false,
});

export default logger;
