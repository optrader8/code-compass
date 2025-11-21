# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Code Compass** is a Node.js/TypeScript CLI tool for intelligent codebase search and analysis. It enables developers and LLM coding agents to rapidly locate and understand code structures (functions, classes, imports) across large codebases while providing rich metadata, dependencies, and context.

**Key Differentiator:** Unlike traditional search tools (ripgrep, ctags), Code Compass combines **fast text search + AST-aware structural analysis + agent-friendly output formats** to bridge the gap between simple grep and full IDE capabilities.

### Project Status
- **Phase:** Early development (documentation & architecture complete, implementation pending)
- **Git Workflow:** Established with commit format `[YYYYMMDD] task: description`
- **Target Users:** Developers and LLM coding agents
- **Core Value:** Provide deterministic, parseable output with accurate code boundaries and metadata

---

## Technology Stack

### Core Dependencies
- **Language:** TypeScript (strict mode, 2-space indentation)
- **Runtime:** Node.js
- **Build Tool:** TypeScript Compiler (tsc)
- **Testing:** Jest
- **Linting:** ESLint
- **Search Engine:** ripgrep (via node wrapper)
- **AST Parsing:**
  - JavaScript/TypeScript: `@babel/parser` or TypeScript Compiler API
  - Python: `tree-sitter` or `@anthropic-ai/tree-sitter`
  - Multi-language: `tree-sitter` bindings
- **CLI Framework:** commander or yargs
- **Output Formatting:** chalk, cli-table3, ora (spinner)
- **Performance:** fast-glob, globby, lru-cache, Worker Threads, p-queue

### Key Design Patterns
- **Module Organization:** Single responsibility per file (search vs. parsing vs. formatting vs. caching)
- **Interface-based:** Keep configuration objects prefixed with `I` (e.g., `ISearchConfig`), but use plain types for most exports
- **Deterministic Output:** All JSON/Markdown output must be reproducible for agent consumption
- **Lazy Loading:** Load language-specific parsers only when needed

---

## Project Structure

```
code-compass/
├── src/
│   ├── cli/
│   │   ├── repl.ts              # REPL mode entry and interactive commands
│   │   ├── commands.ts          # CLI command definitions (find-function, extract, etc.)
│   │   └── formatters.ts        # Output formatters (JSON, Markdown, Table)
│   ├── core/
│   │   ├── searcher.ts          # Text search wrapper around ripgrep
│   │   ├── parser.ts            # AST parsing for multiple languages
│   │   ├── analyzer.ts          # Code analysis (complexity, dependencies, signatures)
│   │   └── extractor.ts         # Code boundary extraction (start/end lines)
│   ├── utils/
│   │   ├── glob.ts              # File discovery and filtering
│   │   ├── cache.ts             # AST/results caching layer
│   │   └── git.ts               # Git integration (blame, history)
│   └── index.ts                 # Main CLI entry point
├── tests/
│   ├── searcher.spec.ts
│   ├── parser.spec.ts
│   ├── analyzer.spec.ts
│   ├── extractor.spec.ts
│   └── integration/             # End-to-end tests
├── fixtures/                     # Test code samples (various languages)
├── .kiro/                        # Project specification metadata
├── IDEA.md                       # Core vision and phases
├── IDEA.advanced.md             # LSP and advanced features roadmap
├── AGENTS.md                     # Agent integration guidelines
├── README.md                     # User-facing documentation
├── package.json
├── tsconfig.json
├── .eslintrc.json
└── jest.config.js
```

### Key Modules to Understand

1. **`src/cli/repl.ts`** — REPL mode logic for interactive exploration
2. **`src/core/searcher.ts`** — Core text search abstraction (currently ripgrep)
3. **`src/core/parser.ts`** — AST parsing and language-specific logic
4. **`src/core/extractor.ts`** — Precise line-range extraction for functions/classes
5. **`src/core/analyzer.ts`** — Metadata enrichment (complexity, dependencies, callers)
6. **`src/utils/cache.ts`** — LRU cache for parsed ASTs and results

---

## Development Commands

All commands are npm-based:

```bash
# Install dependencies
npm install

# Build TypeScript (validates types, emits dist/)
npm run build

# Run linter and format checks
npm run lint

# Run all Jest tests
npm test

# Run tests in watch mode (iterative development)
npm test -- --watch

# Run tests sequentially (useful for debugging state issues)
npm test -- --runInBand

# Run only a specific test file
npm test -- searcher.spec.ts

# Run local CLI (REPL mode by default)
npm start

# Run a specific command via CLI
npx code-search find-function myFunction --json

# Show CLI help
npx code-search --help
```

---

## Coding Conventions & Style

### TypeScript & Naming
- **Indentation:** 2 spaces, explicit semicolons
- **Exports:** camelCase for functions/classes (e.g., `extractFunctionBoundaries`)
- **Interfaces:** Prefix with `I` only for configuration objects (`ISearchConfig`, `IParserOptions`)
  - Regular data types: use plain types (`SearchResult`, `ParsedFunction`)
- **Filenames:** kebab-case matching primary export (e.g., `searcher.ts` exports `searcher` logic)
- **Constants:** SCREAMING_SNAKE_CASE for module-level constants

### Comments & Documentation
- Prefer self-descriptive names; add comments only when intent is non-obvious
- For complex logic, explain **why** not **what**
- Add JSDoc comments for exported functions/types
- Keep AGENTS.md and README.md in sync when adding commands

### Module Responsibilities
- **cli/repl.ts**: REPL interaction loop, command parsing
- **cli/commands.ts**: Command definitions and routing
- **cli/formatters.ts**: Output formatting logic (no business logic)
- **core/searcher.ts**: Text search only; no parsing
- **core/parser.ts**: AST parsing and language detection
- **core/analyzer.ts**: Metadata enrichment (complexity, dependencies)
- **core/extractor.ts**: Code boundary detection (lines, signatures)
- **utils/glob.ts**: File discovery only
- **utils/cache.ts**: AST cache management
- **utils/git.ts**: Git operations (blame, history)

---

## Testing Guidelines

### Test Organization
- Test files: `tests/**/*.spec.ts` (Jest)
- Name test suites after the module: `searcher.spec.ts`, `parser.spec.ts`
- Use fixtures from `fixtures/` for deterministic inputs
- Keep mocks lightweight; restore state between tests

### Running Tests
```bash
# Watch mode (recommended during development)
npm test -- --watch

# Run in band (when debugging state/timing issues)
npm test -- --runInBand

# Debug a single file
npm test -- searcher.spec.ts

# Verbose output
npm test -- --verbose
```

### Best Practices
- Mock external calls (ripgrep, file I/O) at boundaries
- Use real code snippets in `fixtures/` rather than synthetic inputs
- Test both happy paths and edge cases (empty results, malformed code)
- Ensure output formats are deterministic (no random UUIDs, use fixed timestamps in tests)

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
[251121] feat: implement ripgrep text search

- Add ripgrep wrapper in searcher.ts
- Support file type filtering (--type js,ts)
- Include context lines before/after matches
- Add tests for edge cases (empty results, large files)
```

### Pull Request Etiquette
- Clear title and description summarizing the change
- Link relevant issues or feature specs
- Note testing performed (e.g., "Tested with 10K+ file codebase")
- Include sample CLI output for UX-affecting changes

---

## Agent Integration Notes

Code Compass is designed for **LLM agent consumption**. Keep these principles in mind:

### Output Format Determinism
- **JSON output:** Always use consistent field ordering, avoid floating-point rounding
- **Markdown output:** Use stable heading hierarchy, consistent code fence markers
- **Table output:** Fixed column order, no optional columns that appear conditionally

### Metadata Requirements
Every result should include:
```json
{
  "file": "string (relative path)",
  "type": "function|class|import|block",
  "name": "string",
  "start_line": "number",
  "end_line": "number",
  "signature": "string",
  "code": "string",
  "dependencies": ["array of names"],
  "metadata": {
    "complexity": "number (cyclomatic)",
    "loc": "number (lines of code)",
    "comments": "string or null"
  }
}
```

### Command Documentation
When adding new commands:
1. Update `src/cli/commands.ts` with the command definition
2. Update `README.md` with usage examples
3. Update `AGENTS.md` with JSON schema examples
4. Ensure `--json` and `--format` flags are available
5. Test that agents can parse the output without human post-processing

---

## Development Phases

### Phase 1: Basic Search (REPL-based)
- Text pattern search via ripgrep wrapper
- File type filtering
- Context line display
- Color formatting

### Phase 2: Structural Code Analysis
- AST-based function/class boundary detection
- Function signature extraction
- Import/export relationship tracking
- Accurate line number reporting

### Phase 3: Metadata Enrichment
- Cyclomatic complexity calculation
- Dependency graph analysis
- Caller/callee relationships
- JSDoc/TSDoc parsing
- Git blame information (optional)

### Phase 4: Agent Integration
- Standalone CLI with deterministic output
- Multiple output formats (JSON, Markdown, LLM-optimized)
- Semantic search support (vector embeddings)
- Streaming output for large results

### Phase 5+: Advanced Features
- Semantic search with code embeddings
- Refactoring support and impact analysis
- Auto-generated documentation
- LSP (Language Server Protocol) implementation
- IDE/editor integrations

---

## Performance & Optimization

### Caching Strategy
- Cache parsed ASTs by file hash (lru-cache)
- Invalidate on file modification
- Optional index file (`.code-search-index`) for large repos

### Parallel Processing
- Use Worker Threads for multi-file parsing
- Implement p-queue for controlled concurrency
- Avoid bottlenecks in I/O-bound operations

### Benchmarks (Target)
- Search 10,000+ files in < 1 second
- Extract function boundaries with 95%+ accuracy
- Keep JSON output parseable by agents (deterministic, < 1MB per result)

---

## Common Development Tasks

### Adding a New Search Command
1. Define command in `src/cli/commands.ts` (use commander pattern)
2. Implement business logic in relevant `core/*.ts` module
3. Add formatter in `src/cli/formatters.ts` for output
4. Write tests in `tests/` with fixtures
5. Update `README.md` with usage example
6. Update `AGENTS.md` if output format is new

### Adding Support for a New Language
1. Add language detection in `src/core/parser.ts`
2. Import appropriate tree-sitter binding
3. Add boundary extraction logic (finding function/class ranges)
4. Add test fixtures in `fixtures/` for the language
5. Write tests in `tests/parser.spec.ts`
6. Document language support in README.md

### Optimizing for Large Codebases
1. Profile with `npm test -- --profile`
2. Check cache hit rates in `src/utils/cache.ts`
3. Consider parallel processing via Worker Threads
4. Benchmark against real-world repos (e.g., React, TypeScript compiler)

---

## Important Notes & Constraints

### What NOT to Do
- **Avoid hardcoding paths:** Always use glob patterns or git root detection
- **No format-specific parsing:** Keep JSON formatting separate from business logic
- **No temporary files:** Use in-memory caches and streaming where possible
- **No console.log in production code:** Use structured logging for debugging
- **No breaking changes to output format:** Agents depend on stable schemas

### Language Support Priorities
1. **Tier 1 (MVP):** JavaScript, TypeScript
2. **Tier 2 (Phase 2):** Python, Go, Rust
3. **Tier 3 (Phase 3+):** Java, C#, Ruby

### Known Limitations
- Tree-sitter parsers for some languages may have incomplete boundary detection
- Git blame/history requires local git repo (won't work on exports)
- Semantic search requires pre-computed embeddings (future phase)

---

## Useful References

- [AGENTS.md](./AGENTS.md) — Agent integration guidelines and output examples
- [IDEA.md](./IDEA.md) — Project vision, features, and use cases
- [IDEA.advanced.md](./IDEA.advanced.md) — LSP and advanced architecture plans
- [ripgrep](https://github.com/BurntSushi/ripgrep) — Our search backend
- [tree-sitter](https://tree-sitter.github.io/tree-sitter/) — Our AST parsing backend
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [jest](https://jestjs.io/) — Testing framework

---

## Quick Reference

### Most Common Commands
```bash
npm install          # Setup
npm run build        # Compile TS
npm test             # Run all tests
npm test -- --watch # Iterative testing
npm start            # Run REPL locally
npm run lint         # Check style
```

### TypeScript Compilation Issues
- Ensure `tsconfig.json` has `strict: true`
- Check that all source files are under `src/`
- Run `npm run build` to validate before committing

### Testing Failures
- Run `npm test -- --watch` and fix one test at a time
- Use `npm test -- --runInBand` if tests are timing-sensitive
- Check `fixtures/` for proper test data
- Mock ripgrep calls at boundaries, not in business logic

### Performance Bottlenecks
- Profile with Node.js: `node --prof index.js`, then `node --prof-process`
- Check cache hit rates in debug output
- Use `npm test -- --profile` for Jest profiling
- Benchmark against real codebases (not just fixtures)

