// src/core/engine.ts
import { ASTParser } from '../parsers/registry';
import { CodeAnalyzer } from './analyzer';
import { CacheSystem } from '../utils/cache';
import { SearchQuery, SearchResult } from '../types/search';
import { ParsedAST, Language } from '../types/ast';
import { runTextSearch } from '../utils/ripgrep';

export class CoreEngine {
  private astParser: ASTParser;
  private codeAnalyzer: CodeAnalyzer;
  private cacheSystem: CacheSystem;

  constructor(
    astParser: ASTParser,
    codeAnalyzer: CodeAnalyzer,
    cacheSystem: CacheSystem
  ) {
    this.astParser = astParser;
    this.codeAnalyzer = codeAnalyzer;
    this.cacheSystem = cacheSystem;
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const cacheKey = this.buildSearchCacheKey(query);
    const cached = await this.cacheSystem.get<SearchResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await runTextSearch(query);
    await this.cacheSystem.set(cacheKey, results);
    return results;
  }

  async analyze(filePath: string): Promise<any> {
    console.log(`Analyzing file: ${filePath}`);

    // Parse the file to get AST
    const ast = await this.astParser.parseFile(filePath);

    // Analyze the AST
    const analysis = await this.codeAnalyzer.analyzeAST(ast);

    return analysis;
  }

  async extract(
    filePath: string,
    startLine: number,
    endLine: number
  ): Promise<string> {
    console.log(`Extracting lines ${startLine}-${endLine} from: ${filePath}`);

    // Implementation will be completed in future tasks
    return '';
  }

  async parseFile(filePath: string): Promise<ParsedAST> {
    console.log(`Parsing file: ${filePath}`);

    // Use the AST parser to parse the file
    const parsedAST = await this.astParser.parseFile(filePath);

    return parsedAST;
  }

  async getSupportedLanguages(): Promise<Language[]> {
    return this.astParser.getSupportedLanguages();
  }

  async initializeWorkspace(rootPath: string): Promise<void> {
    console.log(`Initializing workspace: ${rootPath}`);

    // Implementation will be completed in future tasks
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Core Engine');

    // Clear caches
    await this.cacheSystem.clear();
  }

  private buildSearchCacheKey(query: SearchQuery): string {
    const opts = query.options || {};
    return [
      'search',
      query.pattern,
      query.type,
      query.filePattern || '',
      query.language || '',
      opts.caseSensitive ? 'cs' : 'ci',
      opts.regex ? 're' : 'fs',
      opts.contextLines || 0,
      opts.maxResults || 'all',
    ].join(':');
  }
}
