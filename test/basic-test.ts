// test/basic-test.ts
import { CoreEngine } from '../src/core/engine';
import { ASTParser } from '../src/parsers/registry';
import { CodeAnalyzer } from '../src/core/analyzer';
import { CacheSystem } from '../src/utils/cache';
import { SearchQuery, SearchType } from '../src/types/search';

async function runBasicTest() {
  console.log('Starting basic functionality test...');
  
  try {
    // Initialize core components
    const cacheSystem = new CacheSystem();
    const astParser = new ASTParser(cacheSystem);
    const codeAnalyzer = new CodeAnalyzer(cacheSystem);
    const coreEngine = new CoreEngine(astParser, codeAnalyzer, cacheSystem);
    
    console.log('✓ Core components initialized');
    
    // Test 1: Parse a simple file
    console.log('\nTest 1: Parsing functionality');
    try {
      // Create a temporary test file
      const fs = await import('fs');
      const testCode = `
        function helloWorld(name: string): string {
          return "Hello, " + name + "!";
        }
        
        class Greeter {
          constructor(private greeting: string) {}
          
          public greet(): string {
            return this.greeting;
          }
        }
      `;
      
      const testFilePath = '/tmp/test-file.ts';
      await fs.promises.writeFile(testFilePath, testCode, 'utf-8');
      
      const parsedAst = await coreEngine.parseFile(testFilePath);
      console.log('✓ File parsed successfully');
      console.log(`  - Language detected: ${parsedAst.language}`);
      console.log(`  - Functions found: ${parsedAst.functions?.length || 0}`);
      console.log(`  - Classes found: ${parsedAst.classes?.length || 0}`);
      console.log(`  - Imports found: ${parsedAst.imports?.length || 0}`);
      
      // Clean up
      await fs.promises.unlink(testFilePath);
    } catch (error) {
      console.error('✗ Parse test failed:', error);
    }
    
    // Test 2: Search functionality
    console.log('\nTest 2: Search functionality');
    try {
      const query: SearchQuery = {
        pattern: 'helloWorld',
        type: SearchType.Function,
        filePattern: '**/*.ts',
        language: undefined,
        options: {
          caseSensitive: true,
          regex: false,
          contextLines: 2,
          maxResults: 10,
          includeContext: true
        }
      };
      
      const results = await coreEngine.search(query);
      console.log('✓ Search completed');
      console.log(`  - Results found: ${results.length}`);
      
      if (results.length > 0) {
        console.log(`  - First result URI: ${results[0].location.uri}`);
        console.log(`  - First result range: ${results[0].location.range.start.line}-${results[0].location.range.end.line}`);
      }
    } catch (error) {
      console.error('✗ Search test failed:', error);
    }
    
    // Test 3: Analysis functionality
    console.log('\nTest 3: Analysis functionality');
    try {
      // We'll test analysis on the same temporary file
      const fs = await import('fs');
      const testCode = `
        function complexFunction(x: number, y: number): number {
          if (x > 10) {
            for (let i = 0; i < y; i++) {
              if (i % 2 === 0) {
                return x * i;
              }
            }
          }
          return x + y;
        }
      `;
      
      const testFilePath = '/tmp/test-complex-file.ts';
      await fs.promises.writeFile(testFilePath, testCode, 'utf-8');
      
      const analysis = await coreEngine.analyze(testFilePath);
      console.log('✓ Analysis completed');
      console.log(`  - Lines of code: ${analysis.metrics?.linesOfCode}`);
      console.log(`  - Cyclomatic complexity: ${analysis.complexity?.cyclomatic}`);
      console.log(`  - Cognitive complexity: ${analysis.complexity?.cognitive}`);
      console.log(`  - Function count: ${analysis.metrics?.functionCount}`);
      
      // Clean up
      await fs.promises.unlink(testFilePath);
    } catch (error) {
      console.error('✗ Analysis test failed:', error);
    }
    
    console.log('\n✓ All basic functionality tests completed');
    
  } catch (error) {
    console.error('✗ Basic functionality test suite failed:', error);
  }
}

// Run the test
if (require.main === module) {
  runBasicTest().catch(console.error);
}

export { runBasicTest };