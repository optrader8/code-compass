// src/ui/HelpScreen.tsx
import React from 'react';
import { Box, Text } from 'ink';

const HelpScreen: React.FC = () => {
  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor="yellow" padding={1} marginBottom={1}>
        <Text bold color="yellow">Code Compass Help</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="blue">Interactive Mode:</Text>
        <Text>• h - Toggle this help screen</Text>
        <Text>• l - Toggle LSP status screen</Text>
        <Text>• ESC - Return to search from any screen</Text>
        <Text>• Ctrl+C - Exit application</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="blue">Search Interface:</Text>
        <Text>• Enter - Execute search</Text>
        <Text>• Tab - Switch search type (text/function/class)</Text>
        <Text>• Ctrl+C - Clear search query and results</Text>
        <Text>• ↑/↓ - Navigate search results</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="blue">CLI Commands:</Text>
        <Text color="cyan">npx code-compass search "pattern"</Text>
        <Text>  Search for patterns in code</Text>
        <Text>  Options: --json --type {'<type>'} --file {'<pattern>'}</Text>
        <Box marginBottom={1} />

        <Text color="cyan">npx code-compass analyze {'<path>'}</Text>
        <Text>  Analyze code complexity and metrics</Text>
        <Text>  Options: --recursive --metrics --complexity</Text>
        <Box marginBottom={1} />

        <Text color="cyan">npx code-compass lsp</Text>
        <Text>  Start Language Server Protocol server</Text>
        <Text>  Options: --port {'<port>'} --stdio</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="blue">Search Types:</Text>
        <Text>• text - Basic text pattern matching (ripgrep)</Text>
        <Text>• function - Find function definitions and signatures</Text>
        <Text>• class - Find class and interface definitions</Text>
        <Text>• import - Find import/export statements</Text>
        <Text>• structural - Tree-sitter pattern matching</Text>
        <Text>• semantic - Vector embedding search (future)</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="blue">Output Formats:</Text>
        <Text>• Interactive - TUI with keyboard navigation</Text>
        <Text>• JSON - Machine-readable output for agents</Text>
        <Text>• Table - Formatted table display</Text>
        <Text>• Markdown - Documentation-friendly format</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="blue">Supported Languages:</Text>
        <Text>• JavaScript/TypeScript (AST parsing available)</Text>
        <Text>• Python (AST parsing available)</Text>
        <Text>• Go, Rust, Java, C# (planned)</Text>
      </Box>

      <Box flexDirection="column">
        <Text bold color="blue">Examples:</Text>
        <Text color="gray"># Search for function definitions</Text>
        <Text>npx code-compass search "getUserById" --type function</Text>
        <Box marginBottom={1} />

        <Text color="gray"># Analyze project complexity</Text>
        <Text>npx code-compass analyze ./src --recursive --metrics</Text>
        <Box marginBottom={1} />

        <Text color="gray"># Get JSON output for agents</Text>
        <Text>npx code-compass search "class.*Service" --json</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="gray">Press ESC to return to search</Text>
      </Box>
    </Box>
  );
};

export default HelpScreen;