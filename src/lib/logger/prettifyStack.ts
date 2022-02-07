import { cyan, dim } from 'chalk';
import { sep } from 'path';

/**
 * Renders an error stack trace into a human-readable string.
 */
export function prettifyStack(stack: string): string {
  const cwd = `${process.cwd()}${sep}`;

  const parsedStack = stack
    .split('\n')
    .splice(1)
    .filter((line) => line.includes(cwd))
    .map((line) => line.trim().replace('file://', '').replace(cwd, ''));

  const atRegex = /^at+/;
  const fileRegex = /\((.+)\)/;

  return parsedStack
    .map((line) => '  ' + line.replace(atRegex, (m) => dim(m)).replace(fileRegex, (_, m) => `(${cyan(m)})`))
    .join('\n');
}
