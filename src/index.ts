#!/usr/bin/env node

import { Command } from 'commander';
import { startLSPServer } from './lsp-server';
import { initializeConfig } from './utils/config';
import { CacheSystem } from './utils/cache';
import { ASTParser } from './parsers/registry';
import { CodeAnalyzer } from './core/analyzer';
import { CoreEngine } from './core/engine';
import { SearchQuery, SearchType } from './types/search';
import { Language } from './types/ast';

const program = new Command();
const config = initializeConfig();
const cacheSystem = new CacheSystem({ max: 1000, ttl: config.cache.ttl });
const astParser = new ASTParser(cacheSystem);
const codeAnalyzer = new CodeAnalyzer(cacheSystem);
const coreEngine = new CoreEngine(astParser, codeAnalyzer, cacheSystem);

program
  .name('code-compass')
  .description('Advanced code search and analysis tool')
  .version('0.1.0');

program
  .command('lsp')
  .description('Start the Language Server Protocol server')
  .option('--stdio', 'Use stdio for communication')
  .option('--port <port>', 'Port to listen on', '7777')
  .option('--host <host>', 'Host to bind to', '127.0.0.1')
  .action(async options => {
    console.log(
      `Starting Code Compass LSP server on ${options.host}:${options.port}`
    );

    try {
      await startLSPServer({
        stdio: options.stdio,
        port: parseInt(options.port),
        host: options.host,
      });
    } catch (error) {
      console.error('Failed to start LSP server:', error);
      process.exit(1);
    }
  });

program
  .command('search')
  .description('Search for patterns in code')
  .argument('<pattern>', 'Search pattern')
  .option('-t, --type <type>', 'Search type (text, function, class, etc.)')
  .option('-f, --file <pattern>', 'File pattern to search in')
  .option('-l, --language <language>', 'Language to search in')
  .option('-c, --context <lines>', 'Number of context lines', '3')
  .option('--json', 'Output in JSON format')
  .action(async (pattern, options) => {
    const contextLines = parseInt(options.context, 10);
    const language = resolveLanguage(options.language);

    const query: SearchQuery = {
      pattern,
      type: (options.type as SearchType) || SearchType.Text,
      filePattern: options.file,
      language,
      options: {
        contextLines: Number.isNaN(contextLines) ? 3 : contextLines,
        includeContext: true,
        regex: true,
        caseSensitive: false,
        maxResults: undefined,
      },
    };

    const results = await coreEngine.search(query);
    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      for (const result of results) {
        const { uri, range } = result.location;
        console.log(
          `${uri}:${range.start.line + 1}:${range.start.character + 1}`
        );
        console.log(result.content.trim());
        console.log('---');
      }
    }
  });

program
  .command('analyze')
  .description('Analyze code complexity and metrics')
  .argument('<path>', 'Path to analyze')
  .option('-r, --recursive', 'Analyze recursively')
  .option('--metrics', 'Show code metrics')
  .option('--complexity', 'Show complexity analysis')
  .option('--dependencies', 'Show dependency analysis')
  .action(async (path, options) => {
    const analysis = await coreEngine.analyze(path);
    console.log(`Analyzed: ${path}`);
    console.log(JSON.stringify(analysis, null, 2));
  });

program.parse();

function resolveLanguage(input?: string): Language | undefined {
  if (!input) return undefined;
  const normalized = input.toLowerCase();
  return (Object.values(Language) as string[]).includes(normalized)
    ? (normalized as Language)
    : undefined;
}
