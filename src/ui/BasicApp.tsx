import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';

const BasicApp = () => {
  const { exit } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{file: string, line: number, content: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }
    if (key.return && query.trim()) {
      setIsSearching(true);
      setTimeout(() => {
        setResults([
          {file: 'src/index.ts', line: 42, content: `const pattern = "${query}"`},
          {file: 'src/utils/search.ts', line: 15, content: `function search${query}()`},
          {file: 'src/core/engine.ts', line: 78, content: `// ${query} implementation`}
        ]);
        setIsSearching(false);
      }, 1000);
    }
    if (key.backspaceOrDelete) {
      setQuery(prev => prev.slice(0, -1));
    }
    if (input && !key.ctrl && !key.return && !key.backspaceOrDelete) {
      setQuery(prev => prev + input);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="single" borderColor="blue" paddingX={1} marginBottom={1}>
        <Text bold color="blue">🔍 Code Compass</Text>
      </Box>

      <Box flexDirection="row" marginBottom={1}>
        <Text color="green">❯ </Text>
        <Text>{query}</Text>
        <Text color="gray">_</Text>
      </Box>

      {isSearching && (
        <Text color="yellow">🔍 Searching...</Text>
      )}

      {results.length > 0 && (
        <Box flexDirection="column">
          <Text bold color="cyan">Found {results.length} results:</Text>
          {results.map((result, i) => (
            <Box key={i} flexDirection="column" marginLeft={2} marginTop={1}>
              <Text color="magenta">{result.file}:{result.line}</Text>
              <Text>{result.content}</Text>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray">Type to search, Enter to search, Ctrl+C to exit</Text>
      </Box>
    </Box>
  );
};

render(<BasicApp />);