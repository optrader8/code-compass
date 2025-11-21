"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonParser = void 0;
// src/parsers/python.ts
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_python_1 = __importDefault(require("tree-sitter-python"));
const crypto_1 = require("crypto");
const base_1 = require("./base");
const ast_1 = require("../types/ast");
class PythonParser extends base_1.BaseParser {
    constructor() {
        super();
        this.parser = new tree_sitter_1.default();
        this.parser.setLanguage(tree_sitter_python_1.default);
    }
    canParse(filePath) {
        const extension = filePath.split('.').pop()?.toLowerCase();
        return extension === 'py';
    }
    async parse(content) {
        const tree = this.parser.parse(content);
        const hash = (0, crypto_1.createHash)('sha1').update(content).digest('hex');
        const ast = {
            language: ast_1.Language.Python,
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
        const updatedTree = this.parser.parse(updatedContent);
        const hash = (0, crypto_1.createHash)('sha1').update(updatedContent).digest('hex');
        return {
            ...ast,
            content: updatedContent,
            tree: updatedTree,
            hash,
            timestamp: Date.now(),
        };
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
    toFunction(node) {
        const nameNode = node.childForFieldName('name') || node.child(1);
        const name = nameNode ? nameNode.text : '(anonymous)';
        const paramsNode = node.childForFieldName('parameters');
        const parameters = paramsNode?.namedChildren
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
    toClass(node) {
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
    toImport(node) {
        const sourceNode = node.type === 'import_from_statement'
            ? node.childForFieldName('module_name')
            : node.childForFieldName('name');
        const specifiers = node.namedChildren
            .filter(child => child.type === 'aliased_import' ||
            child.type === 'dotted_name' ||
            child.type === 'identifier')
            .map(child => ({ name: child.text })) ?? [];
        return {
            source: sourceNode ? sourceNode.text.replace(/['"]/g, '') : '',
            imports: specifiers,
            isDefault: false,
            range: this.toRange(node),
        };
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
exports.PythonParser = PythonParser;
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
//# sourceMappingURL=python.js.map