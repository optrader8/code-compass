"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeConfig = void 0;
// src/utils/config.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../types/config");
const ast_1 = require("../types/ast");
const DEFAULT_CONFIG = {
    workspace: {
        rootPath: process.cwd(),
        excludePatterns: ['node_modules', 'dist', '.git'],
        maxFileSize: 1024 * 1024,
        supportedLanguages: [
            ast_1.Language.TypeScript,
            ast_1.Language.JavaScript,
            ast_1.Language.Python,
        ],
    },
    lsp: {
        enabled: true,
        stdio: true,
        logLevel: config_1.LogLevel.Info,
        maxConcurrentRequests: 8,
        responseTimeout: 5000,
        documentSyncMode: config_1.TextDocumentSyncKind.Incremental,
        capabilities: {
            textDocumentSync: config_1.TextDocumentSyncKind.Incremental,
            hoverProvider: true,
            definitionProvider: true,
            referencesProvider: true,
            documentSymbolProvider: true,
            workspaceSymbolProvider: true,
        },
    },
    parsers: {
        languages: [ast_1.Language.TypeScript, ast_1.Language.JavaScript, ast_1.Language.Python],
        parseTimeout: 3000,
        maxFileSize: 1024 * 1024,
        languageSettings: new Map(),
    },
    cache: {
        enabled: true,
        memoryLimit: 10 * 1024 * 1024,
        diskLimit: 0,
        ttl: 10 * 60 * 1000,
        astCaching: true,
        searchCaching: true,
        metricsCaching: true,
    },
    analysis: {
        complexity: {
            calculateCyclomatic: true,
            calculateCognitive: false,
            calculateHalstead: false,
            calculateMaintainability: false,
            thresholds: {
                high: 15,
                medium: 8,
                low: 3,
            },
        },
        patternDetection: {
            enabledPatterns: [],
            customPatterns: [],
        },
        dependencyAnalysis: {
            analyzeImports: true,
            analyzeCalls: false,
            analyzeInheritance: false,
        },
    },
    plugins: {
        enabled: false,
        directories: [],
        allowDynamicLoading: false,
        allowedPlugins: [],
    },
};
function initializeConfig(configPath) {
    const resolvedPath = configPath || path_1.default.join(process.cwd(), 'code-compass.config.json');
    if (fs_1.default.existsSync(resolvedPath)) {
        try {
            const content = fs_1.default.readFileSync(resolvedPath, 'utf-8');
            const parsed = JSON.parse(content);
            return mergeConfig(DEFAULT_CONFIG, parsed);
        }
        catch (error) {
            console.warn(`Failed to read config at ${resolvedPath}, using defaults.`, error);
        }
    }
    return DEFAULT_CONFIG;
}
exports.initializeConfig = initializeConfig;
function mergeConfig(base, override) {
    return {
        ...base,
        ...override,
        workspace: { ...base.workspace, ...override.workspace },
        lsp: {
            ...base.lsp,
            ...override.lsp,
            capabilities: {
                ...base.lsp.capabilities,
                ...override?.lsp?.capabilities,
            },
        },
        parsers: {
            ...base.parsers,
            ...override.parsers,
            languageSettings: override.parsers?.languageSettings
                ? normalizeLanguageSettings(override.parsers.languageSettings)
                : base.parsers.languageSettings,
        },
        cache: { ...base.cache, ...override.cache },
        analysis: {
            ...base.analysis,
            ...override.analysis,
            complexity: {
                ...base.analysis.complexity,
                ...override.analysis?.complexity,
            },
            patternDetection: {
                ...base.analysis.patternDetection,
                ...override.analysis?.patternDetection,
            },
            dependencyAnalysis: {
                ...base.analysis.dependencyAnalysis,
                ...override.analysis?.dependencyAnalysis,
            },
        },
        plugins: { ...base.plugins, ...override.plugins },
    };
}
function normalizeLanguageSettings(settings) {
    if (settings instanceof Map) {
        return settings;
    }
    const map = new Map();
    if (typeof settings === 'object' && settings !== null) {
        for (const [key, value] of Object.entries(settings)) {
            if (Object.values(ast_1.Language).includes(key)) {
                map.set(key, value);
            }
        }
    }
    return map;
}
//# sourceMappingURL=config.js.map