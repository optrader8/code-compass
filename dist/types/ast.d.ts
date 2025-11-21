export interface CodeNode {
    type: string;
    range: Range;
    text: string;
    children: CodeNode[];
    parent?: CodeNode;
    properties: Map<string, any>;
    findChild(type: string): CodeNode | null;
    findChildren(type: string): CodeNode[];
    findAncestor(type: string): CodeNode | null;
}
export interface Range {
    start: Position;
    end: Position;
}
export interface Position {
    line: number;
    character: number;
}
export interface ParsedAST {
    language: Language;
    filePath: string;
    content: string;
    tree: any;
    hash: string;
    timestamp: number;
    symbols?: Symbol[];
    imports?: ImportStatement[];
    exports?: ExportStatement[];
    functions?: FunctionDeclaration[];
    classes?: ClassDeclaration[];
}
export interface Symbol {
    name: string;
    kind: SymbolKind;
    location: Location;
    range: Range;
    selectionRange: Range;
    detail?: string;
    documentation?: string;
    deprecated?: boolean;
    tags?: SymbolTag[];
    complexity?: ComplexityMetrics;
    references?: Reference[];
    dependencies?: Dependency[];
}
export interface Location {
    uri: string;
    range: Range;
}
export interface FunctionDeclaration {
    name: string;
    parameters: Parameter[];
    returnType?: string;
    isAsync: boolean;
    isExported: boolean;
    range: Range;
}
export interface ClassDeclaration {
    name: string;
    methods: FunctionDeclaration[];
    properties: PropertyNode[];
    extends?: string;
    implements?: string[];
    range: Range;
}
export interface ImportStatement {
    source: string;
    imports: ImportSpecifier[];
    isDefault: boolean;
    range: Range;
}
export interface ExportStatement {
    exports: ExportSpecifier[];
    isDefault: boolean;
    range: Range;
}
export interface Parameter {
    name: string;
    type?: string;
    defaultValue?: string;
}
export interface PropertyNode {
    name: string;
    type?: string;
    visibility: 'public' | 'private' | 'protected';
}
export interface ImportSpecifier {
    name: string;
    alias?: string;
}
export interface ExportSpecifier {
    name: string;
    alias?: string;
}
export interface Reference {
    location: Location;
    type: ReferenceType;
}
export interface Dependency {
    name: string;
    location: Location;
    type: DependencyType;
}
export interface ComplexityMetrics {
    cyclomatic: number;
    cognitive: number;
    halstead: HalsteadMetrics;
    maintainability: number;
    nesting: number;
}
export interface HalsteadMetrics {
    vocabulary: number;
    length: number;
    calculatedLength: number;
    volume: number;
    difficulty: number;
    effort: number;
    time: number;
    bugs: number;
}
export interface ASTQuery {
    pattern: string;
    language?: Language;
    captures?: string[];
    predicates?: QueryPredicate[];
}
export interface QueryPredicate {
    operator: string;
    operands: any[];
}
export interface TextChange {
    start: Position;
    end: Position;
    newText: string;
}
export declare enum Language {
    TypeScript = "typescript",
    JavaScript = "javascript",
    Python = "python",
    Go = "go",
    Rust = "rust",
    Java = "java",
    Cpp = "cpp"
}
export declare enum SymbolKind {
    File = 1,
    Module = 2,
    Namespace = 3,
    Package = 4,
    Class = 5,
    Method = 6,
    Property = 7,
    Field = 8,
    Constructor = 9,
    Enum = 10,
    Interface = 11,
    Function = 12,
    Variable = 13,
    Constant = 14,
    String = 15,
    Number = 16,
    Boolean = 17,
    Array = 18,
    Object = 19,
    Key = 20,
    Null = 21,
    EnumMember = 22,
    Struct = 23,
    Event = 24,
    Operator = 25,
    TypeParameter = 26
}
export declare enum SymbolTag {
    Deprecated = 1
}
export declare enum ReferenceType {
    Call = "call",
    Read = "read",
    Write = "write",
    Declaration = "declaration"
}
export declare enum DependencyType {
    Import = "import",
    Call = "call",
    Inheritance = "inheritance",
    Usage = "usage"
}
//# sourceMappingURL=ast.d.ts.map