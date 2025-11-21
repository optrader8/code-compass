# Code Compass API Documentation

This document provides comprehensive API documentation for Code Compass CLI commands and interfaces.

## Table of Contents

- [CLI Commands](#cli-commands)
  - [search](#search)
  - [analyze](#analyze)
  - [lsp](#lsp)
  - [interactive](#interactive)
- [Search Query API](#search-query-api)
- [Output Formats](#output-formats)
- [Language Support](#language-support)
- [Configuration](#configuration)

## CLI Commands

### search

Search for patterns in code using text matching or AST-based structural analysis.

#### Syntax

```bash
npx code-compass search <pattern> [options]
```

#### Arguments

- `<pattern>` (required): Search pattern or regex

#### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--type` | `-t` | string | `text` | Search type: `text`, `function`, `class`, `import`, `variable`, `structural`, `semantic` |
| `--file` | `-f` | string | - | File pattern to search in (glob patterns supported) |
| `--language` | `-l` | string | - | Language to search in (typescript, javascript, python, etc.) |
| `--context` | `-c` | number | `3` | Number of context lines to include |
| `--format` | | string | `plain` | Output format: `plain`, `color`, `table`, `json` |
| `--json` | | boolean | `false` | Output in JSON format (same as `--format json`) |
| `--case-sensitive` | | boolean | `false` | Enable case-sensitive matching |
| `--regex` | | boolean | `true` | Enable regex pattern matching |
| `--max-results` | | number | `undefined` | Maximum number of results to return |

#### Examples

```bash
# Basic text search
npx code-compass search "getUserById"

# Function definitions in TypeScript files
npx code-compass search "getUserById" --type function --file "**/*.ts"

# Case-sensitive class search with context
npx code-compass search "UserService" --type class --case-sensitive --context 5

# JSON output for AI consumption
npx code-compass search "async.*fetch" --json

# Regex pattern search
npx code-compass search "def\s+\w+\s*\(" --language python --type function

# Structured search with table output
npx code-compass search "class.*Service" --format table
```

#### Search Types

- **text**: Basic pattern matching using ripgrep
- **function**: Find function/method definitions
- **class**: Find class/interface declarations
- **import**: Find import/export statements
- **variable**: Find variable declarations
- **structural**: Tree-sitter pattern matching (future)
- **semantic**: Vector embedding search (future)

### analyze

Analyze code complexity, metrics, and dependencies for given paths.

#### Syntax

```bash
npx code-compass analyze <path> [options]
```

#### Arguments

- `<path>` (required): File or directory path to analyze

#### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--recursive` | `-r` | boolean | `false` | Analyze directories recursively |
| `--metrics` | | boolean | `false` | Show code metrics (LOC, complexity, etc.) |
| `--complexity` | | boolean | `false` | Show cyclomatic complexity analysis |
| `--dependencies` | | boolean | `false` | Show dependency analysis |
| `--json` | | boolean | `false` | Output results in JSON format |

#### Examples

```bash
# Analyze single file
npx code-compass analyze src/index.ts

# Recursive directory analysis with metrics
npx code-compass analyze ./src --recursive --metrics

# Complexity analysis
npx code-compass analyze ./src --recursive --complexity

# Dependency analysis in JSON format
npx code-compass analyze ./src --dependencies --json

# Full analysis
npx code-compass analyze ./src --recursive --metrics --complexity --dependencies
```

#### Analysis Output

The analyze command returns detailed information about:

- **File Metrics**: Lines of code, number of functions, classes
- **Complexity**: Cyclomatic complexity per function/file
- **Dependencies**: Import/export relationships
- **Structure**: Code organization and architecture insights

### lsp

Start the Language Server Protocol server for IDE integration.

#### Syntax

```bash
npx code-compass lsp [options]
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--stdio` | boolean | `false` | Use stdio for communication |
| `--port` | number | `7777` | Port to listen on (TCP mode) |
| `--host` | string | `"127.0.0.1"` | Host to bind to (TCP mode) |

#### Examples

```bash
# Start LSP server on default port 7777
npx code-compass lsp

# Start on custom port
npx code-compass lsp --port 8080

# Start with stdio communication (for editors)
npx code-compass lsp --stdio
```

#### LSP Capabilities

The LSP server provides:

- **Text Document Sync**: Incremental document updates
- **Hover**: Symbol information on hover
- **Definition**: Go to definition functionality
- **References**: Find all references
- **Document Symbols**: Outline view for files
- **Workspace Symbols**: Global symbol search
- **Experimental**: Code metrics and semantic search

### interactive

Start the interactive terminal UI (default mode).

#### Syntax

```bash
npx code-compass [options]
npx code-compass interactive [options]
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--no-interactive` | boolean | `false` | Disable interactive mode and show help |

#### Features

The interactive mode provides:

- **Real-time Search**: Type and see results instantly
- **Visual Interface**: Color-coded results and navigation
- **Multiple Output Formats**: Switch between plain, colored, table views
- **Quick Actions**: Fast access to common operations
- **Keyboard Shortcuts**: Efficient navigation and control

## Search Query API

### SearchQuery Interface

```typescript
interface SearchQuery {
  pattern: string;                    // Search pattern
  type: SearchType;                  // Search type enumeration
  filePattern?: string;              // Glob pattern for files
  language?: Language;               // Target language
  options: SearchOptions;            // Search options
}

interface SearchOptions {
  caseSensitive?: boolean;           // Case sensitivity
  regex?: boolean;                   // Regex mode
  contextLines?: number;             // Context lines
  maxResults?: number;               // Result limit
  includeContext?: boolean;          // Include context in results
}
```

### SearchType Enumeration

```typescript
enum SearchType {
  Text = 'text',
  Function = 'function',
  Class = 'class',
  Import = 'import',
  Variable = 'variable',
  Structural = 'structural',
  Semantic = 'semantic',
}
```

### Language Enumeration

```typescript
enum Language {
  TypeScript = 'typescript',
  JavaScript = 'javascript',
  Python = 'python',
  Go = 'go',
  Rust = 'rust',
  Java = 'java',
  // ... more languages
}
```

## Output Formats

### Plain Format

Simple text output suitable for pipes and basic terminal usage.

```bash
npx code-compass search "pattern" --format plain
```

**Output:**
```
src/index.ts:42:10
const pattern = "search pattern"
---
src/utils/search.ts:15:5
function searchpattern() {
---
```

### Color Format

ANSI-colored output for better readability in modern terminals.

```bash
npx code-compass search "pattern" --format color
```

**Features:**
- File paths in cyan
- Line numbers in yellow
- Content in gray
- Separators in dim color

### Table Format

Structured table output for organized display.

```bash
npx code-compass search "pattern" --format table
```

**Output:**
```
┌─────────────────────┬─────────┬─────────────────────────────────────┐
│ File                │ Line    │ Context                               │
├─────────────────────┼─────────┼─────────────────────────────────────┤
│ src/index.ts        │ 42:10   │ const pattern = "search pattern"     │
│ src/utils/search.ts │ 15:5    │ function searchpattern() {           │
└─────────────────────┴─────────┴─────────────────────────────────────┘
```

### JSON Format

Machine-readable output for programmatic processing and AI integration.

```bash
npx code-compass search "pattern" --format json
```

**Schema:**
```json
{
  "results": [
    {
      "location": {
        "uri": "file:///path/to/file.ts",
        "range": {
          "start": { "line": 42, "character": 10 },
          "end": { "line": 42, "character": 35 }
        }
      },
      "content": "const pattern = \"search pattern\"",
      "context": ["previous line", "const pattern = \"search pattern\"", "next line"],
      "score": 0.95,
      "metadata": {
        "fileType": "typescript",
        "language": "typescript",
        "symbolType": "variable",
        "complexity": 1,
        "lastModified": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "count": 1,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Language Support

### TypeScript/JavaScript

**Features:**
- Function/method extraction
- Class/interface detection
- Import/export analysis
- Type annotation parsing
- Decorator support

**Parser**: `tree-sitter-typescript`, `tree-sitter-javascript`

### Python

**Features:**
- Function/method definitions
- Class declarations
- Import statement analysis
- Decorator support
- Type hint parsing

**Parser**: `tree-sitter-python`

### Future Languages

Planned support for:
- Go
- Rust
- Java
- C#
- Ruby

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CODE_COMPASS_CACHE_DIR` | `~/.code-compass` | Cache directory location |
| `CODE_COMPRESS_CONFIG` | `./code-compass.config.json` | Configuration file path |
| `CODE_COMPRESS_LOG_LEVEL` | `info` | Logging level (debug, info, warn, error) |

### Configuration File

Create `code-compass.config.json` in your project root:

```json
{
  "search": {
    "defaultType": "text",
    "maxResults": 1000,
    "contextLines": 3,
    "caseSensitive": false
  },
  "languages": {
    "typescript": {
      "extensions": [".ts", ".tsx"],
      "parser": "tree-sitter-typescript"
    },
    "python": {
      "extensions": [".py"],
      "parser": "tree-sitter-python"
    }
  },
  "cache": {
    "enabled": true,
    "ttl": 3600000,
    "maxSize": 1000
  },
  "lsp": {
    "port": 7777,
    "host": "127.0.0.1",
    "enableExperimental": true
  }
}
```

### Cache Configuration

- **LRU Cache**: 1000 item default with 1-hour TTL
- **File-based Cache**: Optional persistence across sessions
- **Invalidation**: File modification-based cache invalidation

## Error Handling

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `ENOTFOUND` | Pattern not found | Try broader search terms |
| `EPARSE` | Parse error in search pattern | Validate regex syntax |
| `EACCESS` | Permission denied | Check file permissions |
| `ETOOMANY` | Too many results | Use `--max-results` to limit |
| `ETIMEOUT` | Search timeout | Reduce search scope or use patterns |

### Error Response Format

```json
{
  "error": {
    "code": "ENOTFOUND",
    "message": "No matches found for pattern",
    "details": {
      "pattern": "nonexistentFunction",
      "searchType": "function",
      "filesSearched": 42
    }
  }
}
```

## Performance Considerations

### Optimization Tips

1. **Use File Patterns**: Limit search scope with `--file` option
2. **Language Filtering**: Specify `--language` to skip irrelevant files
3. **Result Limiting**: Use `--max-results` for large codebases
4. **Cache Usage**: Enable caching for repeated searches
5. **Context Control**: Adjust `--context` to reduce output size

### Benchmarks

- **10,000 files**: < 1 second for text search
- **Function extraction**: 95%+ accuracy
- **Memory usage**: < 100MB for large projects
- **Cache hit rate**: 80%+ for repeated queries

## Integration Examples

### Shell Integration

```bash
# Function to search and open in editor
ccedit() {
  local result=$(npx code-compass search "$1" --format json | jq -r '.results[0].location.uri')
  if [ "$result" != "null" ]; then
    code "$result"
  fi
}

# Usage: ccedit "getUserById"
```

### Node.js Integration

```javascript
const { spawn } = require('child_process');

async function searchCode(pattern, options = {}) {
  return new Promise((resolve, reject) => {
    const args = ['search', pattern, '--json'];
    if (options.type) args.push('--type', options.type);
    if (options.file) args.push('--file', options.file);

    const child = spawn('npx', ['code-compass', ...args]);
    let output = '';
    let error = '';

    child.stdout.on('data', (data) => output += data);
    child.stderr.on('data', (data) => error += data);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(JSON.parse(output));
      } else {
        reject(new Error(error));
      }
    });
  });
}
```

### Python Integration

```python
import subprocess
import json

def search_code(pattern, search_type="text"):
    cmd = ["npx", "code-compass", "search", pattern, "--type", search_type, "--json"]
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        return json.loads(result.stdout)
    else:
        raise Exception(f"Search failed: {result.stderr}")

# Usage
results = search_code("getUserById", "function")
```

---

For more information, see the [main README](../README.md) or [developer guide](DEVELOPMENT.md).