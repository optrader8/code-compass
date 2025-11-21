// src/ui/LSPStatus.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface LSPStatusProps {}

const LSPStatus: React.FC<LSPStatusProps> = () => {
  const [serverStatus, setServerStatus] = useState<'stopped' | 'starting' | 'running'>('stopped');
  const [connections, setConnections] = useState(0);

  useEffect(() => {
    // LSP 서버 상태 시뮬레이션
    const timer = setTimeout(() => {
      setServerStatus('running');
      setConnections(2);
    }, 2000);

    setServerStatus('starting');

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'running': return 'green';
      case 'starting': return 'yellow';
      case 'stopped': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = () => {
    switch (serverStatus) {
      case 'running': return '✅';
      case 'starting': return '⏳';
      case 'stopped': return '❌';
      default: return '❓';
    }
  };

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor="blue" padding={1} marginBottom={1}>
        <Text bold color="blue">Language Server Protocol Status</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Box flexDirection="row">
          <Text>Server Status: </Text>
          <Text color={getStatusColor()} bold>
            {getStatusIcon()} {serverStatus.toUpperCase()}
          </Text>
        </Box>

        <Box flexDirection="row">
          <Text>Port: </Text>
          <Text color="cyan">7777</Text>
        </Box>

        <Box flexDirection="row">
          <Text>Active Connections: </Text>
          <Text color="green">{connections}</Text>
        </Box>

        <Box flexDirection="row">
          <Text>Protocol Version: </Text>
          <Text color="gray">3.17.0</Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="blue">Supported Features:</Text>
        <Box flexDirection="row">
          <Text>  • Text Document Sync</Text>
          <Text color="green"> ✓</Text>
        </Box>
        <Box flexDirection="row">
          <Text>  • Hover</Text>
          <Text color="green"> ✓</Text>
        </Box>
        <Box flexDirection="row">
          <Text>  • Go to Definition</Text>
          <Text color="green"> ✓</Text>
        </Box>
        <Box flexDirection="row">
          <Text>  • Find References</Text>
          <Text color="green"> ✓</Text>
        </Box>
        <Box flexDirection="row">
          <Text>  • Document Symbols</Text>
          <Text color="green"> ✓</Text>
        </Box>
        <Box flexDirection="row">
          <Text>  • Workspace Symbols</Text>
          <Text color="green"> ✓</Text>
        </Box>
        <Box flexDirection="row">
          <Text>  • Code Metrics</Text>
          <Text color="yellow"> (Experimental)</Text>
        </Box>
        <Box flexDirection="row">
          <Text>  • Semantic Search</Text>
          <Text color="yellow"> (Experimental)</Text>
        </Box>
      </Box>

      <Box flexDirection="column">
        <Text bold color="blue">LSP Commands:</Text>
        <Text color="gray">Start server: npx code-compass lsp --port 7777</Text>
        <Text color="gray">Start with stdio: npx code-compass lsp --stdio</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="gray">Press ESC to return to search</Text>
      </Box>
    </Box>
  );
};

export default LSPStatus;