// src/utils/error-handler.ts
export interface ErrorRecoveryStrategy {
  // Graceful degradation
  fallbackToTextSearch(): Promise<any>;
  skipCorruptedFiles(): Promise<void>;
  usePartialResults(): Promise<any>;

  // Retry mechanisms
  retryWithBackoff(operation: () => Promise<any>, maxRetries: number): Promise<any>;
  retryWithDifferentParser(filePath: string): Promise<any>;

  // Resource cleanup
  cleanupCorruptedCache(): Promise<void>;
  releaseMemoryOnError(): Promise<void>;

  // User notification
  notifyUser(error: CodeCompassError): void;
  suggestFix(error: CodeCompassError): string[];
}

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

export class CodeCompassError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public code: string,
    public details?: any,
    public recoverable: boolean = true,
    public suggestions?: string[]
  ) {
    super(message);
    this.name = 'CodeCompassError';
  }
}

export class ErrorHandler implements ErrorRecoveryStrategy {
  // Error recovery implementations
  async fallbackToTextSearch(): Promise<any> {
    console.warn('Falling back to text search due to parsing error');
    // Implementation would fall back to regex or string-based search
    return [];
  }

  async skipCorruptedFiles(): Promise<void> {
    console.warn('Skipping corrupted files');
    // Implementation would track and skip problematic files
  }

  async usePartialResults(): Promise<any> {
    console.warn('Returning partial results due to error');
    // Implementation would return whatever results were successfully processed
    return [];
  }

  async retryWithBackoff(operation: () => Promise<any>, maxRetries: number = 3): Promise<any> {
    let retries = 0;
    let delay = 100; // Initial delay in ms

    while (retries < maxRetries) {
      try {
        return await operation();
      } catch (error) {
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retryWithDifferentParser(filePath: string): Promise<any> {
    console.warn(`Retrying ${filePath} with different parser`);
    // Implementation would try an alternative parser
    return null;
  }

  async cleanupCorruptedCache(): Promise<void> {
    console.warn('Cleaning up corrupted cache entries');
    // Implementation would clear corrupted cache entries
  }

  async releaseMemoryOnError(): Promise<void> {
    console.warn('Releasing memory due to error condition');
    // Implementation would trigger garbage collection or clear caches
  }

  notifyUser(error: CodeCompassError): void {
    console.error(`Error: ${error.message}`);
    if (error.suggestions && error.suggestions.length > 0) {
      console.error('Suggestions:', error.suggestions.join(', '));
    }
  }

  suggestFix(error: CodeCompassError): string[] {
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
  static handle(error: any, context: string = ''): CodeCompassError {
    if (error instanceof CodeCompassError) {
      return error;
    }

    // Convert standard errors to CodeCompass errors
    let errorType: ErrorType;
    let errorCode: string;
    let suggestions: string[] = [];

    if (error.code === 'ENOENT') {
      errorType = ErrorType.FILE_NOT_FOUND;
      errorCode = 'FILE_NOT_FOUND';
      suggestions = ['Check if the file path is correct', 'Verify the file exists'];
    } else if (error.code === 'EACCES') {
      errorType = ErrorType.PERMISSION_DENIED;
      errorCode = 'PERMISSION_DENIED';
      suggestions = ['Check file permissions', 'Run with elevated privileges if needed'];
    } else if (error.message && error.message.includes('parse')) {
      errorType = ErrorType.PARSE_ERROR;
      errorCode = 'PARSE_ERROR';
      suggestions = ['Check the syntax of the file', 'Try a different parser'];
    } else if (error.message && error.message.includes('timeout')) {
      errorType = ErrorType.LSP_REQUEST_TIMEOUT;
      errorCode = 'REQUEST_TIMEOUT';
    } else {
      errorType = ErrorType.SYSTEM_ERROR;
      errorCode = 'SYSTEM_ERROR';
      suggestions = ['Check the logs for more details', 'Report this issue to the developers'];
    }

    const codeCompassError = new CodeCompassError(
      errorType,
      `${context ? context + ': ' : ''}${error.message || 'Unknown error'}`,
      errorCode,
      { originalError: error },
      true, // Most errors are recoverable
      suggestions
    );

    console.error(`Handled error: ${codeCompassError.message}`);
    if (codeCompassError.suggestions) {
      console.error(`Suggestions: ${codeCompassError.suggestions.join(', ')}`);
    }

    return codeCompassError;
  }
}
