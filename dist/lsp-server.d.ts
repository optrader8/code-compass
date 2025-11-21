export interface LSPServerOptions {
    stdio?: boolean;
    port?: number;
    host?: string;
}
/**
 * Fire-and-forget LSP bootstrapper. Uses stdio by default; host/port are reserved
 * for future TCP transport support.
 */
export declare function startLSPServer(_options: LSPServerOptions): Promise<void>;
//# sourceMappingURL=lsp-server.d.ts.map