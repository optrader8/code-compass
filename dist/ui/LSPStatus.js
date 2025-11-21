"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// src/ui/LSPStatus.tsx
const react_1 = require("react");
const ink_1 = require("ink");
const LSPStatus = () => {
    const [serverStatus, setServerStatus] = (0, react_1.useState)('stopped');
    const [connections, setConnections] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        // LSP 서버 상태 시뮬레이션
        const timer = setTimeout(() => {
            setServerStatus('running');
            setConnections(2);
        }, 2000);
        setServerStatus('starting');
        return () => clearTimeout(timer);
    }, []);
    const getStatusColor = () => {
        switch (serverStatus) {
            case 'running': return 'green';
            case 'starting': return 'yellow';
            case 'stopped': return 'red';
            default: return 'gray';
        }
    };
    const getStatusIcon = () => {
        switch (serverStatus) {
            case 'running': return '✅';
            case 'starting': return '⏳';
            case 'stopped': return '❌';
            default: return '❓';
        }
    };
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Box, { borderStyle: "single", borderColor: "blue", padding: 1, marginBottom: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { bold: true, color: "blue", children: "Language Server Protocol Status" }) }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", marginBottom: 1, children: [(0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "Server Status: " }), (0, jsx_runtime_1.jsxs)(ink_1.Text, { color: getStatusColor(), bold: true, children: [getStatusIcon(), " ", serverStatus.toUpperCase()] })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "Port: " }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", children: "7777" })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "Active Connections: " }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "green", children: connections })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "Protocol Version: " }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "3.17.0" })] })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", marginBottom: 1, children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { bold: true, color: "blue", children: "Supported Features:" }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "  \u2022 Text Document Sync" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "green", children: " \u2713" })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "  \u2022 Hover" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "green", children: " \u2713" })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "  \u2022 Go to Definition" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "green", children: " \u2713" })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "  \u2022 Find References" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "green", children: " \u2713" })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "  \u2022 Document Symbols" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "green", children: " \u2713" })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "  \u2022 Workspace Symbols" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "green", children: " \u2713" })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "  \u2022 Code Metrics" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: " (Experimental)" })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "row", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { children: "  \u2022 Semantic Search" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: " (Experimental)" })] })] }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { bold: true, color: "blue", children: "LSP Commands:" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Start server: npx code-compass lsp --port 7777" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Start with stdio: npx code-compass lsp --stdio" })] }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginTop: 1, children: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "Press ESC to return to search" }) })] }));
};
exports.default = LSPStatus;
//# sourceMappingURL=LSPStatus.js.map