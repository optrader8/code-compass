import { ParsedAST, Language, ASTQuery, TextChange, CodeNode } from '../types/ast';
export interface LanguageParser {
    canParse(filePath: string): boolean;
    parse(content: string): Promise<ParsedAST>;
    query(ast: ParsedAST, query: ASTQuery): CodeNode[];
    extractMetadata(node: CodeNode): any;
    updateAST?(ast: ParsedAST, changes: TextChange[]): Promise<ParsedAST>;
}
export declare abstract class BaseParser implements LanguageParser {
    abstract canParse(filePath: string): boolean;
    abstract parse(content: string): Promise<ParsedAST>;
    abstract query(ast: ParsedAST, query: ASTQuery): CodeNode[];
    abstract extractMetadata(node: CodeNode): any;
    updateAST(ast: ParsedAST, changes: TextChange[]): Promise<ParsedAST>;
    protected detectLanguageFromPath(filePath: string): Language | null;
}
//# sourceMappingURL=base.d.ts.map