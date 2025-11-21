# IDEA.advanced.md

## 고급 기능 설계: LSP & AST 통합

Code Compass를 단순 검색 도구를 넘어 **통합 코드 인텔리전스 플랫폼**으로 발전시키기 위한 고급 기능 설계 문서입니다.

---

## 목차
1. [LSP (Language Server Protocol) 통합](#lsp-통합)
2. [고급 AST 분석](#고급-ast-분석)
3. [시맨틱 코드 이해](#시맨틱-코드-이해)
4. [리팩토링 엔진](#리팩토링-엔진)
5. [코드 품질 분석](#코드-품질-분석)
6. [통합 아키텍처](#통합-아키텍처)

---

## 1. LSP (Language Server Protocol) 통합

### 1.1 개요
Code Compass를 LSP 서버로 구현하여 모든 LSP 클라이언트(VSCode, Vim, Emacs 등)에서 사용 가능하게 만듭니다.

### 1.2 핵심 기능

#### 1.2.1 표준 LSP 기능
```typescript
// 구현할 LSP 기능 목록
interface CodeCompassLSP {
  // 기본 기능
  textDocument: {
    hover: HoverProvider;              // 심볼 위에 호버 시 정보 표시
    definition: DefinitionProvider;    // Go to Definition
    references: ReferencesProvider;    // Find All References
    rename: RenameProvider;            // 심볼 이름 변경
    documentSymbol: SymbolProvider;    // 문서 아웃라인
    workspaceSymbol: SymbolProvider;   // 워크스페이스 전체 심볼 검색
    completion: CompletionProvider;    // 자동완성
    signatureHelp: SignatureProvider;  // 함수 시그니처 힌트
  };
  
  // 코드 분석
  codeAction: CodeActionProvider;      // Quick Fix, Refactoring
  codeLens: CodeLensProvider;          // 인라인 정보 (참조 수, 복잡도 등)
  formatting: FormattingProvider;      // 코드 포맷팅
  
  // 진단
  publishDiagnostics: DiagnosticsProvider; // 에러/경고 표시
}
```

#### 1.2.2 커스텀 LSP 확장
```typescript
// Code Compass 전용 확장 기능
interface CodeCompassExtensions {
  // 코드 메트릭 표시
  'codeCompass/metrics': {
    complexity: number;
    maintainability: number;
    testCoverage: number;
  };
  
  // 의존성 그래프
  'codeCompass/dependencies': {
    imports: DependencyNode[];
    exports: DependencyNode[];
    callGraph: CallGraphNode[];
  };
  
  // AI 기반 제안
  'codeCompass/suggestions': {
    refactorings: RefactoringSuggestion[];
    codeSmells: CodeSmell[];
    securityIssues: SecurityIssue[];
  };
  
  // 시맨틱 검색
  'codeCompass/semanticSearch': {
    query: string;
    results: SemanticSearchResult[];
  };
}
```

### 1.3 사용 예시

#### VSCode에서 사용
```typescript
// .vscode/settings.json
{
  "codeCompass.lsp.enable": true,
  "codeCompass.features": {
    "hover": true,
    "definition": true,
    "references": true,
    "codeMetrics": true,
    "semanticSearch": true
  }
}
```

#### Neovim에서 사용
```lua
-- nvim/init.lua
local lspconfig = require('lspconfig')
lspconfig.code_compass.setup({
  cmd = { 'code-compass', 'lsp' },
  filetypes = { 'typescript', 'javascript', 'python', 'go' },
  root_dir = lspconfig.util.root_pattern('.git', 'package.json'),
})
```

### 1.4 LSP 서버 실행
```bash
# Stdio 모드 (에디터와 통신)
$ code-compass lsp --stdio

# TCP 모드 (원격 개발)
$ code-compass lsp --port 7777

# 디버그 모드
$ code-compass lsp --stdio --log-level debug
```

---

## 2. 고급 AST 분석

### 2.1 멀티 언어 AST 통합

#### 2.1.1 Tree-sitter 기반 유니버설 파서
```typescript
interface UniversalASTParser {
  // 지원 언어
  languages: {
    typescript: TreeSitterParser;
    javascript: TreeSitterParser;
    python: TreeSitterParser;
    go: TreeSitterParser;
    rust: TreeSitterParser;
    java: TreeSitterParser;
    cpp: TreeSitterParser;
  };
  
  // 통합 AST 인터페이스
  parse(code: string, language: Language): UniversalAST;
  
  // 언어 간 공통 노드 타입
  findNodes(ast: UniversalAST, type: NodeType): ASTNode[];
}

// 언어 중립적 노드 타입
enum NodeType {
  FUNCTION_DECLARATION,
  CLASS_DECLARATION,
  VARIABLE_DECLARATION,
  IMPORT_STATEMENT,
  CALL_EXPRESSION,
  LOOP_STATEMENT,
  CONDITIONAL_STATEMENT,
  TRY_CATCH_BLOCK,
  COMMENT,
}
```

#### 2.1.2 고급 쿼리 언어
```typescript
// Tree-sitter 쿼리를 추상화한 자체 쿼리 언어
const query = `
  // 모든 async 함수에서 try-catch 블록 찾기
  (function_declaration
    async: true
    body: (block
      (try_statement) @try-catch
    )
  ) @async-function
  
  // 조건: 함수 이름이 'fetch'로 시작
  (#match? @async-function "^fetch")
`;

// 사용
const results = await compass.astQuery(query, {
  files: 'src/**/*.ts',
  includeContext: true
});
```

### 2.2 AST 기반 고급 기능

#### 2.2.1 코드 패턴 매칭
```bash
# CLI 사용
$ code-compass pattern match '
  function $name($params) {
    if ($condition) {
      return $value;
    }
  }
'

# 결과: 조기 return 패턴을 사용하는 모든 함수
```

#### 2.2.2 구조적 코드 검색
```bash
# 특정 패턴의 함수 찾기
$ code-compass ast-search "
  async function that:
    - has try-catch block
    - calls database
    - returns Promise
"

# 출력
Found 15 matches:
1. src/services/user.ts:45 - getUserById
2. src/services/order.ts:120 - createOrder
3. src/services/payment.ts:89 - processPayment
...
```

#### 2.2.3 AST Diff (코드 변경 분석)
```bash
# Git diff를 AST 레벨에서 분석
$ code-compass ast-diff HEAD~1 HEAD

Changes in src/services/user.ts:
  ✓ Function 'getUserById' (line 45-67)
    - Added: error handling (try-catch)
    - Modified: return type (User -> Promise<User>)
    - Removed: synchronous database call
  
  ✓ Class 'UserService' (line 100-250)
    - Added: new method 'validateUser'
    - Modified: constructor parameters
```

### 2.3 AST 변환 (Codemods)

```typescript
// 프로그래밍 방식으로 코드 변환
const transformation = {
  name: 'convert-callbacks-to-async-await',
  transform: (ast: AST) => {
    // 콜백 패턴을 async/await로 변환
    ast.findAll('CallExpression')
      .filter(node => node.hasCallback())
      .forEach(node => {
        node.parent.convertToAsync();
      });
  }
};

// CLI에서 실행
$ code-compass transform convert-callbacks-to-async-await src/**/*.js
```

---

## 3. 시맨틱 코드 이해

### 3.1 코드 임베딩 & 벡터 검색

#### 3.1.1 로컬 임베딩 모델
```typescript
interface CodeEmbedding {
  // 경량 로컬 모델 사용
  model: 'codebert' | 'unixcoder' | 'graphcodebert';
  
  // 코드 블록을 벡터로 변환
  encode(code: string, metadata?: CodeMetadata): Vector;
  
  // 유사도 검색
  search(query: string, topK: number): SearchResult[];
}

// 사용 예시
$ code-compass embed --model codebert src/**/*.ts
Indexing... ████████████████████ 100% (1,234 files)
Created index: .code-compass/embeddings.idx

$ code-compass semantic-search "error handling middleware"
🎯 Top 5 results (by semantic similarity):
1. src/middleware/error.ts:15-45 (0.94)
2. src/utils/errorHandler.ts:10-30 (0.89)
3. src/api/middleware/logging.ts:50-70 (0.82)
```

#### 3.1.2 하이브리드 검색
```typescript
// 키워드 + 시맨틱 검색 결합
const results = await compass.hybridSearch({
  query: 'database connection pooling',
  mode: 'hybrid',
  weights: {
    keyword: 0.3,    // ripgrep 결과
    semantic: 0.7    // 임베딩 유사도
  },
  filters: {
    fileTypes: ['ts', 'js'],
    excludePaths: ['test/**', '**/*.spec.ts']
  }
});
```

### 3.2 자연어 쿼리 이해

```bash
# 자연어로 코드 검색
$ code-compass ask "모든 API 엔드포인트에서 인증을 체크하는 부분을 찾아줘"

Interpreting query...
✓ Detected intent: find authentication checks
✓ Target: API endpoints
✓ Relevant patterns: middleware, auth, jwt, token

Found 8 authentication implementations:
1. src/middleware/auth.ts:25 - JWT validation middleware
2. src/api/routes/users.ts:10 - Auth header check
...

$ code-compass ask "데이터베이스 쿼리 중에서 N+1 문제가 발생할 수 있는 곳"

Analyzing for N+1 query patterns...
⚠️  Found 3 potential N+1 issues:
1. src/services/order.ts:120
   Loop contains database query: orders.map(o => db.user.find(o.userId))
   Suggestion: Use eager loading or join
```

### 3.3 코드 설명 생성

```bash
# 함수 설명 자동 생성
$ code-compass explain getUserById --lang ko

함수: getUserById
위치: src/services/user.ts:45-67

📝 설명:
이 함수는 사용자 ID를 입력받아 데이터베이스에서 해당 사용자를 조회합니다.
비동기 함수로 구현되어 있으며, 에러 발생 시 로깅 후 예외를 재전파합니다.

⚙️ 작동 방식:
1. Prisma ORM의 findUnique 메서드로 사용자 조회
2. 조회 성공 시 User 객체 반환
3. 실패 시 에러 로깅 및 예외 throw

🔗 의존성:
- db.users (Prisma client)
- logger (로깅 유틸리티)

📊 복잡도: 낮음 (Cyclomatic: 2)
```

---

## 4. 리팩토링 엔진

### 4.1 안전한 리팩토링

#### 4.1.1 지원 리팩토링 종류
```typescript
enum RefactoringType {
  // 함수 관련
  EXTRACT_FUNCTION,
  INLINE_FUNCTION,
  RENAME_FUNCTION,
  CHANGE_SIGNATURE,
  MOVE_FUNCTION,
  
  // 변수 관련
  EXTRACT_VARIABLE,
  INLINE_VARIABLE,
  RENAME_VARIABLE,
  
  // 클래스 관련
  EXTRACT_CLASS,
  EXTRACT_INTERFACE,
  MOVE_METHOD,
  PULL_UP_METHOD,
  PUSH_DOWN_METHOD,
  
  // 구조 관련
  CONVERT_TO_ARROW_FUNCTION,
  CONVERT_TO_ASYNC_AWAIT,
  REMOVE_UNUSED_IMPORTS,
  ORGANIZE_IMPORTS,
}
```

#### 4.1.2 리팩토링 실행
```bash
# 함수 추출
$ code-compass refactor extract-function \
  --file src/services/user.ts \
  --range 50-55 \
  --name validateUserInput

Preview changes:
  src/services/user.ts
  - Lines 50-55 will be extracted to new function 'validateUserInput'
  - 3 call sites will be updated

Apply changes? [y/N] y
✓ Refactoring completed successfully

# 이름 변경 (전역 검색 후 변경)
$ code-compass refactor rename \
  --symbol getUserById \
  --new-name findUserById \
  --preview

Found 15 references across 8 files:
  src/services/user.ts:45 (definition)
  src/api/routes/user.ts:20 (call)
  src/api/routes/admin.ts:35 (call)
  ...

Apply changes? [y/N]
```

#### 4.1.3 리팩토링 영향 분석
```typescript
interface RefactoringImpact {
  // 변경될 파일 목록
  affectedFiles: string[];
  
  // 수정이 필요한 코드 위치
  modifications: {
    file: string;
    line: number;
    type: 'definition' | 'reference' | 'import';
    before: string;
    after: string;
  }[];
  
  // 잠재적 위험
  risks: {
    level: 'low' | 'medium' | 'high';
    message: string;
    location?: string;
  }[];
  
  // 테스트 영향
  testImpact: {
    testsToUpdate: string[];
    coverageChange: number;
  };
}

// 사용
const impact = await compass.analyzeRefactoringImpact({
  type: RefactoringType.RENAME_FUNCTION,
  target: 'getUserById',
  newName: 'findUserById'
});

console.log(`Will modify ${impact.affectedFiles.length} files`);
console.log(`Risk level: ${impact.risks[0].level}`);
```

### 4.2 코드 스멜 탐지 & 자동 수정

```bash
# 코드 스멜 검사
$ code-compass analyze smells src/**/*.ts

Found 12 code smells:

❌ Long Function (3 instances)
  1. src/services/order.ts:120-350 (231 lines)
     Suggestion: Extract order validation logic
  
⚠️  Duplicated Code (5 instances)
  1. src/utils/validator.ts:10-25 ≈ src/utils/checker.ts:30-45 (similarity: 87%)
     Suggestion: Extract to shared utility function
  
⚠️  Complex Conditional (4 instances)
  1. src/api/routes/payment.ts:45 (nesting level: 5)
     Suggestion: Extract to separate validation functions

# 자동 수정 시도
$ code-compass fix smells --auto-fix --safe-only

Applying safe fixes...
✓ Removed 12 unused imports
✓ Simplified 3 conditionals
✓ Extracted 2 duplicate code blocks
⏭ Skipped 7 complex fixes (require manual review)
```

---

## 5. 코드 품질 분석

### 5.1 멀티 차원 메트릭

#### 5.1.1 복잡도 분석
```typescript
interface ComplexityMetrics {
  cyclomatic: number;           // 순환 복잡도
  cognitive: number;            // 인지 복잡도
  halstead: HalsteadMetrics;    // Halstead 메트릭
  maintainability: number;      // 유지보수 지수 (0-100)
  nesting: number;              // 최대 중첩 깊이
}

// CLI 사용
$ code-compass metrics complexity src/services/**/*.ts --threshold 10

Complexity Report:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File                           Cyclo  Cognitive  Maint
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
user.ts::getUserById             3       2       85 ✓
order.ts::processOrder          15      22       45 ❌
payment.ts::validatePayment      8       6       72 ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 1 function exceeds threshold (cyclomatic > 10)
⚠️  2 functions need attention (maintainability < 75)
```

#### 5.1.2 의존성 분석
```bash
# 의존성 그래프 생성
$ code-compass analyze dependencies src --output graph

Analyzing dependencies...
✓ Scanned 234 files
✓ Found 1,234 import statements
✓ Detected 15 circular dependencies

Circular Dependencies:
1. user.ts → order.ts → user.ts
2. auth.ts → session.ts → user.ts → auth.ts

# 시각화
$ code-compass analyze dependencies --visualize
Generated: .code-compass/dependency-graph.html
Open in browser to explore interactive graph

# 특정 모듈의 의존성 트리
$ code-compass deps tree src/services/user.ts

src/services/user.ts
├─ @prisma/client
├─ ../utils/logger
│  └─ winston
├─ ../utils/validator
│  ├─ joi
│  └─ lodash
└─ ./types
   └─ typescript
```

#### 5.1.3 테스트 커버리지 연동
```bash
# Istanbul/NYC 커버리지와 통합
$ code-compass coverage analyze --lcov coverage/lcov.info

Coverage Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Module              Lines    Functions   Branches
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
services/user       85.3%       80.0%      75.0%
services/order      45.2%       60.0%      40.0% ❌
api/routes          92.1%       95.0%      88.0% ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Uncovered critical functions:
1. services/order.ts:processRefund (0% coverage)
2. services/payment.ts:handleFailure (0% coverage)

$ code-compass coverage suggest-tests services/order.ts:processRefund
Generated test template:
→ tests/services/order.test.ts
```

### 5.2 보안 분석

```bash
# 보안 취약점 스캔
$ code-compass security scan src

Scanning for security vulnerabilities...

🔴 Critical (2 found)
  1. SQL Injection risk
     File: src/api/routes/user.ts:45
     Code: db.query(`SELECT * FROM users WHERE id = ${userId}`)
     Fix: Use parameterized queries
  
🟡 Warning (5 found)
  1. Hardcoded credentials
     File: src/config/database.ts:10
     Code: password: 'admin123'
     Fix: Use environment variables

✓ No XSS vulnerabilities found
✓ No path traversal vulnerabilities found
```

---

## 6. 통합 아키텍처

### 6.1 시스템 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Code Compass Core                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │   Parser   │  │  Analyzer  │  │  Indexer   │       │
│  │   Layer    │  │   Layer    │  │   Layer    │       │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘       │
│        │                │                │               │
│  ┌─────▼────────────────▼────────────────▼──────┐      │
│  │         Unified AST Representation            │      │
│  └────────────────────┬──────────────────────────┘      │
│                       │                                  │
│  ┌────────────────────▼──────────────────────────┐      │
│  │           Query & Search Engine               │      │
│  │  ├─ Text Search (ripgrep)                     │      │
│  │  ├─ AST Query (tree-sitter)                   │      │
│  │  ├─ Semantic Search (embeddings)              │      │
│  │  └─ Hybrid Search                             │      │
│  └────────────────────┬──────────────────────────┘      │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
   │   CLI   │    │   LSP   │    │   API   │
   │Interface│    │ Server  │    │ Server  │
   └────┬────┘    └────┬────┘    └────┬────┘
        │              │              │
   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
   │Terminal │    │  IDEs   │    │LLM Agent│
   │   User  │    │(VSCode, │    │  (MCP,  │
   │         │    │Vim,etc) │    │  API)   │
   └─────────┘    └─────────┘    └─────────┘
```

### 6.2 플러그인 시스템

```typescript
// 확장 가능한 플러그인 아키텍처
interface CodeCompassPlugin {
  name: string;
  version: string;
  
  // 라이프사이클 훅
  onInit?(compass: CodeCompass): Promise<void>;
  onBeforeSearch?(query: SearchQuery): SearchQuery;
  onAfterSearch?(results: SearchResult[]): SearchResult[];
  
  // 커스텀 커맨드 추가
  commands?: {
    [name: string]: CommandHandler;
  };
  
  // 커스텀 분석기 추가
  analyzers?: {
    [name: string]: Analyzer;
  };
}

// 플러그인 예시: GraphQL 지원
const graphqlPlugin: CodeCompassPlugin = {
  name: 'graphql-support',
  version: '1.0.0',
  
  commands: {
    'find-resolver': async (args) => {
      // GraphQL resolver 찾기
    },
    'analyze-schema': async (args) => {
      // GraphQL 스키마 분석
    }
  },
  
  analyzers: {
    'graphql-complexity': async (ast) => {
      // GraphQL 쿼리 복잡도 분석
    }
  }
};

// 플러그인 로드
$ code-compass plugin install graphql-support
$ code-compass find-resolver getUserById
```

### 6.3 캐싱 전략

```typescript
interface CacheStrategy {
  // 레벨별 캐싱
  levels: {
    // L1: 메모리 (LRU)
    memory: LRUCache<string, ParsedAST>;
    
    // L2: 로컬 파일 시스템
    disk: {
      path: '.code-compass/cache',
      format: 'msgpack' | 'json',
    };
    
    // L3: 분산 캐시 (선택적)
    distributed?: RedisCache;
  };
  
  // 무효화 전략
  invalidation: {
    // 파일 변경 감지
    fileWatcher: FSWatcher;
    
    // Git hooks 연동
    gitHooks: ['post-checkout', 'post-merge'];
    
    // 수동 무효화
    ttl: number; // seconds
  };
}

// 사용
$ code-compass cache status
Cache Statistics:
  Memory: 234 entries (45.2 MB)
  Disk: 1,234 files (512 MB)
  Hit rate: 87.3%
  
$ code-compass cache clear --older-than 7d
Cleared 456 cache entries older than 7 days
```

---

## 7. 실전 사용 시나리오

### 7.1 대규모 리팩토링 프로젝트

```bash
# 시나리오: Express → Fastify 마이그레이션

# 1. 영향 범위 분석
$ code-compass analyze dependencies express --show-all-usage
Found 234 files importing 'express'
Estimated migration effort: 40-60 hours

# 2. 패턴 검색
$ code-compass pattern find "app.use($middleware)" --export-json migration-plan.json

# 3. 자동 변환 (custom codemod)
$ code-compass transform express-to-fastify --dry-run
Preview: 234 files will be modified

# 4. 테스트 영향 분석
$ code-compass test-impact express-to-fastify
423 tests will need updates

# 5. 단계적 실행
$ code-compass transform express-to-fastify --files "src/api/**" --commit-each
```

### 7.2 레거시 코드 분석

```bash
# 기술 부채 측정
$ code-compass debt analyze src

Technical Debt Report:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Metric                    Score    Estimate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Code Duplication          23.4%    12h
Complex Functions         15       8h
Long Functions            23       6h
Code Smells               89       20h
Missing Tests             45.2%    40h
Outdated Dependencies     12       4h
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Estimated Effort:            90h
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prioritized Action Items:
1. Refactor processOrder() - 15h (high impact)
2. Add tests for payment module - 20h (critical)
3. Update lodash dependency - 2h (security)
```

### 7.3 AI 에이전트 협업

```python
# LLM 에이전트가 Code Compass를 도구로 사용
from code_compass import CodeCompass
import anthropic

compass = CodeCompass()
client = anthropic.Anthropic()

# 자연어 요청 처리
user_request = "결제 관련 함수에서 에러 처리가 누락된 부분을 찾아줘"

# 1단계: Code Compass로 관련 코드 찾기
payment_functions = compass.find_functions(
    pattern="payment",
    filters={"has_error_handling": False}
)

# 2단계: LLM에게 분석 요청
context = "\n\n".join([f.code for f in payment_functions])
response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    messages=[{
        "role": "user",
        "content": f"""
        다음 결제 관련 함수들을 분석하고 에러 처리 개선 방안을 제시해주세요:
        
        {context}
        """
    }]
)

# 3단계: 제안사항을 Code Compass로 검증
suggestions = parse_llm_suggestions(response.content)
for suggestion in suggestions:
    impact = compass.analyze_refactoring_impact(suggestion)
    if impact.risk_level == "low":
        compass.apply_refactoring(suggestion, auto_commit=True)
```

---

## 8. 성능 목표 & 최적화

### 8.1 성능 벤치마크

| 작업 | 코드베이스 크기 | 목표 시간 | 현재 성능 |
|------|----------------|-----------|----------|
| 텍스트 검색 | 100K LOC | < 100ms | 50ms ✓ |
| AST 파싱 | 1K files | < 5s | 3.2s ✓ |
| 전체 인덱싱 | 100K LOC | < 30s | 25s ✓ |
| 시맨틱 검색 | 100K LOC | < 500ms | TBD |
| LSP 응답 | - | < 100ms | TBD |

### 8.2 최적화 전략

```typescript
// 1. 증분 파싱
class IncrementalParser {
  private cache: Map<string, ParsedAST>;
  private fileHashes: Map<string, string>;
  
  async parseFile(file: string): Promise<ParsedAST> {
    const currentHash = await this.getFileHash(file);
    const cachedHash = this.fileHashes.get(file);
    
    if (currentHash === cachedHash) {
      return this.cache.get(file)!; // 캐시 히트
    }
    
    // 변경된 부분만 재파싱
    const ast = await this.parse(file);
    this.cache.set(file, ast);
    this.fileHashes.set(file, currentHash);
    return ast;
  }
}

// 2. 병렬 처리
const results = await Promise.all(
  files.map(file => 
    workerPool.execute(() => parseFile(file))
  )
);

// 3. 지연 로딩
class LazyAST {
  private _parsed: AST | null = null;
  
  get parsed(): AST {
    if (!this._parsed) {
      this._parsed = this.parse();
    }
    return this._parsed;
  }
}
```

---

## 9. 개발 우선순위

### Phase 1: Foundation (1-2개월)
- [x] 기본 CLI & REPL
- [x] ripgrep 통합
- [ ] Tree-sitter 통합
- [ ] TypeScript/JavaScript AST 파싱
- [ ] 기본 메트릭 (복잡도)

### Phase 2: LSP Integration (2-3개월)
- [ ] LSP 서버 구현
- [ ] VSCode Extension
- [ ] Definition/References 기능
- [ ] Hover 정보 제공
- [ ] Code Actions (기본)

### Phase 3: Advanced AST (2개월)
- [ ] 멀티 언어 지원 (Python, Go)
- [ ] AST 쿼리 언어
- [ ] 패턴 매칭
- [ ] 구조적 검색

### Phase 4: Refactoring (2-3개월)
- [ ] 기본 리팩토링 (Rename, Extract)
- [ ] 영향 분석
- [ ] 안전성 검증
- [ ] 코드 스멜 탐지

### Phase 5: Intelligence (3-4개월)
- [ ] 코드 임베딩
- [ ] 시맨틱 검색
- [ ] 자연어 쿼리
- [ ] AI 제안 기능

### Phase 6: Ecosystem (지속적)
- [ ] 플러그인 시스템
- [ ] 다양한 에디터 지원
- [ ] CI/CD 통합
- [ ] 웹 대시보드

---

## 10. 참고 자료

### 유사 프로젝트
- [rust-analyzer](https://rust-analyzer.github.io/) - Rust LSP 구현
- [TypeScript Language Server](https://github.com/typescript-language-server/typescript-language-server)
- [Sourcegraph](https://sourcegraph.com/) - 코드 검색 플랫폼
- [ast-grep](https://ast-grep.github.io/) - AST 기반 검색
- [Semgrep](https://semgrep.dev/) - 코드 패턴 매칭

### 기술 문서
- [LSP Specification](https://microsoft.github.io/language-server-protocol/)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [Code Metrics Research](https://www.sonarsource.com/docs/CognitiveComplexity.pdf)

### 논문
- "A Metrics Suite for Object Oriented Design" (Chidamber & Kemerer, 1994)
- "CodeBERT: A Pre-Trained Model for Programming and Natural Languages" (Feng et al., 2020)
- "Graph Neural Networks for Code Search" (Wan et al., 2019)

---

**다음 단계**: 
1. LSP 서버 프로토타입 개발
2. Tree-sitter 통합 PoC
3. 성능 벤치마크 환경 구축