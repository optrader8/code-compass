"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorType = void 0;
// src/types/error.ts
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
//# sourceMappingURL=error.js.map