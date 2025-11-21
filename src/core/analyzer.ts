// src/core/analyzer.ts
import {
  ParsedAST,
  ComplexityMetrics,
  HalsteadMetrics,
  Symbol,
  Location,
  Range,
  FunctionDeclaration,
  ClassDeclaration,
  ImportStatement,
  Language,
} from '../types/ast';
import { CacheSystem } from '../utils/cache';

export interface CodeSmell {
  type: string;
  message: string;
  location: Location;
  severity: 'low' | 'medium' | 'high';
}

export interface DependencyGraph {
  imports: ImportStatement[];
  exports: any[]; // Using any for now until we define export types
  callGraph: Map<string, string[]>;
}

export interface AnalysisResult {
  filePath: string;
  language: Language;
  complexity: ComplexityMetrics;
  symbols: Symbol[];
  dependencies: DependencyGraph;
  metrics: any;
  codeSmells: CodeSmell[];
  patterns: any[];
}

export class CodeAnalyzer {
  private cacheSystem: CacheSystem;

  constructor(cacheSystem: CacheSystem) {
    this.cacheSystem = cacheSystem;
  }

  async analyzeAST(ast: ParsedAST): Promise<AnalysisResult> {
    // Analyze the parsed AST in depth
    const cacheKey = `analysis:${ast.hash}`;

    // Check if we have cached analysis for this AST
    const cachedResult = await this.cacheSystem.get<AnalysisResult>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const analysis: AnalysisResult = {
      filePath: ast.filePath,
      language: ast.language,
      complexity: await this.calculateComplexity(ast),
      symbols: ast.symbols || [],
      dependencies: await this.analyzeDependencies(ast),
      metrics: await this.calculateMetrics(ast),
      codeSmells: await this.detectCodeSmells(ast),
      patterns: await this.detectPatterns(ast),
    };

    // Cache the result
    await this.cacheSystem.set(cacheKey, analysis, 3600000); // 1 hour TTL

    return analysis;
  }

  async calculateComplexity(ast: ParsedAST): Promise<ComplexityMetrics> {
    // Calculate various complexity metrics
    // In a real implementation, we would analyze the AST structure
    // For now, we'll provide more sophisticated default calculation

    const cyclomatic = this.calculateCyclomaticComplexity(ast);
    const cognitive = this.calculateCognitiveComplexity(ast);
    const halstead = this.calculateHalsteadMetrics(ast);
    const maintainability = this.calculateMaintainability(ast);
    const nesting = this.calculateMaxNesting(ast);

    return {
      cyclomatic,
      cognitive,
      halstead,
      maintainability,
      nesting,
    };
  }

  private calculateCyclomaticComplexity(ast: ParsedAST): number {
    // Cyclomatic complexity: count of decision points + 1
    // Decision points: if, while, for, case, catch, &&, ||, ? (ternary), : (in ternary)

    // For now, we'll do a basic implementation by counting keywords in content
    // In a real implementation, we would traverse the actual AST nodes
    const content = ast.content.toLowerCase();

    // Count decision points
    const decisionPoints = [
      'if',
      'while',
      'for',
      'case',
      'catch',
      'elif',
      'else if',
      '&&',
      '||',
      '?',
      'switch',
    ];

    let count = 1; // Start with 1 as per McCabe's definition

    for (const point of decisionPoints) {
      // Count occurrences of decision points
      const regex = new RegExp(`\\b${point}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        count += matches.length;
      }
    }

    // Ensure a minimum complexity of 1
    return Math.max(1, count);
  }

  private calculateCognitiveComplexity(ast: ParsedAST): number {
    // Cognitive complexity measures how difficult the code is to understand
    // It's similar to cyclomatic complexity but treats nesting differently

    // For now, we'll implement a basic calculation
    // In a real implementation, we would analyze the AST structure more deeply
    const content = ast.content;

    // Count nesting levels, recursion, and boolean complexity separately
    const nestingMatches = content.match(/[{}]/g);
    const nestingComplexity = nestingMatches ? nestingMatches.length / 2 : 0;

    // Count sequential operations
    const sequentialMatches = content.match(/;/g);
    const sequentialComplexity = sequentialMatches
      ? sequentialMatches.length
      : 0;

    // Calculate based on basic heuristics
    const baseComplexity = this.calculateCyclomaticComplexity(ast);

    // Cognitive complexity is typically similar to but sometimes less than cyclomatic
    return Math.max(
      1,
      Math.round(
        baseComplexity * 0.8 +
          nestingComplexity * 0.1 +
          sequentialComplexity * 0.1
      )
    );
  }

  private calculateHalsteadMetrics(ast: ParsedAST): HalsteadMetrics {
    // Halstead metrics are based on the number of operators and operands
    // For now, we'll provide a basic implementation

    const content = ast.content;

    // Define operators and operands (simplified version)
    const operators = [
      '+',
      '-',
      '*',
      '/',
      '=',
      '==',
      '===',
      '!=',
      '!==',
      '<',
      '>',
      '<=',
      '>=',
      '!',
      '&',
      '|',
      '^',
      '%',
      '~',
      '<<',
      '>>',
      '>>>',
      '&&',
      '||',
      '?',
      ':',
      '++',
      '--',
      '+=',
      '-=',
      '*=',
      '/=',
      '%=',
    ];
    const operands = []; // In a real implementation, we'd extract identifiers, literals, etc.

    // Count operators in content
    let operatorCount = 0;
    for (const op of operators) {
      const regex = new RegExp(
        `\\${op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'g'
      );
      const matches = content.match(regex);
      if (matches) {
        operatorCount += matches.length;
      }
    }

    // Count operands - extract identifiers and literals
    const operandMatches = content.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g);
    const operandCount = operandMatches ? operandMatches.length : 0;

    // Calculate unique counts
    const uniqueOperators = new Set(
      operators.filter(op => content.includes(op))
    ).size;
    const uniqueOperands = new Set(operandMatches || []).size;

    // Calculate Halstead metrics
    const n1 = uniqueOperators;
    const n2 = uniqueOperands;
    const N1 = operatorCount;
    const N2 = operandCount;

    const vocabulary = n1 + n2;
    const length = N1 + N2;
    const calculatedLength = n1 * Math.log2(n1) + n2 * Math.log2(n2);
    const volume = length * Math.log2(vocabulary);
    const difficulty = (n1 / 2) * (N2 / n2);
    const effort = difficulty * volume;
    const time = effort / 18; // seconds to implement
    const bugs = volume / 3000; // estimate of delivered bugs

    return {
      vocabulary: Math.max(1, vocabulary),
      length: Math.max(1, length),
      calculatedLength: Math.max(1, calculatedLength),
      volume: Math.max(1, volume),
      difficulty: Math.max(0.1, difficulty),
      effort: Math.max(1, effort),
      time: Math.max(0.1, time),
      bugs: Math.max(0.0001, bugs),
    };
  }

  private calculateMaintainability(ast: ParsedAST): number {
    // Calculate maintainability index based on complexity metrics
    // Formula: 171 - 5.2 * ln(entropy) - 0.23 * CC - 16.2 * ln(SLOC)
    // Where CC = Cyclomatic Complexity, SLOC = Source Lines of Code

    const cc = this.calculateCyclomaticComplexity(ast);
    const sloc = ast.content.split('\n').length;
    const halsteadVolume = this.calculateHalsteadMetrics(ast).volume;

    // Calculate entropy (simplified)
    const lines = ast.content.split('\n').filter(line => line.trim() !== '');
    const avgLineLength = ast.content.length / Math.max(1, lines.length);
    const entropy = Math.log2(avgLineLength + 1); // Adding 1 to prevent log(0)

    // Maintainability index formula (simplified)
    let mi =
      171 -
      5.2 * Math.log(halsteadVolume + 1) -
      0.23 * cc -
      16.2 * Math.log(sloc + 1);

    // Ensure the index is between 0 and 100
    mi = Math.min(100, Math.max(0, mi));

    return Math.round(mi);
  }

  private calculateMaxNesting(ast: ParsedAST): number {
    // Calculate maximum nesting depth by analyzing curly braces
    // In a real implementation, we would analyze the AST's actual structure
    const content = ast.content;

    let currentNesting = 0;
    let maxNesting = 0;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (char === '{') {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      } else if (char === '}') {
        currentNesting--;
      }
    }

    return maxNesting;
  }

  async analyzeDependencies(ast: ParsedAST): Promise<DependencyGraph> {
    // Analyze import/usage relationships in the AST
    // For now, we'll return a basic dependency graph

    const imports = ast.imports || [];
    const exports = ast.exports || [];

    // In a real implementation, we would build a call graph by analyzing function calls
    const callGraph = new Map<string, string[]>();

    // For TypeScript/JavaScript, we might analyze function calls
    if (
      ast.language === Language.TypeScript ||
      ast.language === Language.JavaScript
    ) {
      // This would be implemented with actual AST traversal in a real implementation
      // For now, we'll return an empty call graph
    }

    return {
      imports,
      exports,
      callGraph,
    };
  }

  async calculateMetrics(ast: ParsedAST): Promise<any> {
    // Calculate various code metrics
    const linesOfCode = ast.content.split('\n').length;
    const linesOfCodeNoComments = this.countLinesWithoutComments(ast.content);
    const characterCount = ast.content.length;
    const commentLines = this.countCommentLines(ast.content);

    const functionCount = ast.functions ? ast.functions.length : 0;
    const classCount = ast.classes ? ast.classes.length : 0;

    const avgFunctionSize =
      functionCount > 0 ? linesOfCode / functionCount : linesOfCode;
    const avgClassSize =
      classCount > 0 ? linesOfCode / classCount : linesOfCode;

    return {
      linesOfCode,
      linesOfCodeNoComments,
      characterCount,
      commentLines,
      functionCount,
      classCount,
      avgFunctionSize,
      avgClassSize,
      complexity: await this.calculateComplexity(ast),
      documentation: await this.extractDocumentation(ast),
    };
  }

  private countLinesWithoutComments(content: string): number {
    // In a real implementation, we would properly parse comments
    // For now, we'll use a basic approach
    const lines = content.split('\n');
    let codeLines = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (
        trimmedLine &&
        !trimmedLine.startsWith('//') &&
        !trimmedLine.startsWith('/*') &&
        !trimmedLine.startsWith('*')
      ) {
        codeLines++;
      }
    }

    return codeLines;
  }

  private countCommentLines(content: string): number {
    // In a real implementation, we would properly parse comments
    // For now, we'll use a basic approach
    const lines = content.split('\n');
    let commentLines = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith('/*') ||
        trimmedLine.startsWith('*') ||
        trimmedLine === '*/'
      ) {
        commentLines++;
      }
    }

    return commentLines;
  }

  async detectCodeSmells(ast: ParsedAST): Promise<CodeSmell[]> {
    // Detect common code smells in the AST
    const smells: CodeSmell[] = [];

    // Check for functions that are too long
    if (ast.functions) {
      for (const func of ast.functions) {
        const funcLines = func.range.end.line - func.range.start.line;
        if (funcLines > 50) {
          // More than 50 lines is considered "long"
          smells.push({
            type: 'Long Function',
            message: `Function ${func.name} is ${funcLines} lines long, which is considered too long`,
            location: { uri: ast.filePath, range: func.range },
            severity: 'high',
          });
        }
      }
    }

    // Check for complex functions (high cyclomatic complexity)
    const complexity = await this.calculateComplexity(ast);
    if (complexity.cyclomatic > 10) {
      smells.push({
        type: 'High Complexity',
        message: `Code has cyclomatic complexity of ${complexity.cyclomatic}, which is too high`,
        location: {
          uri: ast.filePath,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        },
        severity: 'high',
      });
    }

    // Check for deeply nested code
    if (complexity.nesting > 4) {
      smells.push({
        type: 'Deep Nesting',
        message: `Code has nesting level of ${complexity.nesting}, which is too deep`,
        location: {
          uri: ast.filePath,
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
          },
        },
        severity: 'medium',
      });
    }

    // Check for duplicated code blocks (simplified check)
    const lines = ast.content.split('\n');
    const lineCounts: { [line: string]: number } = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 10) {
        // Only consider lines with substantial content
        lineCounts[trimmedLine] = (lineCounts[trimmedLine] || 0) + 1;
      }
    }

    // Add duplicated code smells if we find lines that appear more than 3 times
    for (const [line, count] of Object.entries(lineCounts)) {
      if (count > 3) {
        smells.push({
          type: 'Duplicated Code',
          message: `Code line appears ${count} times in the file`,
          location: {
            uri: ast.filePath,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: 0 },
            },
          },
          severity: 'medium',
        });
      }
    }

    return smells;
  }

  async analyzeSymbol(symbol: Symbol, context: any): Promise<any> {
    // Analyze a specific symbol in detail
    return {
      ...symbol,
      analysis: {
        complexity: await this.calculateComplexityForSymbol(symbol),
        references: await this.findSymbolReferences(symbol, context),
        dependencies: await this.findSymbolDependencies(symbol),
        relatedSymbols: await this.findRelatedSymbols(symbol, context),
      },
    };
  }

  private async calculateComplexityForSymbol(
    symbol: Symbol
  ): Promise<ComplexityMetrics> {
    // In a real implementation, we would calculate complexity for a specific symbol
    // For now, return default values
    return {
      cyclomatic: 1,
      cognitive: 1,
      halstead: {
        vocabulary: 10,
        length: 20,
        calculatedLength: 15,
        volume: 100,
        difficulty: 2,
        effort: 200,
        time: 11,
        bugs: 0.033,
      },
      maintainability: 85,
      nesting: 1,
    };
  }

  private async findSymbolReferences(
    symbol: Symbol,
    context: any
  ): Promise<any[]> {
    // Find all references to a symbol
    // In a real implementation, we would search across the codebase
    return [];
  }

  private async findSymbolDependencies(symbol: Symbol): Promise<any[]> {
    // Find dependencies of a symbol
    // In a real implementation, we would analyze the AST
    return [];
  }

  private async findRelatedSymbols(
    symbol: Symbol,
    context: any
  ): Promise<any[]> {
    // Find symbols related to a given symbol
    // In a real implementation, we would analyze the AST and dependency graph
    return [];
  }

  async detectPatterns(ast: ParsedAST): Promise<any[]> {
    // Detect specific patterns in the AST
    // This would implement the structural pattern matching capability
    const patterns = [];

    // Example: detect all async functions
    if (ast.functions) {
      for (const func of ast.functions) {
        if (func.isAsync) {
          patterns.push({
            type: 'AsyncFunction',
            name: func.name,
            location: { uri: ast.filePath, range: func.range },
          });
        }
      }
    }

    // Example: detect all classes with more than 5 methods
    if (ast.classes) {
      for (const cls of ast.classes) {
        if (cls.methods && cls.methods.length > 5) {
          patterns.push({
            type: 'LargeClass',
            name: cls.name,
            methodCount: cls.methods.length,
            location: { uri: ast.filePath, range: cls.range },
          });
        }
      }
    }

    return patterns;
  }

  private async extractDocumentation(ast: ParsedAST): Promise<any> {
    // Extract documentation from comments in the AST
    // For now, we'll implement a basic extraction
    const content = ast.content;
    const docBlocks: string[] = [];

    // Extract JSDoc-style comments
    const jsDocRegex = /\/\*\*[\s\S]*?\*\//g;
    let match;

    while ((match = jsDocRegex.exec(content)) !== null) {
      docBlocks.push(match[0]);
    }

    // Extract single-line comments that might be documentation
    const lines = content.split('\n');
    const singleLineDocs: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        line.startsWith('///') ||
        (line.startsWith('//') && line.length > 10)
      ) {
        singleLineDocs.push(line);
      }
    }

    return {
      docBlocks: docBlocks.length,
      singleLineComments: singleLineDocs.length,
      hasDocumentation: docBlocks.length > 0 || singleLineDocs.length > 0,
    };
  }
}
