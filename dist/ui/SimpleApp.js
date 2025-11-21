"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// src/ui/SimpleApp.tsx
const react_1 = require("react");
const ink_1 = require("ink");
const SimpleApp = () => {
    const { exit } = (0, ink_1.useApp)();
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [isSearching, setIsSearching] = (0, react_1.useState)(false);
    const [results, setResults] = (0, react_1.useState)([]);
    (0, ink_1.useInput)((input, key) => {
        if (key.ctrl && input === 'c') {
            exit();
        }
        if (key.return && searchQuery.trim() && !isSearching) {
            setIsSearching(true);
            // Simulate search
            setTimeout(() => {
                setResults([
                    `Result 1 for "${searchQuery}"`,
                    `Result 2 for "${searchQuery}"`,
                    `Result 3 for "${searchQuery}"`
                ]);
                setIsSearching(false);
            }, 1000);
        }
        if (key.backspaceOrDelete) {
            setSearchQuery(prev => prev.slice(0, -1));
        }
        if (input && !key.ctrl && !key.return && !key.backspaceOrDelete) {
            setSearchQuery(prev => prev + input);
        }
    });
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", padding: 1, children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { borderStyle: "double", borderColor: "green", paddingX: 1, marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { bold: true, color: "green", children: "\uD83D\uDD0D Code Compass - Interactive Search" }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Type to search, Enter to execute, Ctrl+C to exit" }) }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", marginBottom: 1, children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "green", children: "\u276F " }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "white", children: searchQuery }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "_" })] }), isSearching && ((0, jsx_runtime_1.jsx)(ink_1.Box, { children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: "\uD83D\uDD0D Searching..." }) })), results.length > 0 && !isSearching && ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { bold: true, color: "blue", children: ["Found ", results.length, " results:"] }), results.map((result, index) => ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", marginBottom: 1, children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "cyan", children: [index + 1, "."] }), (0, jsx_runtime_1.jsxs)(ink_1.Text, { children: [" ", result] })] }, index)))] })), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginTop: 1, children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "gray", dim: true, children: ["Commands: search \"pattern\" | analyze ", "<path>", " | lsp"] }) })] }));
};
exports.default = SimpleApp;
//# sourceMappingURL=SimpleApp.js.map