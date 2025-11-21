"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptParser = void 0;
// src/parsers/typescript.ts
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_javascript_1 = __importDefault(require("tree-sitter-javascript"));
const tree_sitter_typescript_1 = __importDefault(require("tree-sitter-typescript"));
const crypto_1 = require("crypto");
const base_1 = require("./base");
const ast_1 = require("../types/ast");
class TypeScriptParser extends base_1.BaseParser {
    constructor() {
        super();
        this.tsParser = new tree_sitter_1.default();
        this.jsParser = new tree_sitter_1.default();
        // @ts-ignore tree-sitter-typescript exports languages as properties
        this.tsParser.setLanguage(tree_sitter_typescript_1.default.typescript);
        this.jsParser.setLanguage(tree_sitter_javascript_1.default);
    }
    canParse(filePath) {
        const extension = filePath.split('.').pop()?.toLowerCase();
        return extension === 'ts' || extension === 'js' || extension === 'jsx';
    }
    async parse(content) {
        let tree = this.tsParser.parse(content);
        let languageUsed = ast_1.Language.TypeScript;
        if (tree.rootNode.hasError()) {
            const jsTree = this.jsParser.parse(content);
            if (!jsTree.rootNode.hasError() ||
                jsTree.rootNode.namedChildCount >= tree.rootNode.namedChildCount) {
                tree = jsTree;
                languageUsed = ast_1.Language.JavaScript;
            }
        }
        const hash = (0, crypto_1.createHash)('sha1').update(content).digest('hex');
        const ast = {
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
    query(ast, query) {
        if (!ast.tree)
            return [];
        const matches = [];
        const targetType = query.pattern;
        const walker = [ast.tree.rootNode];
        while (walker.length) {
            const node = walker.pop();
            if (!node)
                continue;
            if (node.type === targetType) {
                matches.push(new TreeSitterCodeNode(node, ast.content));
            }
            walker.push(...node.namedChildren);
        }
        return matches;
    }
    populateSymbols(ast) {
        if (!ast.tree)
            return;
        const functions = [];
        const classes = [];
        const imports = [];
        const stack = [ast.tree.rootNode];
        while (stack.length) {
            const node = stack.pop();
            if (!node)
                continue;
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
    toFunction(node, isMethod = false) {
        const nameNode = node.childForFieldName('name') || node.child(1);
        const name = nameNode ? nameNode.text : '(anonymous)';
        const paramsNode = node.childForFieldName('parameters');
        const parameters = paramsNode?.namedChildren
            .filter(child => child.type === 'required_parameter' ||
            child.type === 'identifier' ||
            child.type === 'rest_parameter')
            .map(child => ({ name: child.text })) ?? [];
        return {
            name,
            parameters,
            returnType: undefined,
            isAsync: !!node.childForFieldName('async'),
            isExported: this.isExported(node),
            range: this.toRange(node),
        };
    }
    toClass(node) {
        const nameNode = node.childForFieldName('name') || node.child(1);
        const name = nameNode ? nameNode.text : '(anonymous)';
        const methods = node.namedChildren
            .filter(child => child.type === 'method_definition')
            .map(child => this.toFunction(child, true));
        const cls = {
            name,
            methods,
            properties: [],
            range: this.toRange(node),
        };
        return cls;
    }
    toImport(node) {
        const sourceNode = node.childForFieldName('source');
        const specifierNodes = node.namedChildren.filter(child => child.type === 'import_clause' ||
            child.type === 'named_imports' ||
            child.type === 'identifier');
        const imports = specifierNodes.flatMap(child => child.namedChildren
            .filter(c => c.type === 'import_specifier' || c.type === 'identifier')
            .map(c => ({ name: c.text })));
        const imp = {
            source: sourceNode ? sourceNode.text.replace(/['"]/g, '') : '',
            imports,
            isDefault: imports.length === 0,
            range: this.toRange(node),
        };
        return imp;
    }
    toRange(node) {
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
    isExported(node) {
        const parent = node.parent;
        if (!parent)
            return false;
        return parent.children.some(child => child.type === 'export' ||
            child.type === 'export_statement' ||
            child.type === 'export_clause');
    }
    extractMetadata(node) {
        return {
            type: node.type,
            range: node.range,
            length: node.text?.length ?? 0,
        };
    }
    async updateAST(ast, changes) {
        let updatedContent = ast.content;
        const sortedChanges = [...changes].sort((a, b) => b.start.line - a.start.line || b.start.character - a.start.character);
        for (const change of sortedChanges) {
            updatedContent = this.applyChange(updatedContent, change);
        }
        const updatedTree = this.tsParser.parse(updatedContent);
        const hash = (0, crypto_1.createHash)('sha1').update(updatedContent).digest('hex');
        return {
            ...ast,
            content: updatedContent,
            tree: updatedTree,
            hash,
            timestamp: Date.now(),
        };
    }
    applyChange(content, change) {
        const lines = content.split('\n');
        const startLine = change.start.line;
        const startChar = change.start.character;
        const endLine = change.end.line;
        const endChar = change.end.character;
        if (startLine === endLine) {
            const line = lines[startLine];
            const newLine = line.substring(0, startChar) + change.newText + line.substring(endChar);
            lines[startLine] = newLine;
            return lines.join('\n');
        }
        const startLineText = lines[startLine].substring(0, startChar);
        const endLineText = lines[endLine].substring(endChar);
        lines.splice(startLine, endLine - startLine + 1, startLineText + change.newText + endLineText);
        return lines.join('\n');
    }
}
exports.TypeScriptParser = TypeScriptParser;
class TreeSitterCodeNode {
    constructor(node, content) {
        this.node = node;
        this.content = content;
        this.properties = new Map();
    }
    get type() {
        return this.node.type;
    }
    get range() {
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
    get text() {
        return this.node.text;
    }
    get children() {
        return this.node.namedChildren.map(child => new TreeSitterCodeNode(child, this.content));
    }
    get parent() {
        return this.node.parent
            ? new TreeSitterCodeNode(this.node.parent, this.content)
            : undefined;
    }
    findChild(type) {
        const child = this.node.namedChildren.find(c => c.type === type);
        return child ? new TreeSitterCodeNode(child, this.content) : null;
    }
    findChildren(type) {
        return this.node.namedChildren
            .filter(c => c.type === type)
            .map(c => new TreeSitterCodeNode(c, this.content));
    }
    findAncestor(type) {
        let current = this.node.parent;
        while (current) {
            if (current.type === type) {
                return new TreeSitterCodeNode(current, this.content);
            }
            current = current.parent;
        }
        return null;
    }
}
//# sourceMappingURL=typescript.js.map