// src/ui/App.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { FC, ReactElement } from 'react';
import SearchInterface from './SearchInterface';
import LSPStatus from './LSPStatus';
import HelpScreen from './HelpScreen';

interface AppState {
  currentView: 'search' | 'lsp' | 'help';
  searchQuery: string;
  isSearching: boolean;
  searchResults: any[];
}

const App: FC = () => {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>({
    currentView: 'search',
    searchQuery: '',
    isSearching: false,
    searchResults: []
  });

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }

    if (input === 'h' && !state.isSearching) {
      setState(prev => ({
        ...prev,
        currentView: prev.currentView === 'help' ? 'search' : 'help'
      }));
    }

    if (input === 'l' && !state.isSearching) {
      setState(prev => ({
        ...prev,
        currentView: prev.currentView === 'lsp' ? 'search' : 'lsp'
      }));
    }

    if (key.escape && state.currentView !== 'search') {
      setState(prev => ({ ...prev, currentView: 'search' }));
    }
  });

  const handleSearch = async (query: string) => {
    setState(prev => ({ ...prev, isSearching: true, searchQuery: query }));

    try {
      // 실제 검색 로직은 CoreEngine을 통해 처리
      const { CoreEngine } = await import('../core/engine');
      // 검색 결과 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        isSearching: false,
        searchResults: [
          { file: 'src/index.ts', line: 10, content: 'Sample result 1' },
          { file: 'src/core/engine.ts', line: 25, content: 'Sample result 2' }
        ]
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isSearching: false }));
    }
  };

  const renderHeader = () => (
    <Box flexDirection="column" marginBottom={1}>
      <Box borderStyle="double" borderColor="green" paddingX={1}>
        <Text bold color="green">
          🔍 Code Compass - Intelligent Code Search & Analysis
        </Text>
      </Box>
      <Box flexDirection="row" justifyContent="space-between" marginTop={1}>
        <Text color="gray">Version 0.1.0</Text>
        <Text color="gray">
          Press <Text color="cyan">h</Text> for help,{' '}
          <Text color="cyan">l</Text> for LSP status,{' '}
          <Text color="cyan">Ctrl+C</Text> to exit
        </Text>
      </Box>
    </Box>
  );

  return (
    <Box flexDirection="column" padding={1}>
      {renderHeader()}

      {state.currentView === 'search' && (
        <SearchInterface
          onSearch={handleSearch}
          isSearching={state.isSearching}
          searchResults={state.searchResults}
        />
      )}

      {state.currentView === 'lsp' && <LSPStatus />}

      {state.currentView === 'help' && <HelpScreen />}
    </Box>
  );
};

export default App;