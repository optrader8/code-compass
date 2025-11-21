"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// src/ui/App.tsx
const react_1 = require("react");
const ink_1 = require("ink");
const SearchInterface_1 = __importDefault(require("./SearchInterface"));
const LSPStatus_1 = __importDefault(require("./LSPStatus"));
const HelpScreen_1 = __importDefault(require("./HelpScreen"));
const App = () => {
    const { exit } = (0, ink_1.useApp)();
    const [state, setState] = (0, react_1.useState)({
        currentView: 'search',
        searchQuery: '',
        isSearching: false,
        searchResults: []
    });
    (0, ink_1.useInput)((input, key) => {
        if (key.ctrl && input === 'c') {
            exit();
        }
        if (input === 'h' && !state.isSearching) {
            setState(prev => ({
                ...prev,
                currentView: prev.currentView === 'help' ? 'search' : 'help'
            }));
        }
        if (input === 'l' && !state.isSearching) {
            setState(prev => ({
                ...prev,
                currentView: prev.currentView === 'lsp' ? 'search' : 'lsp'
            }));
        }
        if (key.escape && state.currentView !== 'search') {
            setState(prev => ({ ...prev, currentView: 'search' }));
        }
    });
    const handleSearch = async (query) => {
        setState(prev => ({ ...prev, isSearching: true, searchQuery: query }));
        try {
            // 실제 검색 로직은 CoreEngine을 통해 처리
            const { CoreEngine } = await Promise.resolve().then(() => __importStar(require('../core/engine')));
            // 검색 결과 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1000));
            setState(prev => ({
                ...prev,
                isSearching: false,
                searchResults: [
                    { file: 'src/index.ts', line: 10, content: 'Sample result 1' },
                    { file: 'src/core/engine.ts', line: 25, content: 'Sample result 2' }
                ]
            }));
        }
        catch (error) {
            setState(prev => ({ ...prev, isSearching: false }));
        }
    };
    const renderHeader = () => ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", marginBottom: 1, children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { borderStyle: "double", borderColor: "green", paddingX: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { bold: true, color: "green", children: "\uD83D\uDD0D Code Compass - Intelligent Code Search & Analysis" }) }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", justifyContent: "space-between", marginTop: 1, children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Version 0.1.0" }), (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", children: ["Press ", (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", children: "h" }), " for help,", ' ', (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", children: "l" }), " for LSP status,", ' ', (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", children: "Ctrl+C" }), " to exit"] })] })] }));
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", padding: 1, children: [renderHeader(), state.currentView === 'search' && ((0, jsx_runtime_1.jsx)(SearchInterface_1.default, { onSearch: handleSearch, isSearching: state.isSearching, searchResults: state.searchResults })), state.currentView === 'lsp' && (0, jsx_runtime_1.jsx)(LSPStatus_1.default, {}), state.currentView === 'help' && (0, jsx_runtime_1.jsx)(HelpScreen_1.default, {})] }));
};
exports.default = App;
//# sourceMappingURL=App.js.map