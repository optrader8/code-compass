"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// src/ui/SearchInterface.tsx
const react_1 = require("react");
const ink_1 = require("ink");
const SearchInterface = ({ onSearch, isSearching, searchResults }) => {
    const [query, setQuery] = (0, react_1.useState)('');
    const [selectedResult, setSelectedResult] = (0, react_1.useState)(0);
    const [searchType, setSearchType] = (0, react_1.useState)('text');
    (0, ink_1.useInput)((input, key) => {
        if (key.return && query.trim() && !isSearching) {
            onSearch(query.trim());
        }
        if (key.tab) {
            const types = ['text', 'function', 'class'];
            const currentIndex = types.indexOf(searchType);
            const nextIndex = (currentIndex + 1) % types.length;
            setSearchType(types[nextIndex]);
        }
        if (key.upArrow && searchResults.length > 0) {
            setSelectedResult(prev => Math.max(0, prev - 1));
        }
        if (key.downArrow && searchResults.length > 0) {
            setSelectedResult(prev => Math.min(searchResults.length - 1, prev + 1));
        }
        if (input === 'c' && key.ctrl) {
            setQuery('');
            setSelectedResult(0);
        }
    });
    const renderSearchType = () => ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", marginBottom: 1, children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "Type: " }), ['text', 'function', 'class'].map(type => ((0, jsx_runtime_1.jsx)(ink_1.Box, { children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: searchType === type ? 'green' : 'gray', bold: searchType === type, children: searchType === type ? `[${type}]` : ` ${type} ` }) }, type))), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: " (Tab to switch)" })] }));
    const renderResults = () => {
        if (isSearching) {
            return ((0, jsx_runtime_1.jsx)(ink_1.Box, { children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: "\uD83D\uDD0D Searching..." }) }));
        }
        if (searchResults.length === 0 && query) {
            return ((0, jsx_runtime_1.jsx)(ink_1.Box, { children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "red", children: ["No results found for \"", query, "\""] }) }));
        }
        if (searchResults.length > 0) {
            return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", marginTop: 1, children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { bold: true, color: "blue", children: ["Found ", searchResults.length, " results:"] }), searchResults.map((result, index) => ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", borderStyle: selectedResult === index ? 'single' : undefined, borderColor: selectedResult === index ? 'blue' : undefined, paddingX: 1, marginTop: 1, children: [(0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsxs)(ink_1.Text, { color: "cyan", children: [result.file, ":", result.line] }), selectedResult === index && ((0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: " \u2190 Selected" }))] }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: result.content })] }, index))), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginTop: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Use \u2191\u2193 to navigate, Enter to view details" }) })] }));
        }
        return null;
    };
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [renderSearchType(), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", marginBottom: 1, children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "green", children: "\u276F " }), (0, jsx_runtime_1.jsx)(ink_1.TextInput, { value: query, onChange: setQuery, placeholder: `Enter ${searchType} search query...`, focus: !isSearching })] }), (0, jsx_runtime_1.jsx)(ink_1.Box, { flexDirection: "row", marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Press Enter to search, Tab to change type, Ctrl+C to clear" }) }), renderResults()] }));
};
exports.default = SearchInterface;
//# sourceMappingURL=SearchInterface.js.map