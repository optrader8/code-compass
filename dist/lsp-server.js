"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLSPServer = void 0;
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const engine_1 = require("./core/engine");
const registry_1 = require("./parsers/registry");
const cache_1 = require("./utils/cache");
const analyzer_1 = require("./core/analyzer");
const config_1 = require("./utils/config");
const ast_1 = require("./types/ast");
/**
 * Fire-and-forget LSP bootstrapper. Uses stdio by default; host/port are reserved
 * for future TCP transport support.
 */
async function startLSPServer(_options) {
    const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
    const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
    let hasConfigurationCapability = false;
    let hasWorkspaceFolderCapability = false;
    const config = (0, config_1.initializeConfig)();
    const cacheSystem = new cache_1.CacheSystem({ max: 1000, ttl: config.cache.ttl });
    const astParser = new registry_1.ASTParser(cacheSystem);
    const codeAnalyzer = new analyzer_1.CodeAnalyzer(cacheSystem);
    const coreEngine = new engine_1.CoreEngine(astParser, codeAnalyzer, cacheSystem);
    const documentAsts = new Map();
    connection.onInitialize((params) => {
        console.log('Code Compass LSP Server initializing...');
        const capabilities = params.capabilities;
        hasConfigurationCapability = !!(capabilities.workspace && capabilities.workspace.configuration);
        hasWorkspaceFolderCapability = !!(capabilities.workspace && capabilities.workspace.workspaceFolders);
        const result = {
            capabilities: {
                textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
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
            connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
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
    connection.onHover((params) => {
        console.log(`Hover request for ${params.textDocument.uri} at ${params.position.line}:${params.position.character}`);
        return {
            contents: {
                kind: 'markdown',
                value: 'Code Compass hover information coming soon...'
            }
        };
    });
    connection.onDefinition((params) => {
        console.log(`Definition request for ${params.textDocument.uri}`);
        return null;
    });
    connection.onReferences((params) => {
        console.log(`References request for ${params.textDocument.uri}`);
        return [];
    });
    connection.onDocumentSymbol((params) => {
        console.log(`Document symbol request for ${params.textDocument.uri}`);
        return [];
    });
    connection.onWorkspaceSymbol((params) => {
        console.log(`Workspace symbol request: ${params.query}`);
        return [];
    });
    documents.listen(connection);
    connection.listen();
    async function refreshDocumentAst(document) {
        const filePath = uriToPath(document.uri);
        // Build a single full-file change to feed incremental parser if an AST already exists
        const existingAst = documentAsts.get(document.uri);
        if (existingAst) {
            const lines = document.getText().split(/\r?\n/);
            const lastLine = lines.length ? lines[lines.length - 1] : '';
            const change = {
                start: { line: 0, character: 0 },
                end: { line: Math.max(0, lines.length - 1), character: lastLine.length },
                newText: document.getText()
            };
            const updated = await astParser.updateAST(existingAst, [change]);
            updated.filePath = filePath;
            documentAsts.set(document.uri, updated);
        }
        else {
            const language = detectLanguageFromPath(filePath, astParser, config.workspace.supportedLanguages);
            const parsed = await astParser.parseContent(document.getText(), language);
            parsed.filePath = filePath;
            documentAsts.set(document.uri, parsed);
        }
        await cacheSystem.invalidatePattern(filePath);
    }
    function uriToPath(uri) {
        try {
            const asUrl = new URL(uri);
            return asUrl.pathname;
        }
        catch {
            return uri;
        }
    }
    function detectLanguageFromPath(filePath, parser, supported) {
        try {
            return parser.detectLanguage(filePath);
        }
        catch {
            const fallback = supported[0] || ast_1.Language.TypeScript;
            return fallback;
        }
    }
}
exports.startLSPServer = startLSPServer;
//# sourceMappingURL=lsp-server.js.map