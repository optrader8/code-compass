// src/utils/ripgrep.ts
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import * as rg from '@vscode/ripgrep';
import { SearchQuery, SearchResult } from '../types/search';
import { Language, Range } from '../types/ast';

const RG_PATH = (rg as any).rgPath || (rg as any).default?.rgPath || 'rg';

const LANGUAGE_MAP: Record<string, Language> = {
  ts: Language.TypeScript,
  js: Language.JavaScript,
  jsx: Language.JavaScript,
  tsx: Language.TypeScript,
  py: Language.Python,
  go: Language.Go,
  rs: Language.Rust,
  java: Language.Java,
  cpp: Language.Cpp,
  cxx: Language.Cpp,
  cc: Language.Cpp,
};

export async function runTextSearch(
  query: SearchQuery,
  cwd: string = process.cwd()
): Promise<SearchResult[]> {
  return new Promise((resolve, reject) => {
    const args = buildArgs(query);
    const proc = spawn(RG_PATH, args, { cwd });
    const results: SearchResult[] = [];
    let buffer = '';

    proc.stdout.on('data', (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === 'match') {
            const result = mapMatchToResult(parsed, query, cwd);
            results.push(result);
          }
          if (
            query.options?.maxResults &&
            results.length >= query.options.maxResults
          ) {
            proc.kill();
            resolve(results.slice(0, query.options.maxResults));
            return;
          }
        } catch (error) {
          console.warn('Failed to parse ripgrep output line', error);
        }
      }
    });

    proc.stderr.on('data', (data: Buffer) => {
      const text = data.toString();
      if (text.toLowerCase().includes('error')) {
        console.error('rg error:', text);
      }
    });

    proc.on('close', code => {
      if (code !== 0 && code !== 1) {
        reject(new Error(`ripgrep exited with code ${code}`));
      } else {
        resolve(results);
      }
    });
  });
}

function buildArgs(query: SearchQuery): string[] {
  const args = [
    '--json',
    '--follow',
    '--line-number',
    '--column',
    '--no-config',
  ];

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

  if (query.options?.exclude && query.options.exclude.length) {
    for (const pattern of query.options.exclude) {
      args.push('--glob', `!${pattern}`);
    }
  }

  args.push(query.pattern, '.');
  return args;
}

function mapMatchToResult(
  match: any,
  query: SearchQuery,
  cwd: string
): SearchResult {
  const filePath = path.resolve(cwd, match?.data?.path?.text ?? '');
  const content = match?.data?.lines?.text ?? '';
  const startLine = Math.max(0, (match?.data?.line_number ?? 1) - 1);
  const startChar = match?.data?.submatches?.[0]?.start?.column ?? 0;
  const endChar = match?.data?.submatches?.[0]?.end?.column ?? startChar;

  const range: Range = {
    start: { line: startLine, character: startChar },
    end: { line: startLine, character: endChar },
  };

  const ext = path.extname(filePath).replace('.', '').toLowerCase();
  const language = query.language || LANGUAGE_MAP[ext] || Language.JavaScript;

  let lastModified = new Date();
  try {
    const stat = fs.statSync(filePath);
    lastModified = stat.mtime;
  } catch {
    // ignore
  }

  const context =
    query.options?.includeContext === false || !query.options?.contextLines
      ? []
      : getContextLines(filePath, startLine, query.options.contextLines);

  return {
    location: {
      uri: `file://${filePath}`, // Ensure proper URI format
      range,
    },
    content: content.trim(),
    context,
    score: 1,
    metadata: {
      fileType: ext,
      language,
      symbolType: undefined,
      complexity: undefined,
      lastModified,
    },
  };
}

function getContextLines(
  filePath: string,
  matchLine: number,
  contextLines: number
): string[] {
  if (contextLines <= 0) return [];

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split(/\r?\n/);

    const start = Math.max(0, matchLine - contextLines);
    const end = Math.min(lines.length, matchLine + contextLines + 1);
    return lines.slice(start, end);
  } catch {
    return [];
  }
}
