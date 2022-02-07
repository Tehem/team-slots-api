import winston from 'winston';
import { addErrorProperties, logToString } from '../../../src/lib/logger/transformLogs';
import { cyan, dim, green, yellow } from 'chalk';
import { prettifyStack } from '../../../src/lib/logger/prettifyStack';

jest.mock('../../../src/lib/logger/prettifyStack');

describe('lib', () => {
  describe('addErrorProperties', () => {
    it('should extract error property', () => {
      const error = new Error('My Error Message');
      const result = addErrorProperties({ level: 'info', message: 'My Message', error });
      expect(result).toHaveProperty('errorMessage', 'My Error Message');
      expect(result).toHaveProperty('stack');
      expect(result.stack).toContain('test/lib/logger/transformLogs.test.ts');
    });

    it('should extract err property', () => {
      const err = new Error('My Error Message');
      const result = addErrorProperties({ level: 'info', message: 'My Message', err });
      expect(result).toHaveProperty('errorMessage', 'My Error Message');
      expect(result).toHaveProperty('stack');
      expect(result.stack).toContain('test/lib/logger/transformLogs.test.ts');
    });

    it('should not extract error property if is not an error', () => {
      const result = addErrorProperties({ level: 'info', message: 'My Message', error: 'My Error As String' });
      expect(result).not.toHaveProperty('errorMessage', 'My Error Message');
      expect(result).not.toHaveProperty('stack');
    });
  });

  describe('logToString', () => {
    beforeAll(() => {
      const mocked = prettifyStack as jest.Mock;
      mocked.mockReturnValue('prettified error stack');
    });

    it('should return a string', () => {
      const log: winston.Logform.TransformableInfo = {
        timestamp: '2020-01-01',
        level: 'info',
        message: 'My Log Message',
      };
      const output = logToString(log);
      expect(output).toEqual(`[${dim('2020-01-01')}] info: My Log Message`);
    });

    it('should remove Symbols', () => {
      const log: winston.Logform.TransformableInfo = {
        timestamp: '2020-01-01',
        level: 'info',
        message: 'My Log Message',
        [Symbol('my-symbol')]: 'bar',
      };
      const output = logToString(log);
      expect(output).toEqual(`[${dim('2020-01-01')}] info: My Log Message`);
    });

    it('should add colorized metadata', () => {
      const log: winston.Logform.TransformableInfo = {
        timestamp: '2020-01-01',
        level: 'info',
        message: 'My Log Message',
        foo: 'bar',
        fiz: true,
      };
      const output = logToString(log);
      expect(output).toEqual(
        `[${dim('2020-01-01')}] info: My Log Message { foo: ${green("'bar'")}, fiz: ${yellow('true')} }`,
      );
    });

    it('should not crash if has circular reference', () => {
      const a: { a?: any } = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
      a.a = a;

      const log: winston.Logform.TransformableInfo = {
        timestamp: '2020-01-01',
        level: 'info',
        message: 'My Log Message',
        a,
      };
      const output = logToString(log);
      expect(output).toEqual(
        `[${dim('2020-01-01')}] info: My Log Message { a: ${cyan('<ref *1>')} { a: ${cyan('[Circular *1]')} } }`,
      );
    });

    it('should log error and prettify stack', () => {
      const error = new Error('Error message');
      const log: winston.Logform.TransformableInfo = {
        timestamp: '2020-01-01',
        level: 'info',
        message: 'My Log Message',
        error: error,
      };
      const output = logToString(log);
      expect(output).toEqual(`[${dim('2020-01-01')}] info: My Log Message\nError message\nprettified error stack`);
    });

    it('should log error when passed as "err" property', () => {
      const error = new Error('Error message');
      const log: winston.Logform.TransformableInfo = {
        timestamp: '2020-01-01',
        level: 'info',
        message: 'My Log Message',
        err: error,
      };
      const output = logToString(log);
      expect(output).toEqual(`[${dim('2020-01-01')}] info: My Log Message\nError message\nprettified error stack`);
    });
  });
});
