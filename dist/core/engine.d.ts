import { ASTParser } from '../parsers/registry';
import { CodeAnalyzer } from './analyzer';
import { CacheSystem } from '../utils/cache';
import { SearchQuery, SearchResult } from '../types/search';
import { ParsedAST, Language } from '../types/ast';
export declare class CoreEngine {
    private astParser;
    private codeAnalyzer;
    private cacheSystem;
    constructor(astParser: ASTParser, codeAnalyzer: CodeAnalyzer, cacheSystem: CacheSystem);
    search(query: SearchQuery): Promise<SearchResult[]>;
    private searchAST;
    private searchFunctions;
    private searchClasses;
    private searchImports;
    private searchStructural;
    private functionToResult;
    private classToResult;
    private importToResult;
    analyze(filePath: string): Promise<any>;
    extract(filePath: string, startLine: number, endLine: number): Promise<string>;
    parseFile(filePath: string): Promise<ParsedAST>;
    getSupportedLanguages(): Promise<Language[]>;
    initializeWorkspace(rootPath: string): Promise<void>;
    shutdown(): Promise<void>;
    private buildSearchCacheKey;
}
//# sourceMappingURL=engine.d.ts.map