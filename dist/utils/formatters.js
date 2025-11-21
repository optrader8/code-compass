"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatResultsTable = exports.formatResultsJson = exports.formatResultsPlain = void 0;
function formatResultsPlain(results) {
    if (results.length === 0) {
        return 'No results found.';
    }
    return results
        .map(result => {
        const { uri, range } = result.location;
        const header = `${uri}:${range.start.line + 1}:${range.start.character + 1}`;
        const context = result.context?.length
            ? result.context.join('\n')
            : result.content.trim();
        return `${header}\n${context}`;
    })
        .join('\n---\n');
}
exports.formatResultsPlain = formatResultsPlain;
function formatResultsJson(results) {
    return JSON.stringify({
        results,
        count: results.length,
        timestamp: new Date().toISOString()
    }, null, 2);
}
exports.formatResultsJson = formatResultsJson;
function formatResultsTable(results) {
    if (results.length === 0) {
        return 'No results found.';
    }
    // Simple table formatting
    const maxFileLength = Math.max(...results.map(r => r.location.uri.length));
    const maxContentLength = Math.max(...results.map(r => r.content.length), 40);
    let output = '';
    // Header
    output += 'File'.padEnd(maxFileLength) + '  ';
    output += 'Line'.padEnd(6) + '  ';
    output += 'Content'.padEnd(maxContentLength) + '\n';
    output += '-'.repeat(maxFileLength) + '  ';
    output += '-'.repeat(6) + '  ';
    output += '-'.repeat(maxContentLength) + '\n';
    // Rows
    results.forEach((result, index) => {
        const { uri, range } = result.location;
        const filePath = uri.replace('file://', '').slice(-maxFileLength);
        const lineNum = (range.start.line + 1).toString();
        const content = result.content.slice(0, maxContentLength - 3) + '...';
        output += filePath.padEnd(maxFileLength) + '  ';
        output += lineNum.padEnd(6) + '  ';
        output += content + '\n';
    });
    return output;
}
exports.formatResultsTable = formatResultsTable;
//# sourceMappingURL=formatters.js.map