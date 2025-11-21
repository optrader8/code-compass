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
exports.ASTParser = void 0;
const ast_1 = require("../types/ast");
const typescript_1 = require("./typescript");
const python_1 = require("./python");
const crypto_1 = require("crypto");
class ASTParser {
    constructor(cacheSystem) {
        this.parsers = new Map();
        this.fallbackParser = null;
        this.cacheSystem = cacheSystem;
        this.initializeDefaultParsers();
    }
    initializeDefaultParsers() {
        const tsParser = new typescript_1.TypeScriptParser();
        const pyParser = new python_1.PythonParser();
        this.registerParser(ast_1.Language.TypeScript, tsParser);
        this.registerParser(ast_1.Language.JavaScript, tsParser);
        this.registerParser(ast_1.Language.Python, pyParser);
    }
    registerParser(language, parser) {
        this.parsers.set(language, parser);
    }
    unregisterParser(language) {
        this.parsers.delete(language);
    }
    setFallbackParser(parser) {
        this.fallbackParser = parser;
    }
    async parseFile(filePath) {
        const content = await this.readFile(filePath);
        const language = this.detectLanguage(filePath);
        const hash = (0, crypto_1.createHash)('sha1').update(content).digest('hex');
        const cacheKey = `ast:${filePath}:${hash}`;
        if (this.cacheSystem) {
            const cached = await this.cacheSystem.get(cacheKey);
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
    async parseContent(content, language) {
        const hash = (0, crypto_1.createHash)('sha1').update(content).digest('hex');
        const cacheKey = `ast:content:${language}:${hash}`;
        if (this.cacheSystem) {
            const cached = await this.cacheSystem.get(cacheKey);
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
    async updateAST(ast, changes) {
        const parser = this.getParserForLanguage(ast.language);
        if (parser && parser.updateAST) {
            return parser.updateAST(ast, changes);
        }
        // Fallback: re-parse the content
        return this.parseContent(ast.content, ast.language);
    }
    query(ast, query) {
        const parser = this.getParserForLanguage(ast.language);
        if (!parser) {
            throw new Error(`No parser available for language: ${ast.language}`);
        }
        return parser.query(ast, query);
    }
    detectLanguage(filePath) {
        const ext = filePath.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'ts':
                return ast_1.Language.TypeScript;
            case 'js':
            case 'jsx':
                return ast_1.Language.JavaScript;
            case 'py':
                return ast_1.Language.Python;
            case 'go':
                return ast_1.Language.Go;
            case 'rs':
                return ast_1.Language.Rust;
            case 'java':
                return ast_1.Language.Java;
            case 'cpp':
            case 'cxx':
            case 'cc':
            case 'c++':
                return ast_1.Language.Cpp;
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
    getSupportedLanguages() {
        return Array.from(this.parsers.keys());
    }
    getParserForLanguage(language) {
        return this.parsers.get(language);
    }
    getFileExtension(language) {
        switch (language) {
            case ast_1.Language.TypeScript:
                return 'ts';
            case ast_1.Language.JavaScript:
                return 'js';
            case ast_1.Language.Python:
                return 'py';
            case ast_1.Language.Go:
                return 'go';
            case ast_1.Language.Rust:
                return 'rs';
            case ast_1.Language.Java:
                return 'java';
            case ast_1.Language.Cpp:
                return 'cpp';
            default:
                return 'txt';
        }
    }
    async readFile(filePath) {
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        return fs.promises.readFile(filePath, 'utf-8');
    }
}
exports.ASTParser = ASTParser;
//# sourceMappingURL=registry.js.map