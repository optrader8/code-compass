import { ParsedAST, ComplexityMetrics, Symbol, Location, ImportStatement, Language } from '../types/ast';
import { CacheSystem } from '../utils/cache';
export interface CodeSmell {
    type: string;
    message: string;
    location: Location;
    severity: 'low' | 'medium' | 'high';
}
export interface DependencyGraph {
    imports: ImportStatement[];
    exports: any[];
    callGraph: Map<string, string[]>;
}
export interface AnalysisResult {
    filePath: string;
    language: Language;
    complexity: ComplexityMetrics;
    symbols: Symbol[];
    dependencies: DependencyGraph;
    metrics: any;
    codeSmells: CodeSmell[];
    patterns: any[];
}
export declare class CodeAnalyzer {
    private cacheSystem;
    constructor(cacheSystem: CacheSystem);
    analyzeAST(ast: ParsedAST): Promise<AnalysisResult>;
    calculateComplexity(ast: ParsedAST): Promise<ComplexityMetrics>;
    private calculateCyclomaticComplexity;
    private calculateCognitiveComplexity;
    private calculateHalsteadMetrics;
    private calculateMaintainability;
    private calculateMaxNesting;
    analyzeDependencies(ast: ParsedAST): Promise<DependencyGraph>;
    calculateMetrics(ast: ParsedAST): Promise<any>;
    private countLinesWithoutComments;
    private countCommentLines;
    detectCodeSmells(ast: ParsedAST): Promise<CodeSmell[]>;
    analyzeSymbol(symbol: Symbol, context: any): Promise<any>;
    private calculateComplexityForSymbol;
    private findSymbolReferences;
    private findSymbolDependencies;
    private findRelatedSymbols;
    detectPatterns(ast: ParsedAST): Promise<any[]>;
    private extractDocumentation;
}
//# sourceMappingURL=analyzer.d.ts.map