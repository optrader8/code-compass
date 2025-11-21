// src/parsers/base.ts
import {
  ParsedAST,
  Language,
  ASTQuery,
  TextChange,
  CodeNode,
} from '../types/ast';

export interface LanguageParser {
  canParse(filePath: string): boolean;
  parse(content: string): Promise<ParsedAST>;
  query(ast: ParsedAST, query: ASTQuery): CodeNode[];
  extractMetadata(node: CodeNode): any;
  updateAST?(ast: ParsedAST, changes: TextChange[]): Promise<ParsedAST>;
}

export abstract class BaseParser implements LanguageParser {
  abstract canParse(filePath: string): boolean;
  abstract parse(content: string): Promise<ParsedAST>;
  abstract query(ast: ParsedAST, query: ASTQuery): CodeNode[];
  abstract extractMetadata(node: CodeNode): any;

  async updateAST(ast: ParsedAST, changes: TextChange[]): Promise<ParsedAST> {
    // Default implementation - re-parse the entire file
    // Subclasses can override to implement incremental parsing
    return this.parse(ast.content);
  }

  protected detectLanguageFromPath(filePath: string): Language | null {
    const ext = filePath.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'ts':
        return Language.TypeScript;
      case 'js':
      case 'jsx':
        return Language.JavaScript;
      case 'py':
        return Language.Python;
      case 'go':
        return Language.Go;
      case 'rs':
        return Language.Rust;
      case 'java':
        return Language.Java;
      case 'cpp':
      case 'cxx':
      case 'cc':
      case 'c++':
        return Language.Cpp;
      default:
        return null;
    }
  }
}
