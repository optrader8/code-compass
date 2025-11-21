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
exports.runTextSearch = void 0;
// src/utils/ripgrep.ts
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const rg = __importStar(require("@vscode/ripgrep"));
const ast_1 = require("../types/ast");
const RG_PATH = rg.rgPath || rg.default?.rgPath || 'rg';
const LANGUAGE_MAP = {
    ts: ast_1.Language.TypeScript,
    js: ast_1.Language.JavaScript,
    jsx: ast_1.Language.JavaScript,
    tsx: ast_1.Language.TypeScript,
    py: ast_1.Language.Python,
    go: ast_1.Language.Go,
    rs: ast_1.Language.Rust,
    java: ast_1.Language.Java,
    cpp: ast_1.Language.Cpp,
    cxx: ast_1.Language.Cpp,
    cc: ast_1.Language.Cpp
};
async function runTextSearch(query, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
        const args = buildArgs(query);
        const proc = (0, child_process_1.spawn)(RG_PATH, args, { cwd });
        const results = [];
        let buffer = '';
        proc.stdout.on('data', (data) => {
            buffer += data.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (!line.trim())
                    continue;
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.type === 'match') {
                        const result = mapMatchToResult(parsed, query, cwd);
                        results.push(result);
                    }
                    if (query.options?.maxResults && results.length >= query.options.maxResults) {
                        proc.kill();
                        resolve(results.slice(0, query.options.maxResults));
                        return;
                    }
                }
                catch (error) {
                    console.warn('Failed to parse ripgrep output line', error);
                }
            }
        });
        proc.stderr.on('data', (data) => {
            const text = data.toString();
            if (text.toLowerCase().includes('error')) {
                console.error('rg error:', text);
            }
        });
        proc.on('close', code => {
            if (code !== 0 && code !== 1) {
                reject(new Error(`ripgrep exited with code ${code}`));
            }
            else {
                resolve(results);
            }
        });
    });
}
exports.runTextSearch = runTextSearch;
function buildArgs(query) {
    const args = ['--json', '--follow', '--line-number', '--column', '--no-config'];
    if (query.options?.contextLines && query.options.contextLines > 0) {
        args.push('--context', String(query.options.contextLines));
    }
    if (query.options?.caseSensitive === false) {
        args.push('-i');
    }
    if (query.options?.regex === false) {
        args.push('--fixed-strings');
    }
    if (query.filePattern) {
        args.push('-g', query.filePattern);
    }
    args.push(query.pattern, '.');
    return args;
}
function mapMatchToResult(match, query, cwd) {
    const filePath = path_1.default.resolve(cwd, match?.data?.path?.text ?? '');
    const content = match?.data?.lines?.text ?? '';
    const startLine = Math.max(0, (match?.data?.line_number ?? 1) - 1);
    const startChar = match?.data?.submatches?.[0]?.start?.column ?? 0;
    const endChar = match?.data?.submatches?.[0]?.end?.column ?? startChar;
    const range = {
        start: { line: startLine, character: startChar },
        end: { line: startLine, character: endChar }
    };
    const ext = path_1.default.extname(filePath).replace('.', '').toLowerCase();
    const language = query.language || LANGUAGE_MAP[ext] || ast_1.Language.JavaScript;
    let lastModified = new Date();
    try {
        const stat = fs_1.default.statSync(filePath);
        lastModified = stat.mtime;
    }
    catch {
        // ignore
    }
    const context = query.options?.includeContext === false || !query.options?.contextLines
        ? []
        : getContextLines(filePath, startLine, query.options.contextLines);
    return {
        location: {
            uri: `file://${filePath}`,
            range
        },
        content: content.trim(),
        context,
        score: 1,
        metadata: {
            fileType: ext,
            language,
            symbolType: undefined,
            complexity: undefined,
            lastModified
        }
    };
}
function getContextLines(filePath, matchLine, contextLines) {
    if (contextLines <= 0)
        return [];
    try {
        const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split(/\r?\n/);
        const start = Math.max(0, matchLine - contextLines);
        const end = Math.min(lines.length, matchLine + contextLines + 1);
        return lines.slice(start, end);
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=ripgrep.js.map