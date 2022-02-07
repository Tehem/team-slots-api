import * as winston from 'winston';
import { format, Logger, LoggerOptions } from 'winston';
import * as Transport from 'winston-transport';

import { addErrorProperties, logToString } from './transformLogs';

const jsonFormatter = format.combine(
  format.errors({ stack: true }),
  format.timestamp(),
  format(addErrorProperties)(),
  format.json(),
);

const stringFormatter = format.combine(
  format.colorize(),
  format.timestamp({ format: 'mediumTime' }),
  format.printf(logToString),
);

/**
 * Configure logger instance
 *
 * @extends LoggerOptions
 * @example {
 *  enableConsoleTransport: false,
 *  enableFileTransport: true,
 *  json: false
 * }
 */
export interface LoggerConfiguration extends LoggerOptions {
  /**
   * @default true
   */
  json?: boolean | string;
  /**
   * @default true
   */
  enableConsoleTransport?: boolean | string;
  /**
   * @default false
   */
  enableFileTransport?: boolean | string;
  /**
   * @default logs/${process.env.NODE_ENV || 'development'}.log`,
   */
  fileName?: string;
  /**
   * @default 10000
   */
  maxSize?: number | string;
  /**
   * @default 5
   */
  maxFiles?: number | string;
  /**
   * @default true
   */
  tailable?: boolean | string;
}

/**
 * Create a Winston logger using LoggerConfiguration
 * LoggerConfiguration contains helper variables to quickly configure winston transports.
 */
export function createLogger(configuration: LoggerConfiguration = {}): Logger {
  /**
   * Configuration variables breakdown
   */
  const {
    // If true, will log as json on Console transport.
    json = true,

    // If true, will enable Console transport.
    enableConsoleTransport = true,

    // If true, will enable File transport.
    enableFileTransport = false,

    // Defaults to logs/development.log
    fileName = `logs/${process.env.NODE_ENV || 'development'}.log`,

    // 10 000 max file lines by default
    maxSize = 10000,

    // 5 maximum log files by default
    maxFiles = 5,

    // Tailable is enabled by default
    tailable = true,

    // Winston additional configuration
    ...winstonNativeConfiguration
  } = configuration;

  /**
   * Transports
   */
  const transports: Transport[] = [];

  // Console transport
  if (isTrue(enableConsoleTransport)) {
    transports.push(
      new winston.transports.Console({
        format: isTrue(json) ? jsonFormatter : stringFormatter,
      }),
    );
  }

  // File transport
  if (isTrue(enableFileTransport)) {
    transports.push(
      new winston.transports.File({
        format: jsonFormatter,
        filename: fileName,
        maxsize: Number(maxSize),
        maxFiles: Number(maxFiles),
        tailable: isTrue(tailable),
      }),
    );
  }

  return winston.createLogger({
    transports,
    exitOnError: false,
    silent: transports.length === 0,
    // User can override by directly passing winston configuration options
    ...winstonNativeConfiguration,
  });
}

/**
 * if is string, returns true if lowercase === "true"
 * if not, returns true if truthy
 */
function isTrue(param: unknown): boolean {
  if (typeof param === 'string') {
    return param.toLowerCase() === 'true';
  }
  return Boolean(param);
}
