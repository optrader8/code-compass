# Code Compass Development Guide

This guide covers contributing to Code Compass, including development setup, architecture, testing, and deployment processes.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Adding New Features](#adding-new-features)
- [Language Support](#language-support)
- [Performance](#performance)
- [Release Process](#release-process)
- [Debugging](#debugging)

## Development Setup

### Prerequisites

- Node.js 16+ (recommended 18+)
- npm 8+ or yarn 1.22+
- Git 2.25+
- TypeScript 4.8+
- Basic familiarity with AST parsing

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/code-compass.git
cd code-compass

# Install dependencies
npm install

# Run initial build
npm run build

# Run tests to verify setup
npm test
```

### Development Environment

```bash
# Start development mode with watch
npm run dev

# Run linter in watch mode
npm run lint -- --watch

# Run tests in watch mode
npm run test:watch
```

### IDE Configuration

#### VS Code

Install these extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Jest Runner

VS Code settings (`.vscode/settings.json`):

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

#### Workspace Configuration

Create `code-compass.code-workspace`:

```json
{
  "folders": [
    { "path": "." }
  ],
  "settings": {
    "typescript.preferences.includePackageJsonAutoImports": "auto"
  },
  "launch": {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Debug Code Compass",
        "type": "node",
        "request": "launch",
        "program": "${workspaceFolder}/dist/index.js",
        "console": "integratedTerminal",
        "preLaunchTask": "npm: build"
      }
    ]
  }
}
```

## Project Architecture

### Directory Structure

```
code-compass/
├── src/
│   ├── core/                   # Core business logic
│   │   ├── engine.ts          # Main orchestration engine
│   │   └── analyzer.ts        # Code analysis logic
│   ├── parsers/               # Language-specific parsers
│   │   ├── base.ts            # Base parser interface
│   │   ├── registry.ts        # Parser registry
│   │   ├── typescript.ts      # TS/JS parser
│   │   └── python.ts          # Python parser
│   ├── utils/                 # Utility modules
│   │   ├── cache.ts           # LRU cache implementation
│   │   ├── ripgrep.ts         # Text search wrapper
│   │   ├── formatters.ts      # Output formatters
│   │   └── config.ts          # Configuration management
│   ├── types/                 # TypeScript type definitions
│   │   ├── ast.ts             # AST-related types
│   │   ├── config.ts          # Configuration types
│   │   ├── search.ts          # Search query/result types
│   │   └── shims.d.ts         # Type shims
│   ├── ui/                    # ink-based UI components
│   │   └── BasicApp.tsx       # Main TUI component
│   ├── lsp-server.ts          # LSP server implementation
│   └── index.ts               # CLI entry point
├── docs/                      # Documentation
├── tests/                     # Test files
├── fixtures/                  # Test fixtures and samples
├── dist/                      # Compiled output
└── scripts/                   # Build and utility scripts
```

### Core Components

#### CoreEngine

The main orchestrator that coordinates all components:

```typescript
class CoreEngine {
  constructor(
    private astParser: ASTParser,
    private codeAnalyzer: CodeAnalyzer,
    private cacheSystem: CacheSystem
  ) {}

  async search(query: SearchQuery): Promise<SearchResult[]>
  async analyze(filePath: string): Promise<AnalysisResult>
  async extract(filePath: string, startLine: number, endLine: number): Promise<string>
}
```

#### ASTParser

Multi-language parser using tree-sitter:

```typescript
class ASTParser {
  private parsers: Map<Language, BaseParser>

  parseFile(filePath: string): Promise<ParsedAST>
  getSupportedLanguages(): Language[]
  registerParser(language: Language, parser: BaseParser): void
}
```

#### BaseParser

Interface for language-specific parsers:

```typescript
abstract class BaseParser {
  abstract parse(filePath: string, content: string): ParseResult
  abstract extractFunctions(node: SyntaxNode): FunctionDeclaration[]
  abstract extractClasses(node: SyntaxNode): ClassDeclaration[]
  abstract extractImports(node: SyntaxNode): ImportDeclaration[]
}
```

### Data Flow

```
User Input → CLI Parser → CoreEngine → {
  Text Search → ripgrep → Results
  AST Parsing → Language Parser → ParseResult
  Analysis → CodeAnalyzer → Metadata
} → Formatters → Output
```

## Code Standards

### TypeScript Configuration

- **Strict Mode**: Enabled with comprehensive type checking
- **Target**: ES2020 with CommonJS modules
- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Required
- **Quotes**: Single quotes for strings

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `SearchEngine`, `ASTParser` |
| Functions | camelCase | `parseFile`, `searchCode` |
| Variables | camelCase | `fileName`, `searchResults` |
| Constants | UPPER_SNAKE_CASE | `MAX_RESULTS`, `DEFAULT_TIMEOUT` |
| Interfaces | PascalCase | `SearchResult`, `ParsedAST` |
| Types | PascalCase | `Language`, `SearchType` |
| Files | kebab-case | `search-engine.ts`, `ast-parser.ts` |

### Code Organization

#### Module Structure

```typescript
// 1. Imports (external first, then internal)
import { readFile } from 'fs/promises';
import { SearchQuery } from '../types/search';

// 2. Type definitions (if needed)
interface SearchResult {
  // ...
}

// 3. Constants
const MAX_RESULTS = 1000;

// 4. Class/function implementation
export class SearchEngine {
  // ...
}

// 5. Exports
export { SearchEngine, SearchResult };
```

#### Error Handling

```typescript
// Use proper error types
class SearchError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'SearchError';
  }
}

// Handle errors appropriately
try {
  const results = await this.search(query);
  return results;
} catch (error) {
  if (error instanceof SearchError) {
    throw error;
  }
  throw new SearchError('Search failed', 'SEARCH_ERROR', error);
}
```

### Documentation Standards

#### JSDoc Comments

```typescript
/**
 * Search for code patterns using the specified query.
 *
 * @param query - The search query containing pattern and options
 * @returns Promise resolving to array of search results
 * @throws {SearchError} When search pattern is invalid
 *
 * @example
 * ```typescript
 * const results = await searchEngine.search({
 *   pattern: 'getUserById',
 *   type: SearchType.Function,
 *   options: { caseSensitive: false }
 * });
 * ```
 */
async search(query: SearchQuery): Promise<SearchResult[]> {
  // Implementation
}
```

#### Inline Comments

```typescript
// Calculate cyclomatic complexity using control flow analysis
const complexity = this.calculateComplexity(node);

// TODO: Add support for async/await patterns
// FIXME: This regex doesn't handle nested templates properly
```

## Testing

### Test Structure

```
tests/
├── unit/                      # Unit tests
│   ├── core/
│   │   ├── engine.test.ts
│   │   └── analyzer.test.ts
│   ├── parsers/
│   │   ├── typescript.test.ts
│   │   └── python.test.ts
│   └── utils/
│       ├── cache.test.ts
│       └── formatters.test.ts
├── integration/               # Integration tests
│   ├── cli.test.ts
│   └── lsp.test.ts
├── fixtures/                  # Test fixtures
│   ├── typescript/
│   ├── python/
│   └── javascript/
└── helpers/                   # Test utilities
    ├── mock-parser.ts
    └── test-utils.ts
```

### Unit Tests

#### Test Structure

```typescript
// tests/unit/core/engine.test.ts
import { CoreEngine } from '../../../src/core/engine';
import { SearchQuery, SearchType } from '../../../src/types/search';
import { MockASTParser, MockCodeAnalyzer } from '../../helpers';

describe('CoreEngine', () => {
  let engine: CoreEngine;
  let mockParser: MockASTParser;
  let mockAnalyzer: MockCodeAnalyzer;

  beforeEach(() => {
    mockParser = new MockASTParser();
    mockAnalyzer = new MockCodeAnalyzer();
    engine = new CoreEngine(mockParser, mockAnalyzer, new MockCache());
  });

  describe('search', () => {
    it('should return search results for text queries', async () => {
      const query: SearchQuery = {
        pattern: 'test',
        type: SearchType.Text,
        options: {}
      };

      const results = await engine.search(query);

      expect(results).toHaveLength(1);
      expect(results[0].content).toContain('test');
    });

    it('should handle empty results gracefully', async () => {
      const query: SearchQuery = {
        pattern: 'nonexistent',
        type: SearchType.Text,
        options: {}
      };

      const results = await engine.search(query);

      expect(results).toHaveLength(0);
    });
  });
});
```

#### Test Helpers

```typescript
// tests/helpers/mock-parser.ts
export class MockASTParser extends BaseParser {
  parse(filePath: string, content: string): ParseResult {
    return {
      language: 'typescript',
      functions: [],
      classes: [],
      imports: [],
      exports: []
    };
  }
}

// tests/helpers/test-utils.ts
export function createMockSearchResult(overrides = {}): SearchResult {
  return {
    location: {
      uri: 'file:///test.ts',
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } }
    },
    content: 'test content',
    context: ['test content'],
    score: 1.0,
    metadata: {
      fileType: 'typescript',
      language: 'typescript',
      lastModified: new Date()
    },
    ...overrides
  };
}
```

### Integration Tests

```typescript
// tests/integration/cli.test.ts
import { execSync } from 'child_process';

describe('CLI Integration', () => {
  it('should search for patterns in TypeScript files', () => {
    const result = execSync('npx code-compass search "test" --json', {
      cwd: process.cwd(),
      encoding: 'utf8'
    });

    const output = JSON.parse(result);
    expect(output.results).toBeDefined();
    expect(output.count).toBeGreaterThanOrEqual(0);
  });

  it('should analyze code complexity', () => {
    const result = execSync('npx code-compass analyze ./fixtures --json', {
      cwd: process.cwd(),
      encoding: 'utf8'
    });

    const output = JSON.parse(result);
    expect(output.metrics).toBeDefined();
  });
});
```

### Test Coverage

Run coverage reports:

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html

# Check coverage thresholds
npm run test:coverage -- --coverageThresholds '{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

## Adding New Features

### Feature Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Update Types**
   - Add/modify types in `src/types/`
   - Update interfaces as needed

3. **Implement Logic**
   - Add core functionality
   - Follow existing patterns

4. **Add Tests**
   - Unit tests for new functionality
   - Integration tests for end-to-end scenarios

5. **Update Documentation**
   - API documentation
   - README updates
   - Example usage

6. **Submit Pull Request**
   - Clear description of changes
   - Testing performed
   - Breaking changes noted

### Example: Adding New Search Type

#### 1. Update Types

```typescript
// src/types/search.ts
export enum SearchType {
  Text = 'text',
  Function = 'function',
  Class = 'class',
  Import = 'import',
  Variable = 'variable',
  Comment = 'comment',  // New type
  Structural = 'structural',
  Semantic = 'semantic',
}
```

#### 2. Implement Parser Logic

```typescript
// src/parsers/base.ts
abstract class BaseParser {
  // ... existing methods

  extractComments(node: SyntaxNode): CommentDeclaration[] {
    // Default implementation
    return [];
  }
}
```

#### 3. Update Specific Parser

```typescript
// src/parsers/typescript.ts
class TypeScriptParser extends BaseParser {
  extractComments(node: SyntaxNode): CommentDeclaration[] {
    const comments: CommentDeclaration[] = [];

    // Walk the tree to find comment nodes
    const visit = (n: SyntaxNode) => {
      if (n.type === 'comment') {
        comments.push({
          content: n.text,
          range: this.toRange(n),
          type: n.text.startsWith('*') ? 'block' : 'line'
        });
      }

      for (const child of n.children) {
        visit(child);
      }
    };

    visit(node);
    return comments;
  }
}
```

#### 4. Add Tests

```typescript
// tests/unit/parsers/typescript.test.ts
describe('TypeScriptParser', () => {
  describe('extractComments', () => {
    it('should extract line comments', () => {
      const code = `
        // This is a line comment
        const x = 1;
      `;

      const result = parser.parse('test.ts', code);
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].type).toBe('line');
    });
  });
});
```

#### 5. Update CLI

```typescript
// src/index.ts
program
  .command('search')
  .option('-t, --type <type>', 'Search type (text, function, class, comment, etc.)')
  // ... rest of options
```

## Language Support

### Adding New Language Support

#### 1. Install Tree-sitter Parser

```bash
npm install tree-sitter-[language]
```

#### 2. Create Parser Implementation

```typescript
// src/parsers/rust.ts
import * as Rust from 'tree-sitter-rust';
import { BaseParser, ParseResult } from './base';

export class RustParser extends BaseParser {
  constructor() {
    super();
    this.parser = new Parser();
    this.parser.setLanguage(Rust);
  }

  parse(filePath: string, content: string): ParseResult {
    const tree = this.parser.parse(content);

    return {
      language: 'rust',
      functions: this.extractFunctions(tree.rootNode),
      classes: this.extractStructs(tree.rootNode),
      imports: this.extractImports(tree.rootNode),
      exports: this.extractExports(tree.rootNode)
    };
  }

  private extractStructs(node: SyntaxNode): ClassDeclaration[] {
    // Rust-specific struct extraction
    const structs: ClassDeclaration[] = [];
    this.walkTree(node, (n) => {
      if (n.type === 'struct_item') {
        structs.push({
          name: this.extractName(n),
          range: this.toRange(n),
          methods: this.extractImplMethods(n)
        });
      }
    });
    return structs;
  }
}
```

#### 3. Register Parser

```typescript
// src/parsers/registry.ts
import { RustParser } from './rust';

class ASTParser {
  constructor() {
    this.parsers = new Map();
    this.registerParser(Language.Rust, new RustParser());
  }
}
```

#### 4. Add Tests

```typescript
// tests/unit/parsers/rust.test.ts
import { RustParser } from '../../../src/parsers/rust';

describe('RustParser', () => {
  let parser: RustParser;

  beforeEach(() => {
    parser = new RustParser();
  });

  it('should parse Rust struct definitions', () => {
    const code = `
      struct User {
        id: u64,
        name: String,
      }
    `;

    const result = parser.parse('user.rs', code);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].name).toBe('User');
  });
});
```

#### 5. Update Documentation

```typescript
// src/types/ast.ts
export enum Language {
  TypeScript = 'typescript',
  JavaScript = 'javascript',
  Python = 'python',
  Rust = 'rust',  // New language
  Go = 'go',
  Java = 'java',
}
```

## Performance

### Performance Guidelines

#### 1. Caching Strategy

```typescript
// Use LRU cache for expensive operations
class SearchEngine {
  private searchCache = new LRUCache<string, SearchResult[]>(1000);

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const cacheKey = this.buildCacheKey(query);
    const cached = this.searchCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const results = await this.performSearch(query);
    this.searchCache.set(cacheKey, results);
    return results;
  }
}
```

#### 2. Lazy Loading

```typescript
// Load parsers only when needed
class ASTParser {
  private parsers: Map<Language, Lazy<BaseParser>> = new Map();

  private getParser(language: Language): BaseParser {
    const lazyParser = this.parsers.get(language);
    if (!lazyParser) {
      throw new Error(`No parser available for ${language}`);
    }
    return lazyParser.getValue();
  }
}
```

#### 3. Streaming Results

```typescript
// Use streams for large result sets
import { Readable } from 'stream';

class SearchResultStreamer extends Readable {
  constructor(
    private searchEngine: CoreEngine,
    private query: SearchQuery
  ) {
    super({ objectMode: true });
  }

  _read() {
    this.searchEngine.searchStream(this.query)
      .on('data', (result) => this.push(result))
      .on('end', () => this.push(null));
  }
}
```

### Performance Monitoring

```typescript
// Add performance metrics
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(operation: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.recordMetric(operation, duration);
    };
  }

  getStats(operation: string): { avg: number; min: number; max: number } {
    const times = this.metrics.get(operation) || [];
    return {
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times)
    };
  }
}
```

### Benchmarks

Create benchmark tests:

```typescript
// tests/performance/search.benchmark.ts
import { performance } from 'perf_hooks';

describe('Search Performance', () => {
  it('should search 10,000 files in under 1 second', async () => {
    const start = performance.now();

    await searchEngine.search({
      pattern: 'function',
      type: SearchType.Function,
      options: { maxResults: 100 }
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
```

## Release Process

### Version Management

Use semantic versioning:

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Pre-release Checklist

1. **Tests Pass**
   ```bash
   npm test
   npm run test:coverage
   ```

2. **Build Success**
   ```bash
   npm run build
   npm run lint
   ```

3. **Documentation Updated**
   - API docs
   - README
   - CHANGELOG

4. **Version Updated**
   ```bash
   npm version patch  # or minor, major
   ```

### Publishing

```bash
# Build for production
npm run build

# Publish to npm
npm publish

# Create git tag
git tag v1.0.0
git push origin v1.0.0
```

## Debugging

### Debug Configuration

VS Code launch configuration (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug CLI",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/index.js",
      "args": ["search", "test", "--json"],
      "console": "integratedTerminal",
      "preLaunchTask": "npm: build",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug LSP Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/lsp-server.js",
      "args": ["--stdio"],
      "console": "integratedTerminal",
      "preLaunchTask": "npm: build"
    }
  ]
}
```

### Logging

```typescript
// src/utils/logger.ts
import debug from 'debug';

export const logger = {
  search: debug('code-compass:search'),
  parser: debug('code-compass:parser'),
  lsp: debug('code-compass:lsp'),
  cache: debug('code-compass:cache')
};

// Enable debug logging
DEBUG=code-compass:* npm start
```

### Common Issues

#### 1. Tree-sitter Parser Issues

```typescript
// Validate parser installation
try {
  const Parser = require('tree-sitter');
  const Language = require('tree-sitter-typescript');

  const parser = new Parser();
  parser.setLanguage(Language);
  console.log('Parser initialized successfully');
} catch (error) {
  console.error('Parser initialization failed:', error);
}
```

#### 2. Memory Issues

```typescript
// Monitor memory usage
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100
  });
}, 10000);
```

---

For more information, see the [API documentation](API.md) or [interactive interface guide](INTERACTIVE.md).