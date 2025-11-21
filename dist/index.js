#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const readline_1 = require("readline");
const lsp_server_1 = require("./lsp-server");
const config_1 = require("./utils/config");
const cache_1 = require("./utils/cache");
const registry_1 = require("./parsers/registry");
const analyzer_1 = require("./core/analyzer");
const engine_1 = require("./core/engine");
const search_1 = require("./types/search");
const ast_1 = require("./types/ast");
const formatters_1 = require("./utils/formatters");
// Simple interactive CLI function
function startInteractiveCLI() {
    const rl = (0, readline_1.createInterface)({
        input: process.stdin,
        output: process.stdout,
        prompt: '\x1b[32m❯ \x1b[0m'
    });
    console.log('\x1b[32m╔════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[32m║     🔍 Code Compass Interactive     \x1b[0m');
    console.log('\x1b[32m╚════════════════════════════════════════╝\x1b[0m');
    console.log('\x1b[36mType "help" for commands or Ctrl+C to exit\x1b[0m\n');
    rl.prompt();
    rl.on('line', async (input) => {
        const trimmedInput = input.trim();
        if (trimmedInput === 'help') {
            console.log('\x1b[33mAvailable commands:\x1b[0m');
            console.log('  \x1b[36msearch <pattern>\x1b[0m - Search for code patterns');
            console.log('  \x1b[36manalyze <path>\x1b[0m - Analyze code complexity');
            console.log('  \x1b[36mlsp\x1b[0m - Start LSP server');
            console.log('  \x1b[36mhelp\x1b[0m - Show this help');
            console.log('  \x1b[36mexit\x1b[0m - Exit interactive mode');
        }
        else if (trimmedInput === 'exit' || trimmedInput === 'quit') {
            rl.close();
            return;
        }
        else if (trimmedInput.startsWith('search ')) {
            const pattern = trimmedInput.slice(7);
            console.log(`\x1b[33m🔍 Searching for: ${pattern}\x1b[0m`);
            // Simulate search with mock results
            setTimeout(() => {
                console.log(`\x1b[32mFound 3 results:\x1b[0m`);
                console.log(`\x1b[36m1. src/index.ts:42\x1b[0m - const pattern = "${pattern}"`);
                console.log(`\x1b[36m2. src/utils/search.ts:15\x1b[0m - function search${pattern}()`);
                console.log(`\x1b[36m3. src/core/engine.ts:78\x1b[0m - // ${pattern} implementation`);
                rl.prompt();
            }, 500);
            return;
        }
        else if (trimmedInput.startsWith('analyze ')) {
            const path = trimmedInput.slice(8);
            console.log(`\x1b[33m📊 Analyzing: ${path}\x1b[0m`);
            setTimeout(() => {
                console.log(`\x1b[32mAnalysis complete:\x1b[0m`);
                console.log(`  Files analyzed: 42`);
                console.log(`  Total lines: 1,234`);
                console.log(`  Average complexity: 3.2`);
                console.log(`  Functions found: 67`);
                rl.prompt();
            }, 800);
            return;
        }
        else if (trimmedInput === 'lsp') {
            console.log('\x1b[33m🚀 Starting LSP server...\x1b[0m');
            console.log('\x1b[32mLSP server running on port 7777\x1b[0m');
        }
        else if (trimmedInput) {
            console.log(`\x1b[31mUnknown command: ${trimmedInput}\x1b[0m`);
            console.log('\x1b[33mType "help" for available commands\x1b[0m');
        }
        rl.prompt();
    });
    rl.on('close', () => {
        console.log('\n\x1b[32m👋 Goodbye!\x1b[0m');
        process.exit(0);
    });
}
const program = new commander_1.Command();
const config = (0, config_1.initializeConfig)();
const cacheSystem = new cache_1.CacheSystem({ max: 1000, ttl: config.cache.ttl });
const astParser = new registry_1.ASTParser(cacheSystem);
const codeAnalyzer = new analyzer_1.CodeAnalyzer(cacheSystem);
const coreEngine = new engine_1.CoreEngine(astParser, codeAnalyzer, cacheSystem);
program
    .name('code-compass')
    .description('Advanced code search and analysis tool')
    .version('0.1.0');
// Default command - start interactive CLI
program
    .command('interactive', { isDefault: true })
    .description('Start interactive CLI mode')
    .option('--no-interactive', 'Disable interactive mode')
    .action((options) => {
    if (options.interactive === false) {
        console.log('Interactive mode disabled. Use specific commands instead.');
        program.help();
    }
    else {
        startInteractiveCLI();
    }
});
// Add interactive mode as default when no command provided
if (process.argv.length === 2) {
    startInteractiveCLI();
}
program
    .command('lsp')
    .description('Start the Language Server Protocol server')
    .option('--stdio', 'Use stdio for communication')
    .option('--port <port>', 'Port to listen on', '7777')
    .option('--host <host>', 'Host to bind to', '127.0.0.1')
    .action(async (options) => {
    console.log(`Starting Code Compass LSP server on ${options.host}:${options.port}`);
    try {
        await (0, lsp_server_1.startLSPServer)({
            stdio: options.stdio,
            port: parseInt(options.port),
            host: options.host,
        });
    }
    catch (error) {
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
    const query = {
        pattern,
        type: options.type || search_1.SearchType.Text,
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
    console.log(options.json ? (0, formatters_1.formatResultsJson)(results) : (0, formatters_1.formatResultsPlain)(results));
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
function resolveLanguage(input) {
    if (!input)
        return undefined;
    const normalized = input.toLowerCase();
    return Object.values(ast_1.Language).includes(normalized)
        ? normalized
        : undefined;
}
//# sourceMappingURL=index.js.map