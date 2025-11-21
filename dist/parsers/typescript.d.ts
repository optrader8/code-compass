import { BaseParser } from './base';
import { ParsedAST, ASTQuery, TextChange, CodeNode } from '../types/ast';
export declare class TypeScriptParser extends BaseParser {
    private tsParser;
    private jsParser;
    constructor();
    canParse(filePath: string): boolean;
    parse(content: string): Promise<ParsedAST>;
    query(ast: ParsedAST, query: ASTQuery): CodeNode[];
    private populateSymbols;
    private toFunction;
    private toClass;
    private toImport;
    private toRange;
    private isExported;
    extractMetadata(node: CodeNode): any;
    updateAST(ast: ParsedAST, changes: TextChange[]): Promise<ParsedAST>;
    private applyChange;
}
//# sourceMappingURL=typescript.d.ts.map