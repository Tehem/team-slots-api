import { dim } from 'chalk';
import { inspect } from 'util';
import * as winston from 'winston';
import { prettifyStack } from './prettifyStack';

/**
 * Tries to find Error properties named "error" or "err".
 * If an Error is found, the property will be removed from the metadata,
 * and a "stack" and a "errorMessage" property will be added instead.
 */
export function addErrorProperties(log: winston.Logform.TransformableInfo): winston.Logform.TransformableInfo {
  if (log.error instanceof Error) {
    const { error, ...rest } = log;
    return mixErrorProperties(error, rest);
  }
  if (log.err instanceof Error) {
    const { err, ...rest } = log;
    return mixErrorProperties(err, rest);
  }
  return log;
}

/**
 * Merge error with given metadata
 */
function mixErrorProperties(
  error: Error,
  metadata: winston.Logform.TransformableInfo,
): winston.Logform.TransformableInfo {
  return {
    ...metadata,
    stack: error.stack,
    errorMessage: error.message,
  };
}

/**
 * Transforms a winston's log information into a user-readable string.
 * Will detect Error properties named "error" or "err" and will extract the error stack from them.
 */
export function logToString(log: winston.Logform.TransformableInfo): string {
  const { timestamp, level, message, stack, errorMessage, ...metadata } = addErrorProperties(log);

  const filteredMeta: Record<string, unknown> = {};
  Object.entries(metadata).forEach(([key]) => {
    if (typeof key !== 'symbol') {
      filteredMeta[key] = metadata[key];
    }
  });

  const stringifiedMeta = inspect(filteredMeta, { colors: true, depth: 4, showHidden: false });
  const metaString = stringifiedMeta.length > 4 ? ` ${stringifiedMeta}` : '';

  const errorString = errorMessage ? `\n${errorMessage}` : '';
  const stackString = stack ? `\n${prettifyStack(stack)}` : '';

  return `[${dim(timestamp)}] ${level}: ${message}${metaString}${errorString}${stackString}`;
}
