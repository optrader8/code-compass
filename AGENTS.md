# Repository Guidelines

## Project Structure & Module Organization
`code-search/` is the main workspace. Keep TypeScript sources under `src/`, where `cli/` owns REPL/command helpers, `core/` holds search/parser/analyzer logic, and `utils/` groups shared helpers (globbing, caching, Git info). Entry point `src/index.ts` wires the CLI. Tests live under `tests/` and consume fixtures from `fixtures/`. Treat any new module as a single responsibility: CLI vs. analysis vs. formatting.

## Build, Test, and Development Commands
- `npm install`: bootstraps dependencies defined in `package.json`.
- `npm run build` (typically `tsc`): emits compiled artifacts and validates types before publishing.
- `npm run lint`: runs ESLint/format checks to keep AST helpers consistent.
- `npm test`: executes Jest suites under `tests/`, including fixtures and mocks.
- `npx code-search <command>` or `npm start`: exercises the CLI locally (REPL by default). Use `--help` for available flags and formats.

## Coding Style & Naming Conventions
Follow the TypeScript conventions already in place: 2-space indentation, explicit semicolons, and camelCase exports for functions/classes. Keep interfaces/types prefixed with `I` only when they describe configuration objects. Module-level filenames mirror their primary export (`searcher.ts` exporting `searcher` logic). Add short comments when the intent is not obvious, but prefer self-descriptive names (`extractor.ts`, `formatters.ts`).

## Testing Guidelines
Tests live in `tests/` and rely on Jest. Name suites after the component under test (`searcher.spec.ts`, `repl.spec.ts`). Use fixture snippets from `fixtures/` for deterministic inputs. Keep mocks lightweight and restore global state between tests. Run `npm test -- --watch` for iterative development or `npm test -- --runInBand` when isolating failures.

## Commit & Pull Request Guidelines
Match the existing git history by prefixing summaries with a task/bracketed scope (e.g., `[251121] docs update helpers`). Use imperative tense and explain why the change matters. Pull requests should include a short description, mention linked issues or feature IDs, and note testing performed (even if `n/a`). Attach screenshots or CLI output only when the change affects UX or CLI formatting.

## Agent-Oriented Notes
Keep agent-friendly output formats (JSON, markdown) deterministic; include metadata (file, lines, dependencies). When adding commands, document options in `README.md` and keep `AGENTS.md` in sync.
