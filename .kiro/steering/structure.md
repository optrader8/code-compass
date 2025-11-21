# Project Structure

## Directory Layout

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

## Code Organization Principles

### Layered Architecture
- **Interface Layer** (`cli/`): User interaction and command handling
- **Core Layer** (`core/`): Business logic and workflow orchestration  
- **Parser Layer** (`parsers/`): Language-specific AST processing
- **Utility Layer** (`utils/`): Cross-cutting concerns and helpers

### Module Boundaries
- Each module should have a single responsibility
- Dependencies flow downward (no circular dependencies)
- Interfaces defined in `types/` for loose coupling
- Parser plugins registered through `parsers/registry.ts`

### File Naming Conventions
- Use kebab-case for directories: `code-search/`, `multi-language/`
- Use camelCase for TypeScript files: `searcher.ts`, `analyzer.ts`
- Test files mirror source structure: `src/core/engine.ts` → `tests/unit/core/engine.test.ts`
- Type files end with `.types.ts` for complex type definitions

### Import/Export Patterns
- Use barrel exports in `index.ts` files for clean imports
- Prefer named exports over default exports
- Group imports: external libraries → internal modules → types
- Use path mapping in `tsconfig.json` for clean relative imports

### Configuration Files
- `package.json`: Dependencies and npm scripts
- `tsconfig.json`: TypeScript compilation settings
- `jest.config.js`: Test configuration
- `.eslintrc.js`: Linting rules
- `.prettierrc`: Code formatting rules