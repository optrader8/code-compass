// src/ui/SearchInterface.tsx
import React, { useState, useCallback } from 'react';
import { Box, Text, TextInput, useInput } from 'ink';

interface SearchResult {
  file: string;
  line: number;
  content: string;
}

interface SearchInterfaceProps {
  onSearch: (query: string) => Promise<void>;
  isSearching: boolean;
  searchResults: SearchResult[];
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  isSearching,
  searchResults
}) => {
  const [query, setQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState(0);
  const [searchType, setSearchType] = useState<'text' | 'function' | 'class'>('text');

  useInput((input, key) => {
    if (key.return && query.trim() && !isSearching) {
      onSearch(query.trim());
    }

    if (key.tab) {
      const types: Array<'text' | 'function' | 'class'> = ['text', 'function', 'class'];
      const currentIndex = types.indexOf(searchType);
      const nextIndex = (currentIndex + 1) % types.length;
      setSearchType(types[nextIndex]);
    }

    if (key.upArrow && searchResults.length > 0) {
      setSelectedResult(prev => Math.max(0, prev - 1));
    }

    if (key.downArrow && searchResults.length > 0) {
      setSelectedResult(prev => Math.min(searchResults.length - 1, prev + 1));
    }

    if (input === 'c' && key.ctrl) {
      setQuery('');
      setSelectedResult(0);
    }
  });

  const renderSearchType = () => (
    <Box flexDirection="row" marginBottom={1}>
      <Text>Type: </Text>
      {(['text', 'function', 'class'] as const).map(type => (
        <Box key={type}>
          <Text
            color={searchType === type ? 'green' : 'gray'}
            bold={searchType === type}
          >
            {searchType === type ? `[${type}]` : ` ${type} `}
          </Text>
        </Box>
      ))}
      <Text color="gray"> (Tab to switch)</Text>
    </Box>
  );

  const renderResults = () => {
    if (isSearching) {
      return (
        <Box>
          <Text color="yellow">🔍 Searching...</Text>
        </Box>
      );
    }

    if (searchResults.length === 0 && query) {
      return (
        <Box>
          <Text color="red">No results found for "{query}"</Text>
        </Box>
      );
    }

    if (searchResults.length > 0) {
      return (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="blue">
            Found {searchResults.length} results:
          </Text>
          {searchResults.map((result, index) => (
            <Box
              key={index}
              flexDirection="column"
              borderStyle={selectedResult === index ? 'single' : undefined}
              borderColor={selectedResult === index ? 'blue' : undefined}
              paddingX={1}
              marginTop={1}
            >
              <Box flexDirection="row">
                <Text color="cyan">{result.file}:{result.line}</Text>
                {selectedResult === index && (
                  <Text color="yellow"> ← Selected</Text>
                )}
              </Box>
              <Text color="gray">{result.content}</Text>
            </Box>
          ))}
          <Box marginTop={1}>
            <Text color="gray">
              Use ↑↓ to navigate, Enter to view details
            </Text>
          </Box>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box flexDirection="column">
      {renderSearchType()}

      <Box flexDirection="row" marginBottom={1}>
        <Text color="green">❯ </Text>
        <TextInput
          value={query}
          onChange={setQuery}
          placeholder={`Enter ${searchType} search query...`}
          focus={!isSearching}
        />
      </Box>

      <Box flexDirection="row" marginBottom={1}>
        <Text color="gray">
          Press Enter to search, Tab to change type, Ctrl+C to clear
        </Text>
      </Box>

      {renderResults()}
    </Box>
  );
};

export default SearchInterface;