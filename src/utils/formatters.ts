// src/utils/formatters.ts
import { SearchResult } from '../types/search';
import Table from 'cli-table3';

export function formatResultsPlain(results: SearchResult[]): string {
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

export function formatResultsJson(results: SearchResult[]): string {
  return JSON.stringify(
    {
      results,
      count: results.length,
      timestamp: new Date().toISOString(),
    },
    null,
    2
  );
}

export function formatResultsColor(results: SearchResult[]): string {
  if (results.length === 0) {
    return colorize('yellow', 'No results found.');
  }

  return results
    .map(result => {
      const { uri, range } = result.location;
      const header = `${colorize('cyan', uri)}:${colorize(
        'yellow',
        `${range.start.line + 1}:${range.start.character + 1}`
      )}`;
      const body = result.context?.length
        ? result.context.join('\n')
        : result.content.trim();
      return `${header}\n${colorize('gray', body)}`;
    })
    .join(`\n${colorize('dim', '---')}\n`);
}

export function formatResultsTable(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No results found.';
  }

  const table = new Table({
    head: ['File', 'Line', 'Context'],
    colWidths: [40, 10, 60],
    wordWrap: true,
  });

  results.forEach(result => {
    const { uri, range } = result.location;
    const ctx = result.context?.length
      ? result.context.join('\n')
      : result.content.trim();
    table.push([
      uri,
      `${range.start.line + 1}:${range.start.character + 1}`,
      ctx,
    ]);
  });

  return table.toString();
}

function colorize(
  color: 'cyan' | 'yellow' | 'gray' | 'dim',
  text: string
): string {
  const codes: Record<string, string> = {
    cyan: '\u001b[36m',
    yellow: '\u001b[33m',
    gray: '\u001b[90m',
    dim: '\u001b[2m',
  };
  const reset = '\u001b[0m';
  return `${codes[color] || ''}${text}${reset}`;
}
