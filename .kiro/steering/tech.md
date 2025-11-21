# Technology Stack

## Runtime & Language
- **Node.js**: Primary runtime environment
- **TypeScript**: Main development language for type safety and better tooling
- **Target**: ES2020+ with Node.js 16+ support

## Core Dependencies

### Search & Performance
- **ripgrep**: Text search engine (`@vscode/ripgrep` or node wrapper)
- **fast-glob** or **globby**: File pattern matching
- **p-queue**: Parallel processing and rate limiting
- **lru-cache**: File hash-based AST caching

### AST Parsing
- **TypeScript/JavaScript**: `@babel/parser` or TypeScript Compiler API
- **Python**: `tree-sitter` with Python grammar
- **Multi-language**: `tree-sitter` bindings for extensibility

### CLI & Interface
- **commander** or **yargs**: CLI argument parsing
- **readline**, **inquirer**, **prompts**: REPL implementation
- **chalk**: Terminal colors
- **cli-table3**: Tabular output formatting
- **ora**: Loading spinners

### Code Analysis
- **typescript**: For TS/JS complexity analysis
- **eslint-complexity**: Cyclomatic complexity calculation
- **jsdoc-parser**: Documentation extraction

## Build System

### Development
```bash
# Install dependencies
npm install

# Development with watch mode
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Performance benchmarks
npm run benchmark
```

### Build & Distribution
```bash
# Build for production
npm run build

# Package for distribution
npm run package

# Publish to npm
npm publish
```

## Code Quality Tools
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Jest**: Unit and integration testing
- **Husky**: Git hooks for quality gates
- **lint-staged**: Pre-commit linting

## Performance Targets
- Search 10,000+ files in <1 second
- Memory usage <200MB for large projects
- AST parsing cache hit ratio >80%
- Test coverage >90%