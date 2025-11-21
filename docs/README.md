# Code Compass Documentation

Welcome to the Code Compass documentation hub. Code Compass is an advanced code search and analysis tool with LSP support, designed for both developers and AI coding agents.

## 📚 Documentation Index

### User Documentation

- **[Main README](../README.md)** - Overview, installation, and quick start guide
- **[API Reference](API.md)** - Complete CLI command reference and API documentation
- **[Interactive Interface](INTERACTIVE.md)** - Guide to the ink-based TUI experience

### Developer Documentation

- **[Development Guide](DEVELOPMENT.md)** - Contributing, architecture, and development setup
- **[CLAUDE.md](../CLAUDE.md)** - AI agent integration guidelines and project guidance

### Architecture Documentation

- **[IDEA.md](../IDEA.md)** - Project vision, roadmap, and technical specifications
- **[IDEA.advanced.md](../IDEA.advanced.md)** - Advanced architecture and LSP integration details
- **[AGENTS.md](../AGENTS.md)** - AI/LLM agent integration patterns and examples

## 🚀 Quick Start

### For Users

1. **Installation**
   ```bash
   npm install -g code-compass
   ```

2. **Basic Usage**
   ```bash
   # Interactive mode (default)
   code-compass

   # Command-line search
   code-compass search "getUserById" --json

   # Code analysis
   code-compass analyze ./src --recursive
   ```

### For Developers

1. **Setup Development Environment**
   ```bash
   git clone https://github.com/your-org/code-compass.git
   cd code-compass
   npm install
   npm run build
   ```

2. **Run Tests**
   ```bash
   npm test
   npm run test:watch
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture Overview

Code Compass consists of several key components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI Interface │───▶│   Core Engine   │───▶│  Search/Analysis│
│   (index.ts)    │    │  (engine.ts)    │    │   (ripgrep)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Interactive UI │    │   AST Parsers   │    │   Output Formats│
│   (ink UI)      │    │ (tree-sitter)   │    │ (JSON/Table)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Features

- **⚡ High Performance**: ripgrep-based text search with 10,000+ files < 1s
- **🎯 AST Analysis**: Structural code understanding with tree-sitter
- **🌐 LSP Support**: Full Language Server Protocol implementation
- **🤖 AI-First Design**: JSON outputs optimized for LLM consumption
- **🎨 Modern TUI**: ink-based interactive terminal interface

## 🔧 Supported Languages

| Language | Status | Parser | Features |
|----------|--------|--------|----------|
| TypeScript | ✅ | tree-sitter-typescript | Functions, classes, imports, types |
| JavaScript | ✅ | tree-sitter-javascript | Functions, classes, imports, ES6+ |
| Python | ✅ | tree-sitter-python | Functions, classes, decorators, types |
| Go | 🚧 | tree-sitter-go | Planned (functions, structs, interfaces) |
| Rust | 🚧 | tree-sitter-rust | Planned (functions, structs, impls) |
| Java | 🚧 | tree-sitter-java | Planned (classes, methods, packages) |

## 📖 Getting Started Guides

### For Different Use Cases

#### **Code Review and Exploration**
```bash
# Find all function definitions
code-compass search "function.*\w+\(" --type function

# Analyze code complexity
code-compass analyze ./src --recursive --complexity

# Interactive exploration
code-compass
```

#### **AI/LLM Integration**
```bash
# JSON output for AI consumption
code-compass search "class.*Service" --json --type class

# Structured code extraction
code-compass search "async.*fetch" --json --include-deps
```

#### **IDE Integration**
```bash
# Start LSP server for editor support
code-compass lsp --port 7777

# Configure your editor to connect to the LSP server
```

### Example Workflows

#### 1. Finding Function Definitions
```bash
# Interactive search
code-compass
❯ getUserById

# CLI search with type filter
code-compass search "getUserById" --type function

# Language-specific search
code-compass search "def.*user" --language python
```

#### 2. Code Analysis
```bash
# Full project analysis
code-compass analyze ./src --recursive --metrics --complexity

# Specific file analysis
code-compass analyze src/services/user.ts --dependencies
```

#### 3. Debugging and Investigation
```bash
# Find error patterns
code-compass search "throw.*Error" --context 5

# Find logging statements
code-compass search "console\.(log|error)" --type variable
```

## 🔌 Integration Examples

### Shell Integration

```bash
# Create helpful aliases
alias cc='code-compass'
alias ccsearch='code-compass search'
alias ccanalyze='code-compass analyze'

# Function to search and open
ccopen() {
  local result=$(code-compass search "$1" --json | jq -r '.results[0].location.uri')
  [ "$result" != "null" ] && code "$result"
}
```

### Editor Integration

#### VS Code Settings
```json
{
  "codeCompass.enable": true,
  "codeCompass.lsp.port": 7777,
  "codeCompass.search.maxResults": 100,
  "codeCompass.interactive.theme": "default"
}
```

#### Vim/Neovim
```vim
" Search for current word
nnoremap <leader>cs :w<CR>:!code-compass search "<C-r><C-w>" --format color<CR>

" Analyze current file
nnoremap <leader>ca :w<CR>:!code-compass analyze %:p --recursive<CR>
```

### Node.js Integration

```javascript
const { spawn } = require('child_process');

class CodeCompassClient {
  async search(pattern, options = {}) {
    const args = ['search', pattern, '--json'];
    if (options.type) args.push('--type', options.type);

    const result = await this.execCommand(args);
    return JSON.parse(result);
  }

  async analyze(path, options = {}) {
    const args = ['analyze', path];
    if (options.recursive) args.push('--recursive');
    if (options.metrics) args.push('--metrics');

    const result = await this.execCommand(args);
    return JSON.parse(result);
  }

  execCommand(args) {
    return new Promise((resolve, reject) => {
      const child = spawn('npx', ['code-compass', ...args]);
      let output = '';

      child.stdout.on('data', (data) => output += data);
      child.on('close', (code) => {
        code === 0 ? resolve(output) : reject(new Error(output));
      });
    });
  }
}

// Usage
const client = new CodeCompassClient();
const results = await client.search('getUserById', { type: 'function' });
```

### Python Integration

```python
import subprocess
import json
from typing import List, Dict, Any

class CodeCompassClient:
    def search(self, pattern: str, **kwargs) -> Dict[str, Any]:
        """Search for code patterns"""
        cmd = ["npx", "code-compass", "search", pattern, "--json"]

        if kwargs.get('type'):
            cmd.extend(["--type", kwargs['type']])
        if kwargs.get('file'):
            cmd.extend(["--file", kwargs['file']])

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            raise Exception(f"Search failed: {result.stderr}")

    def analyze(self, path: str, **kwargs) -> Dict[str, Any]:
        """Analyze code complexity and metrics"""
        cmd = ["npx", "code-compass", "analyze", path]

        if kwargs.get('recursive'):
            cmd.append("--recursive")
        if kwargs.get('metrics'):
            cmd.append("--metrics")

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            raise Exception(f"Analysis failed: {result.stderr}")

# Usage
client = CodeCompassClient()
results = client.search("getUserById", type="function")
print(f"Found {results['count']} results")
```

## 🔍 Search Examples

### Pattern Matching

```bash
# Basic text search
code-compass search "UserRepository"

# Regex patterns
code-compass search "class.*Service.*\{" --regex

# Case-sensitive search
code-compass search "UserManager" --case-sensitive

# Multiple patterns
code-compass search "(async|await).*fetch" --regex
```

### Type-Specific Searches

```bash
# Function definitions
code-compass search "def.*user" --type function --language python

# Class definitions
code-compass search "class.*Controller" --type class

# Import statements
code-compass search "import.*React" --type import

# Variable declarations
code-compass search "const.*Service" --type variable
```

### File and Language Filtering

```bash
# Search in specific file types
code-compass search "Service" --file "**/*.ts"

# Search in specific directory
code-compass search "test" --file "tests/**/*"

# Language-specific search
code-compass search "func.*main" --language go
```

## 📊 Output Formats

### Plain Text
```bash
code-compass search "UserService" --format plain
```

### Colored Output
```bash
code-compass search "UserService" --format color
```

### Table Format
```bash
code-compass search "UserService" --format table
```

### JSON (AI/ML Integration)
```bash
code-compass search "UserService" --format json
```

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test search.test.ts
```

### Test Structure

```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── fixtures/          # Test code samples
└── helpers/           # Test utilities
```

## 🚀 Performance

### Benchmarks

- **Search Speed**: 10,000+ files in < 1 second
- **Memory Usage**: < 100MB for large projects
- **Cache Hit Rate**: 80%+ for repeated queries
- **Parse Accuracy**: 95%+ for function boundary detection

### Optimization Tips

1. **Use File Patterns**: Limit search scope
2. **Enable Caching**: Cache results for repeated searches
3. **Language Filtering**: Specify target languages
4. **Result Limiting**: Use `--max-results` for large codebases

## 🤝 Contributing

We welcome contributions! See the [Development Guide](DEVELOPMENT.md) for detailed information.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

### Development Commands

```bash
# Development setup
npm install
npm run build

# Development mode
npm run dev

# Testing
npm test
npm run lint
```

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🔗 Additional Resources

- **GitHub Repository**: https://github.com/your-org/code-compass
- **npm Package**: https://www.npmjs.com/package/code-compass
- **Issue Tracker**: https://github.com/your-org/code-compass/issues
- **Discussions**: https://github.com/your-org/code-compass/discussions

## 🆘 Support

- **Documentation**: Check these docs first
- **Issues**: Report bugs on GitHub
- **Discussions**: Ask questions and share ideas
- **Discord**: Join our community (link coming soon)

---

**Code Compass** - Navigate your codebase with confidence 🧭