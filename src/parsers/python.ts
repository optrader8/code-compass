// src/parsers/python.ts
import Parser, { SyntaxNode } from 'tree-sitter';
import PythonLang from 'tree-sitter-python';
import { createHash } from 'crypto';
import { BaseParser } from './base';
import {
  ParsedAST,
  Language,
  ASTQuery,
  TextChange,
  CodeNode,
  Range,
  FunctionDeclaration,
  ClassDeclaration,
  ImportStatement,
} from '../types/ast';

export class PythonParser extends BaseParser {
  private parser: Parser;

  constructor() {
    super();
    this.parser = new Parser();
    this.parser.setLanguage(PythonLang);
  }

  canParse(filePath: string): boolean {
    const extension = filePath.split('.').pop()?.toLowerCase();
    return extension === 'py';
  }

  async parse(content: string): Promise<ParsedAST> {
    const tree = this.parser.parse(content);
    const hash = createHash('sha1').update(content).digest('hex');

    const ast: ParsedAST = {
      language: Language.Python,
      filePath: '',
      content,
      tree,
      hash,
      timestamp: Date.now(),
      symbols: [],
      imports: [],
      exports: [],
      functions: [],
      classes: [],
    };

    this.populateSymbols(ast);
    return ast;
  }

  query(ast: ParsedAST, query: ASTQuery): CodeNode[] {
    if (!ast.tree) return [];

    const matches: CodeNode[] = [];
    const targetType = query.pattern;
    const walker = [ast.tree.rootNode];

    while (walker.length) {
      const node = walker.pop();
      if (!node) continue;
      if (node.type === targetType) {
        matches.push(new TreeSitterCodeNode(node, ast.content));
      }
      walker.push(...node.namedChildren);
    }

    return matches;
  }

  extractMetadata(node: CodeNode): any {
    return {
      type: node.type,
      range: node.range,
      length: node.text?.length ?? 0,
    };
  }

  async updateAST(ast: ParsedAST, changes: TextChange[]): Promise<ParsedAST> {
    let updatedContent = ast.content;

    const sortedChanges = [...changes].sort(
      (a, b) =>
        b.start.line - a.start.line || b.start.character - a.start.character
    );

    for (const change of sortedChanges) {
      updatedContent = this.applyChange(updatedContent, change);
    }

    const updatedTree = this.parser.parse(updatedContent);
    const hash = createHash('sha1').update(updatedContent).digest('hex');

    return {
      ...ast,
      content: updatedContent,
      tree: updatedTree,
      hash,
      timestamp: Date.now(),
    };
  }

  private populateSymbols(ast: ParsedAST): void {
    if (!ast.tree) return;
    const functions: FunctionDeclaration[] = [];
    const classes: ClassDeclaration[] = [];
    const imports: ImportStatement[] = [];

    const stack: SyntaxNode[] = [ast.tree.rootNode];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;

      switch (node.type) {
        case 'function_definition':
          functions.push(this.toFunction(node));
          break;
        case 'class_definition':
          classes.push(this.toClass(node));
          break;
        case 'import_statement':
        case 'import_from_statement':
          imports.push(this.toImport(node));
          break;
        default:
          break;
      }

      stack.push(...node.namedChildren);
    }

    ast.functions = functions;
    ast.classes = classes;
    ast.imports = imports;
  }

  private toFunction(node: SyntaxNode): FunctionDeclaration {
    const nameNode = node.childForFieldName('name') || node.child(1);
    const name = nameNode ? nameNode.text : '(anonymous)';
    const paramsNode = node.childForFieldName('parameters');
    const parameters =
      paramsNode?.namedChildren
        .filter(child => child.type === 'identifier')
        .map(child => ({ name: child.text })) ?? [];

    return {
      name,
      parameters,
      isAsync: !!node.childForFieldName('async'),
      isExported: false,
      range: this.toRange(node),
    };
  }

  private toClass(node: SyntaxNode): ClassDeclaration {
    const nameNode = node.childForFieldName('name') || node.child(1);
    const name = nameNode ? nameNode.text : '(anonymous)';
    const methods = node.namedChildren
      .filter(child => child.type === 'function_definition')
      .map(child => this.toFunction(child));

    return {
      name,
      methods,
      properties: [],
      range: this.toRange(node),
    };
  }

  private toImport(node: SyntaxNode): ImportStatement {
    const sourceNode =
      node.type === 'import_from_statement'
        ? node.childForFieldName('module_name')
        : node.childForFieldName('name');

    const specifiers =
      node.namedChildren
        .filter(
          child =>
            child.type === 'aliased_import' ||
            child.type === 'dotted_name' ||
            child.type === 'identifier'
        )
        .map(child => ({ name: child.text })) ?? [];

    return {
      source: sourceNode ? sourceNode.text.replace(/['"]/g, '') : '',
      imports: specifiers,
      isDefault: false,
      range: this.toRange(node),
    };
  }

  private toRange(node: SyntaxNode): Range {
    return {
      start: {
        line: node.startPosition.row,
        character: node.startPosition.column,
      },
      end: {
        line: node.endPosition.row,
        character: node.endPosition.column,
      },
    };
  }

  private applyChange(content: string, change: TextChange): string {
    const lines = content.split('\n');
    const startLine = change.start.line;
    const startChar = change.start.character;
    const endLine = change.end.line;
    const endChar = change.end.character;

    if (startLine === endLine) {
      const line = lines[startLine];
      const newLine =
        line.substring(0, startChar) + change.newText + line.substring(endChar);
      lines[startLine] = newLine;
      return lines.join('\n');
    }

    const startLineText = lines[startLine].substring(0, startChar);
    const endLineText = lines[endLine].substring(endChar);
    lines.splice(
      startLine,
      endLine - startLine + 1,
      startLineText + change.newText + endLineText
    );

    return lines.join('\n');
  }
}

class TreeSitterCodeNode implements CodeNode {
  properties: Map<string, any> = new Map();

  constructor(
    private node: SyntaxNode,
    private content: string
  ) {}

  get type(): string {
    return this.node.type;
  }

  get range(): Range {
    return {
      start: {
        line: this.node.startPosition.row,
        character: this.node.startPosition.column,
      },
      end: {
        line: this.node.endPosition.row,
        character: this.node.endPosition.column,
      },
    };
  }

  get text(): string {
    return this.node.text;
  }

  get children(): CodeNode[] {
    return this.node.namedChildren.map(
      child => new TreeSitterCodeNode(child, this.content)
    );
  }

  get parent(): CodeNode | undefined {
    return this.node.parent
      ? new TreeSitterCodeNode(this.node.parent, this.content)
      : undefined;
  }

  findChild(type: string): CodeNode | null {
    const child = this.node.namedChildren.find(c => c.type === type);
    return child ? new TreeSitterCodeNode(child, this.content) : null;
  }

  findChildren(type: string): CodeNode[] {
    return this.node.namedChildren
      .filter(c => c.type === type)
      .map(c => new TreeSitterCodeNode(c, this.content));
  }

  findAncestor(type: string): CodeNode | null {
    let current: SyntaxNode | null = this.node.parent;
    while (current) {
      if (current.type === type) {
        return new TreeSitterCodeNode(current, this.content);
      }
      current = current.parent;
    }
    return null;
  }
}
