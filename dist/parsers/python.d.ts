import { BaseParser } from './base';
import { ParsedAST, ASTQuery, TextChange, CodeNode } from '../types/ast';
export declare class PythonParser extends BaseParser {
    private parser;
    constructor();
    canParse(filePath: string): boolean;
    parse(content: string): Promise<ParsedAST>;
    query(ast: ParsedAST, query: ASTQuery): CodeNode[];
    extractMetadata(node: CodeNode): any;
    updateAST(ast: ParsedAST, changes: TextChange[]): Promise<ParsedAST>;
    private populateSymbols;
    private toFunction;
    private toClass;
    private toImport;
    private toRange;
    private applyChange;
}
//# sourceMappingURL=python.d.ts.map