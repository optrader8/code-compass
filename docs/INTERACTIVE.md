# Code Compass Interactive Interface

This document covers the ink-based interactive terminal user interface (TUI) that provides a modern, intuitive way to interact with Code Compass.

## Overview

The interactive interface uses [ink](https://github.com/vadimdemedes/ink) - a React framework for building command-line interfaces. It provides a rich, responsive experience with real-time search, visual feedback, and keyboard navigation.

## Starting the Interactive Mode

### Default Launch

```bash
# Simply run code-compass without arguments
npx code-compass

# Or use npm
npm start

# Explicit interactive command
npx code-compass interactive
```

### Interface Layout

```
╔════════════════════════════════════════╗
║     🔍 Code Compass Interactive     ║
╚════════════════════════════════════════╝

Type to search, Enter to search, Ctrl+C to exit

❯ your search query here_

🔍 Searching for: your search query here
Found 3 results:
1. src/index.ts:42 - const pattern = "your search query here"
2. src/utils/search.ts:15 - function searchqueryhere()
3. src/core/engine.ts:78 - // your search query here implementation
```

## Features

### 1. Real-time Search

- **Live Input**: Type your search query and see results as you type
- **Instant Feedback**: Visual indicators show search status
- **Pattern Matching**: Supports regex patterns and special characters
- **Auto-suggestions**: Contextual suggestions based on your codebase

### 2. Visual Interface

- **Color Coding**: Different colors for different element types
- **Result Highlighting**: Clear separation between search results
- **Status Indicators**: Visual feedback for search operations
- **Progress Feedback**: Loading states during complex searches

### 3. Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` | Execute search |
| `Ctrl+C` | Exit application |
| `Ctrl+L` | Clear search and results |
| `Tab` | Cycle through search types (future) |
| `↑/↓` | Navigate through results (future) |
| `Escape` | Clear current input |

### 4. Search Types

The interface supports multiple search types:

#### Text Search (Default)
```bash
❯ function getUserById
🔍 Searching for: function getUserById
```

#### Function Search
```bash
❯ --type function getUserById
🔍 Searching for functions: getUserById
```

#### Class Search
```bash
❯ --type class Service
🔍 Searching for classes: Service
```

## User Experience

### Search Workflow

1. **Start Typing**: Begin typing your search query
2. **See Suggestions**: View real-time suggestions and completions
3. **Execute Search**: Press Enter to perform the search
4. **Review Results**: Browse through formatted results
5. **Refine**: Modify your query or start a new search

### Visual Feedback

#### Searching State
```
❯ async function fetchUser
🔍 Searching for: async function fetchUser
⏳ Processing your search...
```

#### Results Display
```
Found 5 results:
1. src/services/user.ts:23 - async function fetchUser(id: string) {
2. src/api/users.ts:45 - const response = await fetchUser(id);
3. src/controllers/user.ts:12 - const fetchUser = async (id) => {
4. src/types/user.ts:8 - export type FetchUserResult = ...
5. src/utils/cache.ts:67 - // Helper for fetchUser caching
```

#### No Results
```
❯ nonexistentFunction
🔍 Searching for: nonexistentFunction
❌ No results found for "nonexistentFunction"
💡 Try a different search term or use broader patterns
```

## Advanced Features

### Search Modifiers

You can use special prefixes to modify your search:

```bash
# Type-specific search
❯ type:function getUserById

# File-specific search
❯ file:*.ts Service

# Language-specific search
❯ lang:python def main

# Context lines
❯ context:5 error handling
```

### Result Filtering

```bash
# Show only TypeScript files
❯ filter:ts UserService

# Show only function definitions
❯ filter:function async

# Show only test files
❯ filter:test describe
```

### Quick Actions

```bash
# Open file in editor (future)
❯ open src/services/user.ts:23

# Show file context (future)
❯ context src/utils/search.ts

# Analyze complexity (future)
❯ analyze src/core/engine.ts
```

## Configuration

### Interactive Mode Settings

Create or update your `code-compass.config.json`:

```json
{
  "interactive": {
    "theme": "default",
    "maxResults": 20,
    "showLineNumbers": true,
    "enableSuggestions": true,
    "autoFocus": true,
    "debounceMs": 300
  },
  "themes": {
    "default": {
      "primary": "blue",
      "secondary": "gray",
      "success": "green",
      "warning": "yellow",
      "error": "red",
      "highlight": "cyan"
    }
  }
}
```

### Environment Variables

```bash
export CODE_COMPRESS_INTERACTIVE_THEME=dark
export CODE_COMPRESS_INTERACTIVE_MAX_RESULTS=50
export CODE_COMPRESS_INTERACTIVE_DEBOUNCE=500
```

## Customization

### Themes

You can customize the color scheme:

```javascript
// custom-theme.js
module.exports = {
  primary: '#00ff00',
  secondary: '#666666',
  background: '#000000',
  text: '#ffffff',
  highlight: '#ffff00',
  border: '#333333'
};
```

### Key Bindings

Customize keyboard shortcuts in your config:

```json
{
  "keyBindings": {
    "search": "enter",
    "clear": "ctrl+l",
    "exit": "ctrl+c",
    "nextResult": "down",
    "prevResult": "up",
    "openFile": "ctrl+o",
    "showHelp": "f1"
  }
}
```

## Performance

### Optimizations

The interactive interface includes several performance optimizations:

- **Debounced Input**: Waits for typing pause before searching
- **Result Caching**: Caches recent search results
- **Incremental Loading**: Loads results progressively for large codebases
- **Memory Management**: Limits memory usage for large result sets

### Benchmarks

| Operation | Performance |
|-----------|-------------|
| Initial Load | < 100ms |
| Search Execution | 50-500ms (depending on codebase size) |
| Result Display | < 50ms |
| Memory Usage | < 50MB |

## Troubleshooting

### Common Issues

#### Interface Not Rendering

```bash
# Check terminal compatibility
echo $TERM

# Ensure proper terminal settings
export TERM=xterm-256color

# Try alternative launch method
npx code-compass --no-color
```

#### Slow Performance

```bash
# Reduce search scope in config
{
  "interactive": {
    "maxResults": 10,
    "debounceMs": 500
  }
}

# Limit file types
{
  "search": {
    "exclude": ["node_modules", "dist", ".git"]
  }
}
```

#### Color Display Issues

```bash
# Disable colors if needed
npx code-compass interactive --no-color

# Or set in config
{
  "interactive": {
    "theme": "monochrome"
  }
}
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=code-compass:* npx code-compass

# Check for ink-specific issues
DEBUG=ink:* npx code-compass
```

## Accessibility

### Screen Reader Support

The interface includes accessibility features:

- **Keyboard Navigation**: Full keyboard control without mouse
- **Screen Reader Compatibility**: Proper ARIA labels and announcements
- **High Contrast Mode**: Enhanced visibility options
- **Font Size Control**: Adjustable text size

### Accessibility Settings

```json
{
  "accessibility": {
    "screenReader": true,
    "highContrast": false,
    "largeText": false,
    "reducedMotion": true
  }
}
```

## Future Enhancements

### Planned Features

- **Result Navigation**: Arrow key navigation through results
- **File Preview**: In-terminal file preview
- **Search History**: Command history and favorites
- **Split View**: Multiple search panels
- **Plugins**: Extensible plugin system
- **Multi-cursor**: Multiple simultaneous searches

### Experimental Features

Enable experimental features in your config:

```json
{
  "experimental": {
    "aiSuggestions": true,
    "semanticSearch": true,
    "smartContext": true,
    "voiceInput": false
  }
}
```

## Examples

### Workflows

#### 1. Function Discovery

```bash
# Start interactive mode
npx code-compass

# Search for a function
❯ getUserById

# Results show all getUserById definitions
# Navigate to specific implementation
❯ src/services/user.ts getUserById

# Get more context
❯ context src/services/user.ts:45-60
```

#### 2. Bug Investigation

```bash
# Search for error patterns
❯ "Error fetching user"

# Find related error handling
❯ try.*catch.*user

# Locate validation logic
❯ validate.*User

# Check import statements
❯ import.*User
```

#### 3. Code Refactoring

```bash
# Find all usages of a class
❯ UserService

# Locate inheritance
❯ extends UserService

# Find related interfaces
❯ interface.*User

# Check test files
❯ test.*UserService
```

---

For more information, see the [API documentation](API.md) or [main README](../README.md).