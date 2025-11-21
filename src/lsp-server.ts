import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  InitializeParams,
  InitializeResult,
  DidChangeConfigurationNotification,
  HoverParams,
  DefinitionParams,
  ReferenceParams,
  DocumentSymbolParams,
  WorkspaceSymbolParams,
  TextDocumentSyncKind
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { CoreEngine } from './core/engine';
import { ASTParser } from './parsers/registry';
import { CacheSystem } from './utils/cache';
import { CodeAnalyzer } from './core/analyzer';
import { initializeConfig } from './utils/config';
import { ParsedAST, Language, TextChange } from './types/ast';

export interface LSPServerOptions {
  stdio?: boolean;
  port?: number;
  host?: string;
}

/**
 * Fire-and-forget LSP bootstrapper. Uses stdio by default; host/port are reserved
 * for future TCP transport support.
 */
export async function startLSPServer(_options: LSPServerOptions): Promise<void> {
  const connection = createConnection(ProposedFeatures.all);
  const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  let hasConfigurationCapability = false;
  let hasWorkspaceFolderCapability = false;

  const config = initializeConfig();
  const cacheSystem = new CacheSystem({ max: 1000, ttl: config.cache.ttl });
  const astParser = new ASTParser(cacheSystem);
  const codeAnalyzer = new CodeAnalyzer(cacheSystem);
  const coreEngine = new CoreEngine(astParser, codeAnalyzer, cacheSystem);
  const documentAsts = new Map<string, ParsedAST>();

  connection.onInitialize((params: InitializeParams): InitializeResult => {
    console.log('Code Compass LSP Server initializing...');

    const capabilities = params.capabilities;
    hasConfigurationCapability = !!(capabilities.workspace && capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace && capabilities.workspace.workspaceFolders);

    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        hoverProvider: true,
        definitionProvider: true,
        referencesProvider: true,
        documentSymbolProvider: true,
        workspaceSymbolProvider: true,
        experimental: {
          codeMetrics: true,
          semanticSearch: true,
          structuralPatterns: true
        }
      }
    };

    if (hasWorkspaceFolderCapability) {
      result.capabilities.workspace = {
        workspaceFolders: {
          supported: true
        }
      };
    }

    console.log('Code Compass LSP Server initialized successfully');
    return result;
  });

  connection.onInitialized(() => {
    if (hasConfigurationCapability) {
      connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
      connection.workspace.onDidChangeWorkspaceFolders(_event => {
        console.log('Workspace folder change event received');
      });
    }
  });

  documents.onDidChangeContent(change => {
    void refreshDocumentAst(change.document);
  });

  documents.onDidOpen(event => {
    void refreshDocumentAst(event.document);
  });

  documents.onDidClose(event => {
    documentAsts.delete(event.document.uri);
    const filePath = uriToPath(event.document.uri);
    void cacheSystem.invalidatePattern(filePath);
  });

  connection.onHover((params: HoverParams) => {
    console.log(
      `Hover request for ${params.textDocument.uri} at ${params.position.line}:${params.position.character}`
    );

    const ast = documentAsts.get(params.textDocument.uri);
    if (ast) {
      const symbol = findSymbolAtPosition(ast, params.position.line, params.position.character);
      if (symbol) {
        return {
          contents: {
            kind: 'markdown',
            value: `**${symbol.kind}** ${symbol.name}\n\nLines ${symbol.range.start.line + 1}-${symbol.range.end.line + 1}`
          }
        };
      }
    }

    return {
      contents: {
        kind: 'markdown',
        value: 'Code Compass hover information coming soon...'
      }
    };
  });

  connection.onDefinition((params: DefinitionParams) => {
    console.log(`Definition request for ${params.textDocument.uri}`);
    return null;
  });

  connection.onReferences((params: ReferenceParams) => {
    console.log(`References request for ${params.textDocument.uri}`);
    return [];
  });

  connection.onDocumentSymbol((params: DocumentSymbolParams) => {
    console.log(`Document symbol request for ${params.textDocument.uri}`);
    return [];
  });

  connection.onWorkspaceSymbol((params: WorkspaceSymbolParams) => {
    console.log(`Workspace symbol request: ${params.query}`);
    return [];
  });

  documents.listen(connection);
  connection.listen();

  async function refreshDocumentAst(document: TextDocument): Promise<void> {
    const filePath = uriToPath(document.uri);

    // Build a single full-file change to feed incremental parser if an AST already exists
    const existingAst = documentAsts.get(document.uri);
    if (existingAst) {
      const lines = document.getText().split(/\r?\n/);
      const lastLine = lines.length ? lines[lines.length - 1] : '';
      const change: TextChange = {
        start: { line: 0, character: 0 },
        end: { line: Math.max(0, lines.length - 1), character: lastLine.length },
        newText: document.getText()
      };

      const updated = await astParser.updateAST(existingAst, [change]);
      updated.filePath = filePath;
      documentAsts.set(document.uri, updated);
    } else {
      const language = detectLanguageFromPath(filePath, astParser, config.workspace.supportedLanguages);
      const parsed = await astParser.parseContent(document.getText(), language);
      parsed.filePath = filePath;
      documentAsts.set(document.uri, parsed);
    }

    await cacheSystem.invalidatePattern(filePath);
  }

  function uriToPath(uri: string): string {
    try {
      const asUrl = new URL(uri);
      return asUrl.pathname;
    } catch {
      return uri;
    }
  }

  function detectLanguageFromPath(filePath: string, parser: ASTParser, supported: Language[]): Language {
    try {
      return parser.detectLanguage(filePath);
    } catch {
      const fallback = supported[0] || Language.TypeScript;
      return fallback;
    }
  }

  function findSymbolAtPosition(ast: ParsedAST, line: number, character: number) {
    const matchInRange = <T extends { range: { start: { line: number; character: number }; end: { line: number; character: number } } }>(
      list: T[]
    ) =>
      list.find(node =>
        (line > node.range.start.line || (line === node.range.start.line && character >= node.range.start.character)) &&
        (line < node.range.end.line || (line === node.range.end.line && character <= node.range.end.character))
      );

    const fn = matchInRange(ast.functions || []);
    if (fn) return { kind: 'Function', name: fn.name, range: fn.range };

    const cls = matchInRange(ast.classes || []);
    if (cls) return { kind: 'Class', name: cls.name, range: cls.range };

    return null;
  }
}
