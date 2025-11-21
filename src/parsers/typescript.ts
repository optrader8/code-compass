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
