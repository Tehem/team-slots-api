/**
 * config.ts
 * =========
 *
 * Exports all environment variable from .env files as a JS plain object
 *
 * dotenv-flow loads environment variables from .env.* files into process.env
 * (https://github.com/kerimdzhanov/dotenv-flow#readme)
 *
 * Default values are set in .env file. Override those values with a .env.local file.
 */
type SentryConfig = {
  dsn?: string;
};

type LoggerConfig = {
  level: string;
  logAsJson: string;
  consoleEnabled: string;
};

type ShiftsConfig = {
  useDailyShifts: boolean;
  shiftsPerWeek: number;
  calendarSleepTimeMs: number;
  supervisorEmail: string;
  useMentors: boolean;
};

type Config = {
  port: number;
  env: 'production' | 'test' | 'development';
  appName: string;
  logger: LoggerConfig;
  sentry: SentryConfig;
  shifts: ShiftsConfig;
};

export default {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME,
  logger: {
    level: process.env.LOGGER_LEVEL || 'debug',
    logAsJson: process.env.LOGGER_AS_JSON,
    consoleEnabled: process.env.LOGGER_CONSOLE_ENABLED,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  shifts: {
    useDailyShifts: process.env.USE_SHIFTS === 'true' || false,
    shiftsPerWeek: process.env.SHIFTS_PER_WEEK || 5,
    calendarSleepTimeMs: process.env.CALENDAR_SLEEP_TIME_MS || 1500,
    supervisorEmail: process.env.SUPERVISOR_EMAIL,
    useMentors: process.env.USE_MENTORS === 'true' || false,
  },
} as Config;
