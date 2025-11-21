// src/parsers/registry.ts
import { LanguageParser } from './base';
import {
  ParsedAST,
  Language,
  ASTQuery,
  TextChange,
  CodeNode,
} from '../types/ast';
import { TypeScriptParser } from './typescript';
import { PythonParser } from './python';
import { CacheSystem } from '../utils/cache';
import { createHash } from 'crypto';

export class ASTParser {
  private parsers: Map<Language, LanguageParser> = new Map();
  private fallbackParser: LanguageParser | null = null;
  private cacheSystem?: CacheSystem;

  constructor(cacheSystem?: CacheSystem) {
    this.cacheSystem = cacheSystem;
    this.initializeDefaultParsers();
  }

  private initializeDefaultParsers(): void {
    const tsParser = new TypeScriptParser();
    const pyParser = new PythonParser();

    this.registerParser(Language.TypeScript, tsParser);
    this.registerParser(Language.JavaScript, tsParser);
    this.registerParser(Language.Python, pyParser);
  }

  registerParser(language: Language, parser: LanguageParser): void {
    this.parsers.set(language, parser);
  }

  unregisterParser(language: Language): void {
    this.parsers.delete(language);
  }

  setFallbackParser(parser: LanguageParser): void {
    this.fallbackParser = parser;
  }

  async parseFile(filePath: string): Promise<ParsedAST> {
    const content = await this.readFile(filePath);
    const language = this.detectLanguage(filePath);
    const hash = createHash('sha1').update(content).digest('hex');
    const cacheKey = `ast:${filePath}:${hash}`;

    if (this.cacheSystem) {
      const cached = await this.cacheSystem.get<ParsedAST>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const parser = this.getParserForLanguage(language) || this.fallbackParser;

    if (!parser) {
      throw new Error(`No parser available for language: ${language}`);
    }

    if (!parser.canParse(filePath)) {
      throw new Error(`Parser for ${language} cannot handle file: ${filePath}`);
    }
    const ast = await parser.parse(content);

    ast.filePath = filePath;
    ast.language = language;
    ast.content = content;
    ast.hash = hash;
    ast.timestamp = Date.now();

    if (this.cacheSystem) {
      await this.cacheSystem.set(cacheKey, ast);
    }

    return ast;
  }

  async parseContent(content: string, language: Language): Promise<ParsedAST> {
    const hash = createHash('sha1').update(content).digest('hex');
    const cacheKey = `ast:content:${language}:${hash}`;

    if (this.cacheSystem) {
      const cached = await this.cacheSystem.get<ParsedAST>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const parser = this.getParserForLanguage(language) || this.fallbackParser;

    if (!parser) {
      throw new Error(`No parser available for language: ${language}`);
    }

    const mockFilePath = `mock:///${language}.${this.getFileExtension(language)}`;
    const ast = await parser.parse(content);

    ast.filePath = mockFilePath;
    ast.language = language;
    ast.content = content;
    ast.hash = hash;
    ast.timestamp = Date.now();

    if (this.cacheSystem) {
      await this.cacheSystem.set(cacheKey, ast);
    }

    return ast;
  }

  async updateAST(ast: ParsedAST, changes: TextChange[]): Promise<ParsedAST> {
    const parser = this.getParserForLanguage(ast.language);

    if (parser && parser.updateAST) {
      return parser.updateAST(ast, changes);
    }

    // Fallback: re-parse the content
    return this.parseContent(ast.content, ast.language);
  }

  query(ast: ParsedAST, query: ASTQuery): CodeNode[] {
    const parser = this.getParserForLanguage(ast.language);

    if (!parser) {
      throw new Error(`No parser available for language: ${ast.language}`);
    }

    return parser.query(ast, query);
  }

  detectLanguage(filePath: string): Language {
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
        break;
    }

    for (const [language, parser] of this.parsers) {
      if (parser.canParse(filePath)) {
        return language;
      }
    }

    throw new Error(`Unable to detect language for file: ${filePath}`);
  }

  getSupportedLanguages(): Language[] {
    return Array.from(this.parsers.keys());
  }

  private getParserForLanguage(language: Language): LanguageParser | undefined {
    return this.parsers.get(language);
  }

  private getFileExtension(language: Language): string {
    switch (language) {
      case Language.TypeScript:
        return 'ts';
      case Language.JavaScript:
        return 'js';
      case Language.Python:
        return 'py';
      case Language.Go:
        return 'go';
      case Language.Rust:
        return 'rs';
      case Language.Java:
        return 'java';
      case Language.Cpp:
        return 'cpp';
      default:
        return 'txt';
    }
  }

  private async readFile(filePath: string): Promise<string> {
    const fs = await import('fs');
    return fs.promises.readFile(filePath, 'utf-8');
  }
}
