import { ASTParser } from '../../src/parsers/registry';
import { Language } from '../../src/types/ast';

describe('ASTParser symbol extraction', () => {
  const parser = new ASTParser();

  test('extracts TypeScript functions/classes/imports', async () => {
    const code = `
      import { foo } from './lib';
      export class UserService {
        getUser(id: string) { return foo(id); }
      }
      export function helper(x: number) { return x * 2; }
    `;

    const ast = await parser.parseContent(code, Language.TypeScript);
    expect(ast.functions?.length).toBeGreaterThanOrEqual(2);
    expect(ast.classes?.length).toBe(1);
    expect(ast.imports?.length).toBe(1);
    expect(ast.functions?.some(fn => fn.name === 'helper')).toBe(true);
    expect(ast.classes?.[0].methods.some(m => m.name === 'getUser')).toBe(true);
  });

  test('extracts Python defs/classes/imports', async () => {
    const code = `
import os

class Service:
    def process(self, val):
        return val

def util(x):
    return x + 1
`;

    const ast = await parser.parseContent(code, Language.Python);
    expect(ast.functions?.some(fn => fn.name === 'util')).toBe(true);
    expect(ast.classes?.length).toBe(1);
    expect(ast.classes?.[0].methods.some(m => m.name === 'process')).toBe(true);
    expect(ast.imports?.length).toBe(1);
  });
});
