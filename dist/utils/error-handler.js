"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.CodeCompassError = exports.ErrorType = void 0;
var ErrorType;
(function (ErrorType) {
    // System errors
    ErrorType["SYSTEM_ERROR"] = "system_error";
    ErrorType["FILE_NOT_FOUND"] = "file_not_found";
    ErrorType["PERMISSION_DENIED"] = "permission_denied";
    // Parsing errors
    ErrorType["PARSE_ERROR"] = "parse_error";
    ErrorType["UNSUPPORTED_LANGUAGE"] = "unsupported_language";
    ErrorType["SYNTAX_ERROR"] = "syntax_error";
    // LSP errors
    ErrorType["LSP_CONNECTION_ERROR"] = "lsp_connection_error";
    ErrorType["LSP_REQUEST_TIMEOUT"] = "lsp_request_timeout";
    ErrorType["LSP_INVALID_REQUEST"] = "lsp_invalid_request";
    // Analysis errors
    ErrorType["ANALYSIS_TIMEOUT"] = "analysis_timeout";
    ErrorType["COMPLEXITY_OVERFLOW"] = "complexity_overflow";
    // Cache errors
    ErrorType["CACHE_ERROR"] = "cache_error";
    ErrorType["CACHE_CORRUPTION"] = "cache_corruption";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
class CodeCompassError extends Error {
    constructor(type, message, code, details, recoverable = true, suggestions) {
        super(message);
        this.type = type;
        this.code = code;
        this.details = details;
        this.recoverable = recoverable;
        this.suggestions = suggestions;
        this.name = 'CodeCompassError';
    }
}
exports.CodeCompassError = CodeCompassError;
class ErrorHandler {
    // Error recovery implementations
    async fallbackToTextSearch() {
        console.warn('Falling back to text search due to parsing error');
        // Implementation would fall back to regex or string-based search
        return [];
    }
    async skipCorruptedFiles() {
        console.warn('Skipping corrupted files');
        // Implementation would track and skip problematic files
    }
    async usePartialResults() {
        console.warn('Returning partial results due to error');
        // Implementation would return whatever results were successfully processed
        return [];
    }
    async retryWithBackoff(operation, maxRetries = 3) {
        let retries = 0;
        let delay = 100; // Initial delay in ms
        while (retries < maxRetries) {
            try {
                return await operation();
            }
            catch (error) {
                retries++;
                if (retries >= maxRetries) {
                    throw error;
                }
                console.warn(`Operation failed, retrying in ${delay}ms... (attempt ${retries}/${maxRetries})`);
                await this.delay(delay);
                delay *= 2; // Exponential backoff
            }
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async retryWithDifferentParser(filePath) {
        console.warn(`Retrying ${filePath} with different parser`);
        // Implementation would try an alternative parser
        return null;
    }
    async cleanupCorruptedCache() {
        console.warn('Cleaning up corrupted cache entries');
        // Implementation would clear corrupted cache entries
    }
    async releaseMemoryOnError() {
        console.warn('Releasing memory due to error condition');
        // Implementation would trigger garbage collection or clear caches
    }
    notifyUser(error) {
        console.error(`Error: ${error.message}`);
        if (error.suggestions && error.suggestions.length > 0) {
            console.error('Suggestions:', error.suggestions.join(', '));
        }
    }
    suggestFix(error) {
        switch (error.type) {
            case ErrorType.FILE_NOT_FOUND:
                return ['Check if the file path is correct', 'Verify the file exists'];
            case ErrorType.PARSE_ERROR:
                return ['Check the syntax of the file', 'Try a different parser', 'Skip this file and continue'];
            case ErrorType.LSP_CONNECTION_ERROR:
                return ['Check if the LSP server is running', 'Verify network connectivity'];
            case ErrorType.CACHE_ERROR:
                return ['Clear the cache directory', 'Restart the application'];
            default:
                return ['Check the logs for more details', 'Report this issue to the developers'];
        }
    }
    // Main error handling method
    static handle(error, context = '') {
        if (error instanceof CodeCompassError) {
            return error;
        }
        // Convert standard errors to CodeCompass errors
        let errorType;
        let errorCode;
        let suggestions = [];
        if (error.code === 'ENOENT') {
            errorType = ErrorType.FILE_NOT_FOUND;
            errorCode = 'FILE_NOT_FOUND';
            suggestions = ['Check if the file path is correct', 'Verify the file exists'];
        }
        else if (error.code === 'EACCES') {
            errorType = ErrorType.PERMISSION_DENIED;
            errorCode = 'PERMISSION_DENIED';
            suggestions = ['Check file permissions', 'Run with elevated privileges if needed'];
        }
        else if (error.message && error.message.includes('parse')) {
            errorType = ErrorType.PARSE_ERROR;
            errorCode = 'PARSE_ERROR';
            suggestions = ['Check the syntax of the file', 'Try a different parser'];
        }
        else if (error.message && error.message.includes('timeout')) {
            errorType = ErrorType.LSP_REQUEST_TIMEOUT;
            errorCode = 'REQUEST_TIMEOUT';
        }
        else {
            errorType = ErrorType.SYSTEM_ERROR;
            errorCode = 'SYSTEM_ERROR';
            suggestions = ['Check the logs for more details', 'Report this issue to the developers'];
        }
        const codeCompassError = new CodeCompassError(errorType, `${context ? context + ': ' : ''}${error.message || 'Unknown error'}`, errorCode, { originalError: error }, true, // Most errors are recoverable
        suggestions);
        console.error(`Handled error: ${codeCompassError.message}`);
        if (codeCompassError.suggestions) {
            console.error(`Suggestions: ${codeCompassError.suggestions.join(', ')}`);
        }
        return codeCompassError;
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=error-handler.js.map