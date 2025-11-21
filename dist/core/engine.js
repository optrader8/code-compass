"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreEngine = void 0;
const search_1 = require("../types/search");
const ripgrep_1 = require("../utils/ripgrep");
const error_handler_1 = require("../utils/error-handler");
const fg = __importStar(require("fast-glob"));
class CoreEngine {
    constructor(astParser, codeAnalyzer, cacheSystem) {
        this.astParser = astParser;
        this.codeAnalyzer = codeAnalyzer;
        this.cacheSystem = cacheSystem;
    }
    async search(query) {
        const cacheKey = this.buildSearchCacheKey(query);
        const cached = await this.cacheSystem.get(cacheKey);
        if (cached) {
            return cached;
        }
        let results = [];
        try {
            switch (query.type) {
                case search_1.SearchType.Structural:
                case search_1.SearchType.Function:
                case search_1.SearchType.Class:
                case search_1.SearchType.Import:
                    results = await this.searchAST(query);
                    break;
                default:
                    results = await (0, ripgrep_1.runTextSearch)(query);
            }
            // Cache the results
            await this.cacheSystem.set(cacheKey, results);
            return results;
        }
        catch (error) {
            console.error(`Search error: ${error}`);
            // Use error handler to process the error
            const handledError = error_handler_1.ErrorHandler.handle(error, 'CoreEngine.search');
            // Try fallback to text search
            try {
                results = await (0, ripgrep_1.runTextSearch)(query);
                return results;
            }
            catch (fallbackError) {
                console.error('Fallback search also failed:', fallbackError);
                return [];
            }
        }
    }
    async searchAST(query) {
        // Find relevant files based on the query
        const pattern = query.filePattern || '**/*.{js,ts,py}';
        const files = await fg(pattern, {
            absolute: true,
            onlyFiles: true,
            ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**']
        });
        const results = [];
        for (const filePath of files) {
            try {
                // Parse the file
                const ast = await this.astParser.parseFile(filePath);
                // Perform AST-based search based on query type
                switch (query.type) {
                    case search_1.SearchType.Function:
                        results.push(...this.searchFunctions(ast, query));
                        break;
                    case search_1.SearchType.Class:
                        results.push(...this.searchClasses(ast, query));
                        break;
                    case search_1.SearchType.Import:
                        results.push(...this.searchImports(ast, query));
                        break;
                    case search_1.SearchType.Structural:
                        results.push(...this.searchStructural(ast, query));
                        break;
                }
            }
            catch (error) {
                console.error(`Error parsing ${filePath}:`, error);
                // Continue with other files
            }
        }
        return results;
    }
    searchFunctions(ast, query) {
        const results = [];
        if (!ast.functions)
            return results;
        for (const func of ast.functions) {
            if (func.name.toLowerCase().includes(query.pattern.toLowerCase())) {
                results.push(this.functionToResult(func, ast));
            }
        }
        return results;
    }
    searchClasses(ast, query) {
        const results = [];
        if (!ast.classes)
            return results;
        for (const cls of ast.classes) {
            if (cls.name.toLowerCase().includes(query.pattern.toLowerCase())) {
                results.push(this.classToResult(cls, ast));
            }
        }
        return results;
    }
    searchImports(ast, query) {
        const results = [];
        if (!ast.imports)
            return results;
        for (const imp of ast.imports) {
            if (imp.source.toLowerCase().includes(query.pattern.toLowerCase())) {
                results.push(this.importToResult(imp, ast));
            }
        }
        return results;
    }
    searchStructural(ast, query) {
        // For structural queries, use the AST query system
        try {
            const astQuery = {
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
        }
        catch (error) {
            console.error('Structural search failed:', error);
            return [];
        }
    }
    functionToResult(func, ast) {
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
            context: [],
            score: 1.0,
            metadata: {
                fileType: ast.filePath.split('.').pop() || '',
                language: ast.language,
                symbolType: 12,
                complexity: undefined,
                lastModified: new Date(ast.timestamp)
            }
        };
    }
    classToResult(cls, ast) {
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
                symbolType: 5,
                complexity: undefined,
                lastModified: new Date(ast.timestamp)
            }
        };
    }
    importToResult(imp, ast) {
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
                symbolType: 13,
                complexity: undefined,
                lastModified: new Date(ast.timestamp)
            }
        };
    }
    async analyze(filePath) {
        console.log(`Analyzing file: ${filePath}`);
        try {
            // Parse the file to get AST
            const ast = await this.astParser.parseFile(filePath);
            // Analyze the AST
            const analysis = await this.codeAnalyzer.analyzeAST(ast);
            return analysis;
        }
        catch (error) {
            const handledError = error_handler_1.ErrorHandler.handle(error, 'CoreEngine.analyze');
            console.error(handledError.message);
            if (handledError.recoverable) {
                return { error: handledError.message, recoverable: true };
            }
            throw handledError;
        }
    }
    async extract(filePath, startLine, endLine) {
        console.log(`Extracting lines ${startLine}-${endLine} from: ${filePath}`);
        try {
            // Parse the file to get content
            const ast = await this.astParser.parseFile(filePath);
            const lines = ast.content.split('\n');
            const extractedLines = lines.slice(Math.max(0, startLine - 1), Math.min(lines.length, endLine));
            return extractedLines.join('\n');
        }
        catch (error) {
            const handledError = error_handler_1.ErrorHandler.handle(error, 'CoreEngine.extract');
            console.error(handledError.message);
            return '';
        }
    }
    async parseFile(filePath) {
        console.log(`Parsing file: ${filePath}`);
        try {
            // Use the AST parser to parse the file
            const parsedAST = await this.astParser.parseFile(filePath);
            return parsedAST;
        }
        catch (error) {
            const handledError = error_handler_1.ErrorHandler.handle(error, 'CoreEngine.parseFile');
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
    async getSupportedLanguages() {
        return this.astParser.getSupportedLanguages();
    }
    async initializeWorkspace(rootPath) {
        console.log(`Initializing workspace: ${rootPath}`);
        // Implementation will be completed in future tasks
    }
    async shutdown() {
        console.log('Shutting down Core Engine');
        // Clear caches
        await this.cacheSystem.clear();
    }
    buildSearchCacheKey(query) {
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
exports.CoreEngine = CoreEngine;
//# sourceMappingURL=engine.js.map