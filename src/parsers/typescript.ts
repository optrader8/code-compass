// src/parsers/typescript.ts
import Parser, { SyntaxNode } from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScriptLang from 'tree-sitter-typescript';
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

export class TypeScriptParser extends BaseParser {
  private tsParser: Parser;
  private jsParser: Parser;

  constructor() {
    super();
    this.tsParser = new Parser();
    this.jsParser = new Parser();

    // @ts-ignore tree-sitter-typescript exports languages as properties
    this.tsParser.setLanguage(TypeScriptLang.typescript);
    this.jsParser.setLanguage(JavaScript);
  }

  canParse(filePath: string): boolean {
    const extension = filePath.split('.').pop()?.toLowerCase();
    return extension === 'ts' || extension === 'js' || extension === 'jsx';
  }

  async parse(content: string): Promise<ParsedAST> {
    let tree = this.tsParser.parse(content);
    let languageUsed = Language.TypeScript;

    if (tree.rootNode.hasError()) {
      const jsTree = this.jsParser.parse(content);
      if (
        !jsTree.rootNode.hasError() ||
        jsTree.rootNode.namedChildCount >= tree.rootNode.namedChildCount
      ) {
        tree = jsTree;
        languageUsed = Language.JavaScript;
      }
    }

    const hash = createHash('sha1').update(content).digest('hex');
    const ast: ParsedAST = {
      language: languageUsed,
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
        case 'function_declaration':
          functions.push(this.toFunction(node));
          break;
        case 'method_definition':
          functions.push(this.toFunction(node, true));
          break;
        case 'class_declaration':
          classes.push(this.toClass(node));
          break;
        case 'import_statement':
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

  private toFunction(node: SyntaxNode, isMethod: boolean = false): FunctionDeclaration {
    const nameNode =
      this.childForFieldNameSafe(node, 'name') ||
      node.namedChildren.find(c => c.type === 'identifier' || c.type === 'property_identifier') ||
      node.child(1);
    const name = nameNode ? nameNode.text : '(anonymous)';
    const paramsNode = this.childForFieldNameSafe(node, 'parameters');
    const parameters =
      paramsNode?.namedChildren
        .filter(
          child =>
            child.type === 'required_parameter' ||
            child.type === 'identifier' ||
            child.type === 'rest_parameter'
        )
        .map(child => ({ name: child.text })) ?? [];

    return {
      name,
      parameters,
      returnType: undefined,
      isAsync: !!this.childForFieldNameSafe(node, 'async'),
      isExported: this.isExported(node),
      range: this.toRange(node),
    };
  }

  private toClass(node: SyntaxNode): ClassDeclaration {
    const nameNode = this.childForFieldNameSafe(node, 'name') || node.namedChildren.find(c => c.type === 'identifier') || node.child(1);
    const name = nameNode ? nameNode.text : '(anonymous)';
    const methodNodes = this.collectNodes(node, 'method_definition');
    const methods = methodNodes.map(child => this.toFunction(child, true));

    const cls: ClassDeclaration = {
      name,
      methods,
      properties: [],
      range: this.toRange(node),
    };
    return cls;
  }

  private toImport(node: SyntaxNode): ImportStatement {
    const sourceNode = this.childForFieldNameSafe(node, 'source');
    const specifierNodes = node.namedChildren.filter(
      child =>
        child.type === 'import_clause' ||
        child.type === 'named_imports' ||
        child.type === 'identifier'
    );
    const imports = specifierNodes.flatMap(child =>
      child.namedChildren
        .filter(
          c => c.type === 'import_specifier' || c.type === 'identifier'
        )
        .map(c => ({ name: c.text }))
    );

    const imp: ImportStatement = {
      source: sourceNode ? sourceNode.text.replace(/['"]/g, '') : '',
      imports,
      isDefault: imports.length === 0,
      range: this.toRange(node),
    };
    return imp;
  }

  private childForFieldNameSafe(node: SyntaxNode, field: string): SyntaxNode | null {
    const anyNode = node as any;
    if (typeof anyNode.childForFieldName === 'function') {
      return anyNode.childForFieldName(field);
    }
    return null;
  }

  private collectNodes(root: SyntaxNode, type: string): SyntaxNode[] {
    const results: SyntaxNode[] = [];
    const stack: SyntaxNode[] = [root];
    while (stack.length) {
      const current = stack.pop();
      if (!current) continue;
      if (current.type === type) {
        results.push(current);
      }
      stack.push(...current.namedChildren);
    }
    return results;
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

  private isExported(node: SyntaxNode): boolean {
    const parent = node.parent;
    if (!parent) return false;
    return parent.children.some(
      child =>
        child.type === 'export' ||
        child.type === 'export_statement' ||
        child.type === 'export_clause'
    );
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

    const updatedTree = this.tsParser.parse(updatedContent);
    const hash = createHash('sha1').update(updatedContent).digest('hex');

    return {
      ...ast,
      content: updatedContent,
      tree: updatedTree,
      hash,
      timestamp: Date.now(),
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
