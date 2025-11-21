// src/types/search.ts
import { Location, Range, Language, SymbolKind } from './ast';

export interface SearchQuery {
  pattern: string;
  type: SearchType;
  filePattern?: string;
  language?: Language;
  options: SearchOptions;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  regex?: boolean;
  contextLines?: number;
  maxResults?: number;
  includeContext?: boolean;
}

export interface SearchResult {
  location: Location;
  content: string;
  context: string[];
  score: number;
  metadata: SearchMetadata;
}

export interface SearchMetadata {
  fileType: string;
  language: Language;
  symbolType?: SymbolKind;
  complexity?: number;
  lastModified: Date;
}

export interface SearchResultGroup {
  query: SearchQuery;
  results: SearchResult[];
  timestamp: Date;
  executionTime: number;
}

export interface ASTQuery {
  pattern: string;
  captures?: string[];
  predicates?: QueryPredicate[];
}

export interface QueryPredicate {
  operator: string;
  operands: any[];
}

export enum SearchType {
  Text = 'text',
  Function = 'function',
  Class = 'class',
  Import = 'import',
  Variable = 'variable',
  Structural = 'structural',
  Semantic = 'semantic',
}

export interface PatternMatch {
  node: any; // Tree-sitter node
  captures: Map<string, any>;
  location: Location;
  score: number;
}
