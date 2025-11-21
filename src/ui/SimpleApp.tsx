// src/ui/SimpleApp.tsx
import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';

const SimpleApp: React.FC = () => {
  const { exit } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }

    if (key.return && searchQuery.trim() && !isSearching) {
      setIsSearching(true);
      // Simulate search
      setTimeout(() => {
        setResults([
          `Result 1 for "${searchQuery}"`,
          `Result 2 for "${searchQuery}"`,
          `Result 3 for "${searchQuery}"`
        ]);
        setIsSearching(false);
      }, 1000);
    }

    if (key.backspaceOrDelete) {
      setSearchQuery(prev => prev.slice(0, -1));
    }

    if (input && !key.ctrl && !key.return && !key.backspaceOrDelete) {
      setSearchQuery(prev => prev + input);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="double" borderColor="green" paddingX={1} marginBottom={1}>
        <Text bold color="green">
          🔍 Code Compass - Interactive Search
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">
          Type to search, Enter to execute, Ctrl+C to exit
        </Text>
      </Box>

      <Box flexDirection="row" marginBottom={1}>
        <Text color="green">❯ </Text>
        <Text color="white">{searchQuery}</Text>
        <Text color="gray">_</Text>
      </Box>

      {isSearching && (
        <Box>
          <Text color="yellow">🔍 Searching...</Text>
        </Box>
      )}

      {results.length > 0 && !isSearching && (
        <Box flexDirection="column">
          <Text bold color="blue">
            Found {results.length} results:
          </Text>
          {results.map((result, index) => (
            <Box key={index} flexDirection="row" marginBottom={1}>
              <Text color="cyan">{index + 1}.</Text>
              <Text> {result}</Text>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray" dim>
          Commands: search "pattern" | analyze {"<path>"} | lsp
        </Text>
      </Box>
    </Box>
  );
};

export default SimpleApp;