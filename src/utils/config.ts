// src/utils/config.ts
import fs from 'fs';
import path from 'path';
import {
  CodeCompassConfig,
  LanguageConfig,
  LogLevel,
  TextDocumentSyncKind,
} from '../types/config';
import { Language } from '../types/ast';

const DEFAULT_CONFIG: CodeCompassConfig = {
  workspace: {
    rootPath: process.cwd(),
    excludePatterns: ['node_modules', 'dist', '.git'],
    maxFileSize: 1024 * 1024, // 1MB soft limit for parsing
    supportedLanguages: [
      Language.TypeScript,
      Language.JavaScript,
      Language.Python,
    ],
  },
  lsp: {
    enabled: true,
    stdio: true,
    logLevel: LogLevel.Info,
    maxConcurrentRequests: 8,
    responseTimeout: 5000,
    documentSyncMode: TextDocumentSyncKind.Incremental,
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      definitionProvider: true,
      referencesProvider: true,
      documentSymbolProvider: true,
      workspaceSymbolProvider: true,
    },
  },
  parsers: {
    languages: [Language.TypeScript, Language.JavaScript, Language.Python],
    parseTimeout: 3000,
    maxFileSize: 1024 * 1024,
    languageSettings: new Map<Language, LanguageConfig>(),
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

export function initializeConfig(configPath?: string): CodeCompassConfig {
  const resolvedPath =
    configPath || path.join(process.cwd(), 'code-compass.config.json');

  if (fs.existsSync(resolvedPath)) {
    try {
      const content = fs.readFileSync(resolvedPath, 'utf-8');
      const parsed = JSON.parse(content);
      return mergeConfig(DEFAULT_CONFIG, parsed);
    } catch (error) {
      console.warn(
        `Failed to read config at ${resolvedPath}, using defaults.`,
        error
      );
    }
  }

  return DEFAULT_CONFIG;
}

function mergeConfig(
  base: CodeCompassConfig,
  override: Partial<CodeCompassConfig>
): CodeCompassConfig {
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

function normalizeLanguageSettings(
  settings: any
): Map<Language, LanguageConfig> {
  if (settings instanceof Map) {
    return settings;
  }

  const map = new Map<Language, LanguageConfig>();
  if (typeof settings === 'object' && settings !== null) {
    for (const [key, value] of Object.entries(settings)) {
      if (Object.values(Language).includes(key as Language)) {
        map.set(key as Language, value as LanguageConfig);
      }
    }
  }
  return map;
}
