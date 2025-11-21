export interface ErrorRecoveryStrategy {
    fallbackToTextSearch(): Promise<any>;
    skipCorruptedFiles(): Promise<void>;
    usePartialResults(): Promise<any>;
    retryWithBackoff(operation: () => Promise<any>, maxRetries: number): Promise<any>;
    retryWithDifferentParser(filePath: string): Promise<any>;
    cleanupCorruptedCache(): Promise<void>;
    releaseMemoryOnError(): Promise<void>;
    notifyUser(error: CodeCompassError): void;
    suggestFix(error: CodeCompassError): string[];
}
export declare enum ErrorType {
    SYSTEM_ERROR = "system_error",
    FILE_NOT_FOUND = "file_not_found",
    PERMISSION_DENIED = "permission_denied",
    PARSE_ERROR = "parse_error",
    UNSUPPORTED_LANGUAGE = "unsupported_language",
    SYNTAX_ERROR = "syntax_error",
    LSP_CONNECTION_ERROR = "lsp_connection_error",
    LSP_REQUEST_TIMEOUT = "lsp_request_timeout",
    LSP_INVALID_REQUEST = "lsp_invalid_request",
    ANALYSIS_TIMEOUT = "analysis_timeout",
    COMPLEXITY_OVERFLOW = "complexity_overflow",
    CACHE_ERROR = "cache_error",
    CACHE_CORRUPTION = "cache_corruption"
}
export declare class CodeCompassError extends Error {
    type: ErrorType;
    code: string;
    details?: any;
    recoverable: boolean;
    suggestions?: string[] | undefined;
    constructor(type: ErrorType, message: string, code: string, details?: any, recoverable?: boolean, suggestions?: string[] | undefined);
}
export declare class ErrorHandler implements ErrorRecoveryStrategy {
    fallbackToTextSearch(): Promise<any>;
    skipCorruptedFiles(): Promise<void>;
    usePartialResults(): Promise<any>;
    retryWithBackoff(operation: () => Promise<any>, maxRetries?: number): Promise<any>;
    private delay;
    retryWithDifferentParser(filePath: string): Promise<any>;
    cleanupCorruptedCache(): Promise<void>;
    releaseMemoryOnError(): Promise<void>;
    notifyUser(error: CodeCompassError): void;
    suggestFix(error: CodeCompassError): string[];
    static handle(error: any, context?: string): CodeCompassError;
}
//# sourceMappingURL=error-handler.d.ts.map