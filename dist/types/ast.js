"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyType = exports.ReferenceType = exports.SymbolTag = exports.SymbolKind = exports.Language = void 0;
var Language;
(function (Language) {
    Language["TypeScript"] = "typescript";
    Language["JavaScript"] = "javascript";
    Language["Python"] = "python";
    Language["Go"] = "go";
    Language["Rust"] = "rust";
    Language["Java"] = "java";
    Language["Cpp"] = "cpp";
})(Language = exports.Language || (exports.Language = {}));
var SymbolKind;
(function (SymbolKind) {
    SymbolKind[SymbolKind["File"] = 1] = "File";
    SymbolKind[SymbolKind["Module"] = 2] = "Module";
    SymbolKind[SymbolKind["Namespace"] = 3] = "Namespace";
    SymbolKind[SymbolKind["Package"] = 4] = "Package";
    SymbolKind[SymbolKind["Class"] = 5] = "Class";
    SymbolKind[SymbolKind["Method"] = 6] = "Method";
    SymbolKind[SymbolKind["Property"] = 7] = "Property";
    SymbolKind[SymbolKind["Field"] = 8] = "Field";
    SymbolKind[SymbolKind["Constructor"] = 9] = "Constructor";
    SymbolKind[SymbolKind["Enum"] = 10] = "Enum";
    SymbolKind[SymbolKind["Interface"] = 11] = "Interface";
    SymbolKind[SymbolKind["Function"] = 12] = "Function";
    SymbolKind[SymbolKind["Variable"] = 13] = "Variable";
    SymbolKind[SymbolKind["Constant"] = 14] = "Constant";
    SymbolKind[SymbolKind["String"] = 15] = "String";
    SymbolKind[SymbolKind["Number"] = 16] = "Number";
    SymbolKind[SymbolKind["Boolean"] = 17] = "Boolean";
    SymbolKind[SymbolKind["Array"] = 18] = "Array";
    SymbolKind[SymbolKind["Object"] = 19] = "Object";
    SymbolKind[SymbolKind["Key"] = 20] = "Key";
    SymbolKind[SymbolKind["Null"] = 21] = "Null";
    SymbolKind[SymbolKind["EnumMember"] = 22] = "EnumMember";
    SymbolKind[SymbolKind["Struct"] = 23] = "Struct";
    SymbolKind[SymbolKind["Event"] = 24] = "Event";
    SymbolKind[SymbolKind["Operator"] = 25] = "Operator";
    SymbolKind[SymbolKind["TypeParameter"] = 26] = "TypeParameter";
})(SymbolKind = exports.SymbolKind || (exports.SymbolKind = {}));
var SymbolTag;
(function (SymbolTag) {
    SymbolTag[SymbolTag["Deprecated"] = 1] = "Deprecated";
})(SymbolTag = exports.SymbolTag || (exports.SymbolTag = {}));
var ReferenceType;
(function (ReferenceType) {
    ReferenceType["Call"] = "call";
    ReferenceType["Read"] = "read";
    ReferenceType["Write"] = "write";
    ReferenceType["Declaration"] = "declaration";
})(ReferenceType = exports.ReferenceType || (exports.ReferenceType = {}));
var DependencyType;
(function (DependencyType) {
    DependencyType["Import"] = "import";
    DependencyType["Call"] = "call";
    DependencyType["Inheritance"] = "inheritance";
    DependencyType["Usage"] = "usage";
})(DependencyType = exports.DependencyType || (exports.DependencyType = {}));
//# sourceMappingURL=ast.js.map