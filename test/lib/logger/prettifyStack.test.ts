import { cyan, dim } from 'chalk';
import { prettifyStack } from '../../../src/lib/logger/prettifyStack';

describe('prettifyStack', () => {
  it('should prettify and colorize error stack', () => {
    const { stack } = new Error('An incredible error');
    const expectedStack = `  ${dim('at')} Object.<anonymous> (${cyan('test/lib/logger/prettifyStack.test.ts:6:23')})`;

    const prettyStack = prettifyStack(stack as string);

    expect(prettyStack.split('\n')[0]).toEqual(expectedStack);
  });
});
