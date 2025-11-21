# Code Compass Project Context

## Project Overview

Code Compass (originally named "code-search-cli") is an advanced Node.js-based CLI tool for codebase search and analysis. It helps developers and LLM coding agents quickly find and extract specific functions, classes, and code blocks with rich metadata. The tool combines the speed of text search (ripgrep-level performance) with the precision of AST-based structural code understanding.

**Core Value Proposition:**
- **Fast Search**: ripgrep-level performance for large codebases
- **Precise Extraction**: AST-based accurate function/class boundary detection
- **Rich Metadata**: File paths, line ranges, complexity metrics, dependencies
- **Agent-Friendly**: JSON/Markdown output formats optimized for LLM consumption
- **Progressive Enhancement**: REPL → CLI → Agent Integration

## Project Structure

```
code-search/
├── src/                     # Source code
│   ├── cli/                 # CLI interface layer
│   │   ├── repl.ts         # REPL mode implementation
│   │   ├── commands.ts     # CLI command definitions
│   │   └── formatters.ts   # Output formatters (JSON, table, colored)
│   ├── core/               # Core business logic
│   │   ├── engine.ts       # Main orchestration engine
│   │   ├── searcher.ts     # Text search engine (ripgrep wrapper)
│   │   ├── parser.ts       # AST parsing coordinator
│   │   ├── analyzer.ts     # Code analysis (complexity, deps)
│   │   └── extractor.ts    # Code extraction and range handling
│   ├── parsers/            # Language-specific parsers
│   │   ├── base.ts         # Abstract parser interface
│   │   ├── typescript.ts   # TypeScript/JavaScript parser
│   │   ├── python.ts       # Python parser (tree-sitter)
│   │   └── registry.ts     # Parser registration and discovery
│   ├── utils/              # Utility modules
│   │   ├── glob.ts         # File pattern matching
│   │   ├── cache.ts        # AST caching layer
│   │   ├── git.ts          # Git integration (blame, history)
│   │   └── config.ts       # Configuration management
│   ├── types/              # TypeScript type definitions
│   │   ├── ast.ts          # AST node interfaces
│   │   ├── search.ts       # Search query/result types
│   │   └── config.ts       # Configuration types
│   └── index.ts            # Main entry point
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test data and sample code
│       ├── javascript/     # JS test files
│       ├── typescript/     # TS test files
│       ├── python/         # Python test files
│       └── mixed-project/  # Multi-language test project
├── docs/                   # Documentation
├── scripts/                # Build and utility scripts
├── .kiro/                  # Kiro configuration
│   ├── steering/           # AI steering rules
│   └── specs/              # Feature specifications
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## Key Features & Functionality

### Phase 1: Basic Search (REPL-based)
- Text pattern search (ripgrep wrapping)
- File type filtering (.js, .ts, .py, etc.)
- Context line display (before/after)
- Result formatting (JSON, table, color)

### Phase 2: Structural Code Analysis
- AST-based function/class boundary recognition
- Function signature extraction
- Import/export relationship tracking
- Accurate code block range line numbers

### Phase 3: Enhanced Metadata
- Function complexity (cyclomatic complexity)
- Dependency graphs
- Call relationships (caller/callee)
- JSDoc/TSDoc parsing
- Git blame information (optional)

### Phase 4: Agent Integration
- Standalone CLI conversion
- LLM-friendly output formats
- Semantic search capabilities

## Technical Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Code Compass Core                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │   Parser   │  │  Analyzer  │  │  Indexer   │       │
│  │   Layer    │  │   Layer    │  │   Layer    │       │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘       │
│        │                │                │               │
│  ┌─────▼────────────────▼────────────────▼──────┐      │
│  │         Unified AST Representation            │      │
│  └────────────────────┬──────────────────────────┘      │
│                       │                                  │
│  ┌────────────────────▼──────────────────────────┐      │
│  │           Query & Search Engine               │      │
│  │  ├─ Text Search (ripgrep)                     │      │
│  │  ├─ AST Query (tree-sitter)                   │      │
│  │  ├─ Semantic Search (embeddings)              │      │
│  │  └─ Hybrid Search                             │      │
│  └────────────────────┬──────────────────────────┘      │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
   │   CLI   │    │   LSP   │    │   API   │
   │Interface│    │ Server  │    │ Server  │
   └────┬────┘    └────┬────┘    └────┬────┘
        │              │              │
   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
   │Terminal │    │  IDEs   │    │LLM Agent│
   │   User  │    │(VSCode, │    │  (MCP,  │
   │         │    │Vim,etc) │    │  API)   │
   └─────────┘    └─────────┘    └─────────┘
```

### Core Components

#### Core Engine
```typescript
interface CoreEngine {
  search(query: SearchQuery): Promise<SearchResult[]>
  analyze(target: AnalysisTarget): Promise<AnalysisResult>
  extract(location: CodeLocation): Promise<CodeExtraction>
}
```

#### Parser Engine
```typescript
interface ParserEngine {
  parse(filePath: string): Promise<AST>
  findFunctions(ast: AST): FunctionNode[]
  findClasses(ast: AST): ClassNode[]
  findImports(ast: AST): ImportNode[]
  extractRange(ast: AST, startLine: number, endLine: number): CodeNode
}
```

#### Analysis Engine
```typescript
interface AnalysisEngine {
  calculateComplexity(node: FunctionNode): ComplexityMetrics
  analyzeDependencies(filePath: string): DependencyGraph
  extractDocumentation(node: CodeNode): Documentation
  getCallGraph(functionName: string): CallGraph
}
```

## Technology Stack

### Runtime & Language
- **Node.js**: Primary runtime environment
- **TypeScript**: Main development language for type safety and better tooling
- **Target**: ES2020+ with Node.js 16+ support

### Core Dependencies
- **Search**: `ripgrep` (node wrapper) or `@vscode/ripgrep`
- **AST Parsing**: `@babel/parser` or `typescript` compiler API for JS/TS; `tree-sitter` for Python
- **REPL**: `readline`, `inquirer`, `prompts`
- **CLI Framework**: `commander` or `yargs`
- **Output Formatting**: `chalk`, `cli-table3`, `ora` (spinner)
- **Performance**: `fast-glob`, `p-queue`, `lru-cache`

### Performance Targets
- Search 10,000+ files in <1 second
- 95%+ accuracy for function boundary extraction
- LLM agents can parse output 100%
- Memory usage <200MB for large projects
- Test coverage >90%

## Building and Running

### Development Setup
```bash
# Install dependencies
npm install

# Development with watch mode
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

### REPL Usage
```bash
# Launch REPL
$ code-search

# Available commands
> search "function fetchUserData"
> find-function fetchUserData
> grep-context "class UserService" --lines 10
```

### CLI Usage
```bash
# Standalone CLI commands
$ code-search find-function getUserById --json
$ code-search extract-range src/user.ts:45-67 --format llm
$ code-search semantic-search "database connection logic"
```

## Development Conventions

### Code Organization Principles
- **Layered Architecture**: Interface → Core → Parser → Utility layers
- **Single Responsibility**: Each module has a single responsibility
- **Loose Coupling**: Interfaces defined in `types/` for loose coupling
- **Clean Imports**: Use barrel exports in `index.ts` files

### File Naming Conventions
- Use kebab-case for directories
- Use camelCase for TypeScript files
- Test files mirror source structure
- Type files end with `.types.ts` for complex type definitions

### Testing Strategy
- Unit tests for individual components
- Integration tests for end-to-end workflows
- Performance benchmarks for large codebases
- Mock file systems for isolated testing
- Test fixtures for multiple programming languages

## Advanced Features (Future Phases)

### LSP Integration
- Code Compass will function as an LSP server for use with VSCode, Vim, etc.
- Standard LSP features: hover, definition, references, rename
- Custom extensions for code metrics and dependency graphs

### Semantic Search
- Code embeddings using models like CodeBERT
- Natural language to code block search
- Hybrid search combining keyword and semantic matching

### Refactoring Engine
- Safe automated refactoring tools
- Impact analysis before changes
- Code smell detection and automated fixes

### Multi-language Support
- Currently planned: JavaScript, TypeScript, Python, Go, Rust, Java, C++
- Tree-sitter based parsing for consistent multi-language support
- Language-specific analysis and metrics

## Current Status

Based on the project documentation, Code Compass is in the early development phase with the following implementation plan:

1. **Phase 1-2**: Basic search and AST parsing (currently being developed)
2. **Phase 3-4**: Enhanced metadata and CLI tooling
3. **Phase 5+**: Advanced features including LSP integration, semantic search, and refactoring tools

The project maintains detailed requirements, design documents, and task tracking in the `.kiro/specs/code-search-cli/` directory to guide development.

## Key Differentiators

| Tool | Limitations | Code Compass Advantages |
|------|-------------|------------------------|
| ripgrep | Text search only, no structural understanding | AST-based precise range extraction |
| ctags | Outdated format, limited language support | Modern language support, JSON output |
| grep + awk | Manual combinations needed, error-prone | Unified interface, reliability |
| IDE search | Difficult agent integration | API-friendly, automation-ready |