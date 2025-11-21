// src/core/engine.ts
import { ASTParser } from '../parsers/registry';
import { CodeAnalyzer } from './analyzer';
import { CacheSystem } from '../utils/cache';
import { SearchQuery, SearchResult, SearchType } from '../types/search';
import { ParsedAST, Language, ASTQuery } from '../types/ast';
import { runTextSearch } from '../utils/ripgrep';
import { ErrorHandler } from '../utils/error-handler';
import fg from 'fast-glob';

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

    let results: SearchResult[] = [];

    try {
      switch (query.type) {
        case SearchType.Structural:
        case SearchType.Function:
        case SearchType.Class:
        case SearchType.Import:
          results = await this.searchAST(query);
          break;
        default:
          results = await runTextSearch(query);
      }

      // Cache the results
      await this.cacheSystem.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error(`Search error: ${error}`);

      // Use error handler to process the error
      const handledError = ErrorHandler.handle(error, 'CoreEngine.search');

      // Try fallback to text search
      try {
        results = await runTextSearch(query);
        return results;
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        return [];
      }
    }
  }

  private async searchAST(query: SearchQuery): Promise<SearchResult[]> {
    // Find relevant files based on the query
    const pattern = query.filePattern || '**/*.{js,ts,py}';
    const files = await fg(pattern, {
      absolute: true,
      onlyFiles: true,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**']
    });

    const results: SearchResult[] = [];

    for (const filePath of files) {
      try {
        // Parse the file
        const ast = await this.astParser.parseFile(filePath);

        // Perform AST-based search based on query type
        switch (query.type) {
          case SearchType.Function:
            results.push(...this.searchFunctions(ast, query));
            break;
          case SearchType.Class:
            results.push(...this.searchClasses(ast, query));
            break;
          case SearchType.Import:
            results.push(...this.searchImports(ast, query));
            break;
          case SearchType.Structural:
            results.push(...this.searchStructural(ast, query));
            break;
        }
      } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
        // Continue with other files
      }
    }

    return results;
  }

  private searchFunctions(ast: ParsedAST, query: SearchQuery): SearchResult[] {
    const results: SearchResult[] = [];

    if (!ast.functions) return results;

    for (const func of ast.functions) {
      if (func.name.toLowerCase().includes(query.pattern.toLowerCase())) {
        results.push(this.functionToResult(func, ast));
      }
    }

    return results;
  }

  private searchClasses(ast: ParsedAST, query: SearchQuery): SearchResult[] {
    const results: SearchResult[] = [];

    if (!ast.classes) return results;

    for (const cls of ast.classes) {
      if (cls.name.toLowerCase().includes(query.pattern.toLowerCase())) {
        results.push(this.classToResult(cls, ast));
      }
    }

    return results;
  }

  private searchImports(ast: ParsedAST, query: SearchQuery): SearchResult[] {
    const results: SearchResult[] = [];

    if (!ast.imports) return results;

    for (const imp of ast.imports) {
      if (imp.source.toLowerCase().includes(query.pattern.toLowerCase())) {
        results.push(this.importToResult(imp, ast));
      }
    }

    return results;
  }

  private searchStructural(ast: ParsedAST, query: SearchQuery): SearchResult[] {
    // For structural queries, use the AST query system
    try {
      const astQuery: ASTQuery = {
        pattern: query.pattern,
        language: query.language
      };

      const nodes = this.astParser.query(ast, astQuery);

      // Convert nodes to search results
      return nodes.map(node => {
        return {
          location: {
            uri: `file://${ast.filePath}`,
            range: node.range
          },
          content: node.text,
          context: [],
          score: 1.0,
          metadata: {
            fileType: ast.filePath.split('.').pop() || '',
            language: ast.language,
            lastModified: new Date(ast.timestamp)
          }
        };
      });
    } catch (error) {
      console.error('Structural search failed:', error);
      return [];
    }
  }

  private functionToResult(func: any, ast: ParsedAST): SearchResult {
    // Read the content from the file to get the actual function text
    const content = ast.content.split('\n')
      .slice(func.range.start.line, func.range.end.line + 1)
      .join('\n');

    return {
      location: {
        uri: `file://${ast.filePath}`,
        range: func.range
      },
      content,
      context: [], // Could be enhanced to include surrounding context
      score: 1.0,
      metadata: {
        fileType: ast.filePath.split('.').pop() || '',
        language: ast.language,
        symbolType: 12, // SymbolKind.Function
        complexity: undefined, // Would be computed in analysis
        lastModified: new Date(ast.timestamp)
      }
    };
  }

  private classToResult(cls: any, ast: ParsedAST): SearchResult {
    // Read the content from the file to get the actual class text
    const content = ast.content.split('\n')
      .slice(cls.range.start.line, cls.range.end.line + 1)
      .join('\n');

    return {
      location: {
        uri: `file://${ast.filePath}`,
        range: cls.range
      },
      content,
      context: [],
      score: 1.0,
      metadata: {
        fileType: ast.filePath.split('.').pop() || '',
        language: ast.language,
        symbolType: 5, // SymbolKind.Class
        complexity: undefined,
        lastModified: new Date(ast.timestamp)
      }
    };
  }

  private importToResult(imp: any, ast: ParsedAST): SearchResult {
    // Read the content from the file to get the actual import text
    const content = ast.content.split('\n')
      .slice(imp.range.start.line, imp.range.end.line + 1)
      .join('\n');

    return {
      location: {
        uri: `file://${ast.filePath}`,
        range: imp.range
      },
      content,
      context: [],
      score: 1.0,
      metadata: {
        fileType: ast.filePath.split('.').pop() || '',
        language: ast.language,
        symbolType: 13, // SymbolKind.Variable
        complexity: undefined,
        lastModified: new Date(ast.timestamp)
      }
    };
  }

  async analyze(filePath: string): Promise<any> {
    console.log(`Analyzing file: ${filePath}`);

    try {
      // Parse the file to get AST
      const ast = await this.astParser.parseFile(filePath);

      // Analyze the AST
      const analysis = await this.codeAnalyzer.analyzeAST(ast);

      return analysis;
    } catch (error) {
      const handledError = ErrorHandler.handle(error, 'CoreEngine.analyze');
      console.error(handledError.message);

      if (handledError.recoverable) {
        return { error: handledError.message, recoverable: true };
      }

      throw handledError;
    }
  }

  async extract(
    filePath: string,
    startLine: number,
    endLine: number
  ): Promise<string> {
    console.log(`Extracting lines ${startLine}-${endLine} from: ${filePath}`);

    try {
      // Parse the file to get content
      const ast = await this.astParser.parseFile(filePath);

      const lines = ast.content.split('\n');
      const extractedLines = lines.slice(Math.max(0, startLine - 1), Math.min(lines.length, endLine));

      return extractedLines.join('\n');
    } catch (error) {
      const handledError = ErrorHandler.handle(error, 'CoreEngine.extract');
      console.error(handledError.message);
      return '';
    }
  }

  async parseFile(filePath: string): Promise<ParsedAST> {
    console.log(`Parsing file: ${filePath}`);

    try {
      // Use the AST parser to parse the file
      const parsedAST = await this.astParser.parseFile(filePath);

      return parsedAST;
    } catch (error) {
      const handledError = ErrorHandler.handle(error, 'CoreEngine.parseFile');
      console.error(handledError.message);

      if (handledError.recoverable) {
        // Return a minimal ParsedAST with error info
        return {
          language: this.astParser.detectLanguage(filePath),
          filePath,
          content: '',
          tree: null,
          hash: '',
          timestamp: Date.now(),
          symbols: [],
          imports: [],
          exports: [],
          functions: [],
          classes: []
        };
      }

      throw handledError;
    }
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
