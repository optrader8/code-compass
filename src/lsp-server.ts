import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  HoverParams,
  DefinitionParams,
  ReferenceParams,
  DocumentSymbolParams,
  WorkspaceSymbolParams,
  SymbolInformation,
  TextDocumentIdentifier,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import { CoreEngine } from './core/engine';
import { ASTParser } from './parsers/registry';
import { CodeAnalyzer } from './core/analyzer';
import { CacheSystem } from './utils/cache';
import { initializeConfig } from './utils/config';

// Define capability flags at module level to avoid scoping issues
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// Initialize the core components
let coreEngine: CoreEngine;
let astParser: ASTParser;
let codeAnalyzer: CodeAnalyzer;
let cacheSystem: CacheSystem;

connection.onInitialize((params: InitializeParams) => {
  console.log('Code Compass LSP Server initializing...');

  // Initialize core components
  const config = initializeConfig();
  cacheSystem = new CacheSystem({ max: 1000, ttl: config.cache.ttl });
  astParser = new ASTParser(cacheSystem);
  codeAnalyzer = new CodeAnalyzer(cacheSystem);
  coreEngine = new CoreEngine(astParser, codeAnalyzer, cacheSystem);

  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we will fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      hoverProvider: true,
      definitionProvider: true,
      referencesProvider: true,
      documentSymbolProvider: true,
      workspaceSymbolProvider: true,
      // Add custom Code Compass capabilities
      experimental: {
        codeMetrics: true,
        semanticSearch: true,
        structuralPatterns: true,
      },
    },
  };

  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }

  console.log('Code Compass LSP Server initialized successfully');
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      console.log('Workspace folder change event received');
    });
  }
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  // TODO: Implement document content change handling
  console.log(`Document changed: ${change.document.uri}`);
});

connection.onHover((params: HoverParams) => {
  console.log(
    `Hover request for ${params.textDocument.uri} at ${params.position.line}:${params.position.character}`
  );

  // TODO: Implement hover functionality
  return {
    contents: {
      kind: 'markdown',
      value: 'Code Compass hover information coming soon...',
    },
  };
});

connection.onDefinition((params: DefinitionParams) => {
  console.log(`Definition request for ${params.textDocument.uri}`);

  // TODO: Implement definition functionality
  return null;
});

connection.onReferences((params: ReferenceParams) => {
  console.log(`References request for ${params.textDocument.uri}`);

  // TODO: Implement references functionality
  return [];
});

connection.onDocumentSymbol((params: DocumentSymbolParams) => {
  console.log(`Document symbol request for ${params.textDocument.uri}`);

  // TODO: Implement document symbol functionality
  return [];
});

connection.onWorkspaceSymbol((params: WorkspaceSymbolParams) => {
  console.log(`Workspace symbol request: ${params.query}`);

  // TODO: Implement workspace symbol functionality
  return [];
});

// Make the text document manager listen on the connection
// for open, change, and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
