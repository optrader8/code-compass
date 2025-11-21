import { Language } from './ast';
export interface CodeCompassConfig {
    workspace: WorkspaceConfig;
    lsp: LSPConfig;
    parsers: ParserConfig;
    cache: CacheConfig;
    analysis: AnalysisConfig;
    plugins: PluginConfig;
}
export interface WorkspaceConfig {
    rootPath: string;
    excludePatterns: string[];
    maxFileSize: number;
    supportedLanguages: Language[];
}
export interface LSPConfig {
    enabled: boolean;
    port?: number;
    stdio: boolean;
    logLevel: LogLevel;
    capabilities: LSPCapabilities;
    maxConcurrentRequests: number;
    responseTimeout: number;
    documentSyncMode: TextDocumentSyncKind;
}
export interface ParserConfig {
    languages: Language[];
    treeSitterPath?: string;
    parseTimeout: number;
    maxFileSize: number;
    languageSettings: Map<Language, LanguageConfig>;
}
export interface LanguageConfig {
    parserPath: string;
    queryPath?: string;
    options: Record<string, any>;
}
export interface CacheConfig {
    enabled: boolean;
    memoryLimit: number;
    diskLimit: number;
    ttl: number;
    astCaching: boolean;
    searchCaching: boolean;
    metricsCaching: boolean;
}
export interface AnalysisConfig {
    complexity: ComplexityConfig;
    patternDetection: PatternDetectionConfig;
    dependencyAnalysis: DependencyAnalysisConfig;
}
export interface ComplexityConfig {
    calculateCyclomatic: boolean;
    calculateCognitive: boolean;
    calculateHalstead: boolean;
    calculateMaintainability: boolean;
    thresholds: ComplexityThresholds;
}
export interface ComplexityThresholds {
    high: number;
    medium: number;
    low: number;
}
export interface PatternDetectionConfig {
    enabledPatterns: string[];
    customPatterns: PatternDefinition[];
}
export interface DependencyAnalysisConfig {
    analyzeImports: boolean;
    analyzeCalls: boolean;
    analyzeInheritance: boolean;
}
export interface PluginConfig {
    enabled: boolean;
    directories: string[];
    allowDynamicLoading: boolean;
    allowedPlugins: string[];
}
export interface LSPCapabilities {
    textDocumentSync: TextDocumentSyncKind;
    hoverProvider: boolean;
    definitionProvider: boolean;
    referencesProvider: boolean;
    documentSymbolProvider: boolean;
    workspaceSymbolProvider: boolean;
    completionProvider?: CompletionOptions;
    codeActionProvider?: CodeActionOptions;
    codeLensProvider?: CodeLensOptions;
    experimental?: {
        codeMetrics: boolean;
        semanticSearch: boolean;
        structuralPatterns: boolean;
    };
}
export interface CompletionOptions {
    triggerCharacters?: string[];
}
export interface CodeActionOptions {
    codeActionKinds?: string[];
}
export interface CodeLensOptions {
    resolveProvider?: boolean;
}
export declare enum TextDocumentSyncKind {
    None = 0,
    Full = 1,
    Incremental = 2
}
export declare enum LogLevel {
    Error = "error",
    Warn = "warn",
    Info = "info",
    Debug = "debug"
}
export interface PatternDefinition {
    name: string;
    language: Language;
    pattern: string;
    description: string;
    severity: 'error' | 'warning' | 'info';
}
//# sourceMappingURL=config.d.ts.map