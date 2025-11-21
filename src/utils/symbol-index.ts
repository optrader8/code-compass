// src/utils/symbol-index.ts
import { ParsedAST, Range } from '../types/ast';

export type SymbolKindSimple = 'Function' | 'Class';

export interface IndexedSymbol {
  name: string;
  kind: SymbolKindSimple;
  uri: string;
  range: Range;
}

export class SymbolIndex {
  private symbols: IndexedSymbol[] = [];

  addFromAST(uri: string, ast: ParsedAST): void {
    const entries: IndexedSymbol[] = [];
    (ast.functions || []).forEach(fn =>
      entries.push({
        name: fn.name,
        kind: 'Function',
        uri,
        range: fn.range,
      })
    );
    (ast.classes || []).forEach(cls =>
      entries.push({
        name: cls.name,
        kind: 'Class',
        uri,
        range: cls.range,
      })
    );

    // remove old entries for this uri then add new
    this.symbols = this.symbols.filter(s => s.uri !== uri).concat(entries);
  }

  removeUri(uri: string): void {
    this.symbols = this.symbols.filter(s => s.uri !== uri);
  }

  find(name: string, kind: SymbolKindSimple): IndexedSymbol[] {
    return this.symbols.filter(s => s.name === name && s.kind === kind);
  }

  clear(): void {
    this.symbols = [];
  }

  size(): number {
    return this.symbols.length;
  }
}
