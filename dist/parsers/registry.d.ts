import { LanguageParser } from './base';
import { ParsedAST, Language, ASTQuery, TextChange, CodeNode } from '../types/ast';
import { CacheSystem } from '../utils/cache';
export declare class ASTParser {
    private parsers;
    private fallbackParser;
    private cacheSystem?;
    constructor(cacheSystem?: CacheSystem);
    private initializeDefaultParsers;
    registerParser(language: Language, parser: LanguageParser): void;
    unregisterParser(language: Language): void;
    setFallbackParser(parser: LanguageParser): void;
    parseFile(filePath: string): Promise<ParsedAST>;
    parseContent(content: string, language: Language): Promise<ParsedAST>;
    updateAST(ast: ParsedAST, changes: TextChange[]): Promise<ParsedAST>;
    query(ast: ParsedAST, query: ASTQuery): CodeNode[];
    detectLanguage(filePath: string): Language;
    getSupportedLanguages(): Language[];
    private getParserForLanguage;
    private getFileExtension;
    private readFile;
}
//# sourceMappingURL=registry.d.ts.map