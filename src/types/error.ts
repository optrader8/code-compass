// src/types/error.ts
export enum ErrorType {
  // System errors
  SYSTEM_ERROR = 'system_error',
  FILE_NOT_FOUND = 'file_not_found',
  PERMISSION_DENIED = 'permission_denied',

  // Parsing errors
  PARSE_ERROR = 'parse_error',
  UNSUPPORTED_LANGUAGE = 'unsupported_language',
  SYNTAX_ERROR = 'syntax_error',

  // LSP errors
  LSP_CONNECTION_ERROR = 'lsp_connection_error',
  LSP_REQUEST_TIMEOUT = 'lsp_request_timeout',
  LSP_INVALID_REQUEST = 'lsp_invalid_request',

  // Analysis errors
  ANALYSIS_TIMEOUT = 'analysis_timeout',
  COMPLEXITY_OVERFLOW = 'complexity_overflow',

  // Cache errors
  CACHE_ERROR = 'cache_error',
  CACHE_CORRUPTION = 'cache_corruption',
}

export interface CodeCompassError extends Error {
  type: ErrorType;
  code: string;
  details?: any;
  recoverable: boolean;
  suggestions?: string[];
}