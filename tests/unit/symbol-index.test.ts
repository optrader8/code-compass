import { SymbolIndex } from '../../src/utils/symbol-index';
import { Range } from '../../src/types/ast';

const range = (s: number, e: number): Range => ({
  start: { line: s, character: 0 },
  end: { line: e, character: 0 },
});

describe('SymbolIndex', () => {
  it('adds and finds symbols across URIs', () => {
    const idx = new SymbolIndex();
    idx.addFromAST('file:///a.ts', {
      // @ts-expect-error minimal fields
      functions: [{ name: 'foo', range: range(0, 1) }],
      classes: [
        { name: 'Bar', range: range(2, 4), methods: [], properties: [] },
      ],
    });
    idx.addFromAST('file:///b.ts', {
      // @ts-expect-error minimal fields
      functions: [{ name: 'foo', range: range(10, 12) }],
      classes: [],
    });

    const funcs = idx.find('foo', 'Function');
    expect(funcs).toHaveLength(2);
    expect(funcs.map(f => f.uri)).toContain('file:///b.ts');

    const cls = idx.find('Bar', 'Class');
    expect(cls).toHaveLength(1);
  });

  it('removes symbols by URI', () => {
    const idx = new SymbolIndex();
    idx.addFromAST('file:///a.ts', {
      // @ts-expect-error minimal
      functions: [{ name: 'foo', range: range(0, 1) }],
      classes: [],
    });
    idx.removeUri('file:///a.ts');
    expect(idx.find('foo', 'Function')).toHaveLength(0);
  });
});
