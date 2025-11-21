"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseParser = void 0;
// src/parsers/base.ts
const ast_1 = require("../types/ast");
class BaseParser {
    async updateAST(ast, changes) {
        // Default implementation - re-parse the entire file
        // Subclasses can override to implement incremental parsing
        return this.parse(ast.content);
    }
    detectLanguageFromPath(filePath) {
        const ext = filePath.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'ts':
                return ast_1.Language.TypeScript;
            case 'js':
            case 'jsx':
                return ast_1.Language.JavaScript;
            case 'py':
                return ast_1.Language.Python;
            case 'go':
                return ast_1.Language.Go;
            case 'rs':
                return ast_1.Language.Rust;
            case 'java':
                return ast_1.Language.Java;
            case 'cpp':
            case 'cxx':
            case 'cc':
            case 'c++':
                return ast_1.Language.Cpp;
            default:
                return null;
        }
    }
}
exports.BaseParser = BaseParser;
//# sourceMappingURL=base.js.map