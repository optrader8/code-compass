# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Code Compass** is a Node.js/TypeScript CLI tool for intelligent codebase search and analysis. It enables developers and LLM coding agents to rapidly locate and understand code structures (functions, classes, imports) across large codebases while providing rich metadata, dependencies, and context.

**Key Differentiator:** Unlike traditional search tools (ripgrep, ctags), Code Compass combines **fast text search + AST-aware structural analysis + agent-friendly output formats** to bridge the gap between simple grep and full IDE capabilities.

### Project Status
- **Phase:** Early development (LSP server scaffolded, core architecture in place)
- **Git Workflow:** Established with commit format `[YYYYMMDD] task: description`
- **Target Users:** Developers and LLM coding agents
- **Core Value:** Provide deterministic, parseable output with accurate code boundaries and metadata

---

## Technology Stack

### Core Dependencies
- **Language:** TypeScript (strict mode, 2-space indentation)
- **Runtime:** Node.js
- **Search Engine:** ripgrep (via node wrapper)
- **AST Parsing:** tree-sitter with multi-language support
- **LSP Framework:** vscode-languageserver
- **CLI Framework:** commander
- **Performance:** lru-cache, fast-glob, p-queue

### Key Design Patterns
- **Module Organization:** Single responsibility per file (search vs. parsing vs. analysis vs. caching)
- **Interface-based:** Use plain types for most exports
- **Deterministic Output:** All JSON/Markdown output must be reproducible for agent consumption
- **Lazy Loading:** Load language-specific parsers only when needed

---

## Project Structure

```
code-compass/
├── src/
│   ├── core/
│   │   ├── analyzer.ts          # Code analysis and metrics
│   │   └── engine.ts            # Main orchestration engine
│   ├── parsers/
│   │   ├── base.ts              # Base parser interface
│   │   ├── registry.ts          # Multi-language parser registry
│   │   ├── typescript.ts        # TS/JS specific parsing
│   │   └── python.ts            # Python specific parsing
│   ├── utils/
│   │   ├── cache.ts             # LRU cache for AST/results
│   │   ├── config.ts            # Configuration management
│   │   ├── file-watcher.ts      # File system monitoring
│   │   └── ripgrep.ts           # Text search integration
│   ├── types/
│   │   ├── ast.ts               # AST-related type definitions
│   │   ├── config.ts            # Configuration types
│   │   ├── search.ts            # Search query/result types
│   │   └── shims.d.ts           # TypeScript shim types
│   ├── lsp-server.ts            # LSP server implementation
│   └── index.ts                 # Main CLI entry point
├── tests/                       # Test files (currently empty)
├── IDEA.md                      # Project vision and roadmap
├── jest.config.js               # Jest configuration
├── tsconfig.json                # TypeScript configuration
└── package.json
```

### Key Modules to Understand

1. **`src/core/engine.ts`** — Main orchestration layer that coordinates search, parsing, and analysis
2. **`src/lsp-server.ts`** — Language Server Protocol server with experimental capabilities
3. **`src/parsers/registry.ts`** — Multi-language AST parser registry
4. **`src/utils/ripgrep.ts`** — Fast text search integration
5. **`src/utils/cache.ts`** — LRU caching layer for parsed ASTs and results

---

## Development Commands

All commands are npm-based:

```bash
# Install dependencies
npm install

# Build TypeScript (validates types, emits dist/)
npm run build

# Development mode with watch
npm run dev

# Run linter
npm run lint

# Run all Jest tests
npm test

# Run tests in watch mode (iterative development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run type checking without emitting files
npm run type-check

# Run local CLI
npm start

# Start LSP server
npm run lsp
```

### CLI Commands

```bash
# Search for patterns in code
npx code-compass search "pattern" --json --type function

# Analyze code complexity and metrics
npx code-compass analyze ./src --recursive --metrics

# Start LSP server
npx code-compass lsp --port 7777
```

---

## Coding Conventions & Style

### TypeScript & Configuration
- **Indentation:** 2 spaces, explicit semicolons
- **Strict Mode:** Enabled in `tsconfig.json` with comprehensive type checking
- **Path Aliases:** Configured for clean imports (`@core/*`, `@utils/*`, etc.)
- **Filenames:** kebab-case matching primary export

### ESLint Rules
- **@typescript-eslint/no-explicit-any**: Warned (allows flexibility during development)
- **@typescript-eslint/no-unused-vars**: Error (prevents dead code)
- **Standard formatting**: Always semicolons, consistent object spacing, trailing newlines

### Module Responsibilities
- **core/engine.ts**: Main orchestration, not business logic
- **lsp-server.ts**: LSP protocol handling, delegates to core engine
- **parsers/**: Language-specific AST parsing only
- **utils/**: Supporting utilities (caching, search, config)
- **types/**: TypeScript definitions and interfaces

---

## Testing Guidelines

### Test Organization
- Test files: `**/*.spec.ts` or `**/*.test.ts` (Jest)
- Location: `src/` (inline) or `tests/` directory
- Jest configuration supports both patterns
- Path aliases configured for test imports

### Running Tests
```bash
# Watch mode (recommended during development)
npm run test:watch

# Coverage reporting
npm run test:coverage

# Run all tests once
npm test
```

### Best Practices
- Mock external calls (ripgrep, file I/O) at boundaries
- Use real code snippets in fixtures rather than synthetic inputs
- Test both happy paths and edge cases (empty results, malformed code)
- Ensure output formats are deterministic for agent consumption

---

## Git Workflow & Commit Messages

### Commit Format
Follow the established pattern with date and imperative tense:

```
[YYYYMMDD] type: brief description

- Detailed explanation of what changed and why
- Reference related issues or feature IDs if applicable
```

**Types:** feat, fix, refactor, docs, test, chore

**Example:**
```
[251121] feat: implement ripgrep text search integration

- Add ripgrep wrapper in utils/ripgrep.ts
- Support file type filtering and context lines
- Add cache integration for search results
- Update CLI with search command
```

---

## Architecture Overview

### Core Engine Architecture
The `CoreEngine` class orchestrates three main components:

1. **ASTParser** - Multi-language parsing via tree-sitter
2. **CodeAnalyzer** - Code metrics and complexity analysis
3. **CacheSystem** - LRU caching for performance

### Search Pipeline
1. **Query Processing** - Parse and validate search parameters
2. **Cache Check** - Return cached results if available
3. **Text Search** - Use ripgrep for fast pattern matching
4. **AST Enrichment** - Parse matched files for structural context
5. **Result Formatting** - JSON/Markdown/table output

### LSP Integration
- **Experimental Capabilities**: codeMetrics, semanticSearch, structuralPatterns
- **Standard LSP Features**: hover, definition, references, document symbols, workspace symbols
- **Incremental Updates**: Document change hooks for live parsing (TODO)

### Multi-Language Support
- **Tree-sitter Parsers**: JavaScript, TypeScript, Python (current)
- **Extensible Registry**: Add new languages via `src/parsers/`
- **Unified Interface**: All parsers implement base interface

---

## Agent Integration Notes

Code Compass is designed for **LLM agent consumption**. Keep these principles in mind:

### Output Format Determinism
- **JSON output**: Consistent field ordering, avoid floating-point rounding
- **Markdown output**: Stable heading hierarchy, consistent code fence markers
- **Location formats**: `file:line:column` for agent navigation

### Metadata Requirements
Every result should include:
```typescript
{
  location: { uri: string, range: { start: { line, character }, end: { line, character } } },
  content: string,
  score: number,
  metadata: {
    fileType: string,
    language: Language,
    symbolType?: SymbolKind,
    complexity?: number,
    lastModified: Date
  }
}
```

### Search Types
- **Text**: Basic pattern matching via ripgrep
- **Function**: AST-aware function boundary detection
- **Class**: Class and interface identification
- **Import**: Import/export relationship tracking
- **Structural**: Tree-sitter pattern matching (future)
- **Semantic**: Vector embedding search (future)

---

## Performance & Optimization

### Caching Strategy
- **LRU Cache**: 1000 item default, configurable TTL
- **Cache Keys**: Deterministic based on query parameters
- **Cache Invalidation**: File modification based (TODO)

### Search Performance
- **ripgrep Integration**: Leverage native performance
- **Parallel Processing**: Configurable via p-queue
- **Incremental Parsing**: File change hooks for LSP (TODO)

### Benchmarks (Target)
- Search 10,000+ files in < 1 second
- Extract function boundaries with 95%+ accuracy
- Keep JSON output parseable by agents (deterministic, < 1MB per result)

---

## Known Limitations & TODOs

### Current Implementation Status
- **LSP Server**: Scaffolded, most handlers return empty results
- **AST Parsers**: Structure in place, implementations incomplete
- **File Extraction**: Not implemented (returns empty string)
- **Workspace Initialization**: Not implemented
- **Caching**: Basic LRU structure, no file-based persistence

### Language Support
- **Tier 1 (Current)**: JavaScript, TypeScript, Python
- **Tier 2 (Future)**: Go, Rust, Java, C#
- **Tree-sitter Dependencies**: Parsers included for current languages

### Testing Infrastructure
- Test directory structure in place
- Jest configuration complete with path aliases
- No actual test files yet (development priority)

---

## Quick Reference

### Most Common Commands
```bash
npm install          # Setup
npm run build        # Compile TS
npm run dev          # Watch mode development
npm test             # Run all tests
npm run test:watch   # Iterative testing
npm start            # Run CLI locally
npm run lsp          # Start LSP server
npm run lint         # Check style
```

### Key Classes & Entry Points
- **CoreEngine** (`src/core/engine.ts`) - Main orchestration
- **ASTParser** (`src/parsers/registry.ts`) - Multi-language parsing
- **startLSPServer** (`src/lsp-server.ts`) - LSP server entry point
- **CLI Program** (`src/index.ts`) - Command-line interface

### Adding New Features
1. **CLI Commands**: Add to `src/index.ts` using commander
2. **Languages**: Add parser to `src/parsers/` and register in `registry.ts`
3. **Search Types**: Extend `SearchType` enum in `src/types/search.ts`
4. **LSP Features**: Add handlers in `src/lsp-server.ts`

---

*This CLAUDE.md should be updated as the project evolves and new features are implemented.*