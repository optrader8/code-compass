import {
  formatResultsPlain,
  formatResultsColor,
  formatResultsTable,
} from '../../src/utils/formatters';
import { SearchResult } from '../../src/types/search';
import { Language } from '../../src/types/ast';

const sampleResult: SearchResult = {
  location: {
    uri: '/tmp/example.ts',
    range: {
      start: { line: 0, character: 0 },
      end: { line: 0, character: 4 },
    },
  },
  content: 'test()',
  context: ['test()'],
  score: 1,
  metadata: {
    fileType: 'ts',
    language: Language.TypeScript,
    lastModified: new Date(),
  },
};

describe('formatters', () => {
  it('renders plain format', () => {
    const output = formatResultsPlain([sampleResult]);
    expect(output).toContain('/tmp/example.ts:1:1');
    expect(output).toContain('test()');
  });

  it('renders color format without throwing', () => {
    const output = formatResultsColor([sampleResult]);
    expect(typeof output).toBe('string');
  });

  it('renders table format', () => {
    const output = formatResultsTable([sampleResult]);
    expect(output).toContain('File');
    expect(output).toContain('/tmp/example.ts');
  });
});
