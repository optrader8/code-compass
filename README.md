# IDEA.md

## 프로젝트 개요
코드베이스 검색 및 분석을 위한 Node.js 기반 CLI 도구. 특정 함수, 클래스, 코드 블록을 빠르게 찾고 메타정보와 함께 반환하여 코딩 에이전트나 개발자의 코드 탐색을 지원합니다.

## 핵심 목표
- **빠른 검색**: ripgrep 수준의 성능으로 대규모 코드베이스 탐색
- **정확한 범위 지정**: 함수/클래스/블록 단위의 정확한 추출
- **풍부한 메타정보**: 파일명, 라인 범위, 코드 컨텍스트 제공
- **에이전트 친화적**: LLM 코딩 에이전트가 쉽게 파싱/사용 가능한 출력 포맷
- **점진적 확장**: REPL 기반 시작 → 독립 CLI 도구 → 에이전트 통합

## 주요 기능

### Phase 1: 기본 검색 (REPL 기반)
```bash
# REPL 실행
$ code-search

> search "function fetchUserData"
> find-function fetchUserData
> grep-context "class UserService" --lines 10
```

**기능 목록:**
- 텍스트 패턴 검색 (ripgrep 래핑)
- 파일 타입 필터링 (.js, .ts, .py 등)
- 컨텍스트 라인 표시 (before/after)
- 결과 포맷팅 (JSON, 테이블, 컬러)

### Phase 2: 구조적 코드 분석
```bash
> find-function getUserById --file src/**/*.ts
> list-functions --file src/services/user.ts
> extract-class UserRepository --with-methods
> find-imports "lodash" --show-usage
```

**기능 목록:**
- AST 기반 함수/클래스 경계 인식
- 함수 시그니처 추출
- import/export 관계 추적
- 코드 블록 범위 정확한 라인 번호

### Phase 3: 메타정보 강화
```bash
> analyze getUserById
# 출력:
# File: src/services/user.ts
# Lines: 45-67
# Type: async function
# Parameters: (id: string) => Promise<User>
# Dependencies: UserRepository, logger
# Called by: 3 locations
# Complexity: 5
```

**기능 목록:**
- 함수 복잡도 (cyclomatic complexity)
- 의존성 그래프
- 호출 관계 (caller/callee)
- JSDoc/TSDoc 파싱
- Git blame 정보 (optional)

### Phase 4: 에이전트 통합
```bash
# Standalone CLI로 전환
$ code-search find-function getUserById --json
$ code-search extract-range src/user.ts:45-67 --format llm
$ code-search semantic-search "database connection logic"
```

**출력 포맷 예시:**
```json
{
  "results": [
    {
      "file": "src/services/user.ts",
      "type": "function",
      "name": "getUserById",
      "start_line": 45,
      "end_line": 67,
      "signature": "async getUserById(id: string): Promise<User>",
      "code": "...",
      "dependencies": ["UserRepository", "logger"],
      "metadata": {
        "complexity": 5,
        "loc": 23,
        "comments": "..."
      }
    }
  ]
}
```

## 기술 스택

### 핵심 라이브러리
- **검색**: `ripgrep` (node wrapper) 또는 `@vscode/ripgrep`
- **AST 파싱**: 
  - JavaScript/TypeScript: `@babel/parser` 또는 `typescript` 컴파일러 API
  - Python: `tree-sitter` 또는 `@anthropic-ai/tree-sitter`
  - 기타 언어: `tree-sitter` 바인딩
- **REPL**: `readline`, `inquirer`, `prompts`
- **CLI 프레임워크**: `commander` 또는 `yargs`
- **출력 포맷**: `chalk`, `cli-table3`, `ora` (스피너)

### 성능 최적화
- Glob 패턴: `fast-glob` 또는 `globby`
- 병렬 처리: Worker threads 또는 `p-queue`
- 캐싱: 파일 해시 기반 AST 캐시 (`lru-cache`)
- 인덱싱: 선택적으로 `.code-search-index` 생성

## 프로젝트 구조
```
code-search/
├── src/
│   ├── cli/
│   │   ├── repl.ts          # REPL 모드 진입점
│   │   ├── commands.ts      # CLI 커맨드 정의
│   │   └── formatters.ts    # 출력 포맷터
│   ├── core/
│   │   ├── searcher.ts      # 텍스트 검색 엔진
│   │   ├── parser.ts        # AST 파싱
│   │   ├── analyzer.ts      # 코드 분석
│   │   └── extractor.ts     # 코드 추출
│   ├── utils/
│   │   ├── glob.ts          # 파일 탐색
│   │   ├── cache.ts         # 캐싱 레이어
│   │   └── git.ts           # Git 통합
│   └── index.ts             # 메인 진입점
├── tests/
├── fixtures/                 # 테스트용 코드 샘플
├── package.json
└── tsconfig.json
```

## 사용 시나리오

### 개발자 사용 케이스
```bash
# 특정 함수가 어디에 정의되어 있는지 찾기
> find-function createUser

# 특정 파일의 모든 export된 함수 나열
> list-exports src/api/users.ts

# 특정 클래스를 사용하는 모든 위치 찾기
> find-usage UserService

# 에러 처리 패턴 검색
> search "try.*catch" --regex --context 5
```

### 코딩 에이전트 사용 케이스
```bash
# JSON 형식으로 함수 추출 (LLM이 파싱하기 쉬움)
$ code-search extract getUserById --json --include-deps

# 특정 영역만 추출하여 컨텍스트 제공
$ code-search range src/user.ts:45-67 --format markdown

# 시맨틱 검색 (벡터 임베딩 활용)
$ code-search semantic "authentication middleware" --top 5
```

## 확장 아이디어

### Phase 5+: 고급 기능
1. **시맨틱 검색**: 
   - 코드 임베딩 생성 (CodeBERT, OpenAI embeddings)
   - 자연어 쿼리 → 관련 코드 블록 찾기

2. **리팩토링 지원**:
   - 함수 이동/이름 변경 시뮬레이션
   - 영향 범위 분석
   - Dead code 탐지

3. **문서 생성**:
   - 함수 → JSDoc 자동 생성
   - README 섹션 자동 생성
   - API 문서 추출

4. **IDE/에디터 통합**:
   - VSCode Extension
   - LSP (Language Server Protocol) 지원
   - Vim/Neovim 플러그인

5. **CI/CD 통합**:
   - 코드 품질 메트릭 리포트
   - PR diff 분석
   - 복잡도 변화 추적

## 차별화 포인트

### 기존 도구 대비 장점
| 도구 | 한계 | 우리 도구의 강점 |
|------|------|-----------------|
| ripgrep | 텍스트 검색만, 구조 이해 X | AST 기반 정확한 범위 추출 |
| ctags | 오래된 포맷, 언어 지원 제한 | 현대적 언어 지원, JSON 출력 |
| grep + awk | 수동 조합 필요, 에러 prone | 통합 인터페이스, 신뢰성 |
| IDE search | 에이전트 통합 어려움 | API 친화적, 자동화 가능 |

## 개발 로드맵

### Sprint 1-2 (2주): MVP
- [x] 프로젝트 셋업 (TypeScript, ESLint, Jest)
- [ ] 기본 REPL 구현
- [ ] ripgrep 통합 (텍스트 검색)
- [ ] 파일 glob 패턴 지원
- [ ] 기본 포맷터 (컬러 출력)

### Sprint 3-4 (2주): AST 파싱
- [ ] TypeScript/JavaScript 파서 구현
- [ ] 함수/클래스 경계 추출
- [ ] import/export 분석
- [ ] 테스트 커버리지 80%+

### Sprint 5-6 (2주): CLI 도구화
- [ ] Commander 기반 CLI 구현
- [ ] JSON/Markdown 출력 포맷
- [ ] 성능 최적화 (병렬 처리)
- [ ] 문서 작성 (README, examples)

### Sprint 7+ (지속적): 확장
- [ ] Python, Go, Java 지원
- [ ] 캐싱 레이어
- [ ] 시맨틱 검색 프로토타입
- [ ] VSCode Extension 검토

## 성공 지표
- 10,000+ 파일 코드베이스에서 < 1초 검색
- 95%+ 정확도로 함수 경계 추출
- LLM 에이전트가 출력을 100% 파싱 가능
- 주간 활성 사용자 100+ (오픈소스 공개 시)

## 참고 자료
- [ripgrep](https://github.com/BurntSushi/ripgrep)
- [tree-sitter](https://tree-sitter.github.io/tree-sitter/)
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [ast-grep](https://ast-grep.github.io/) - 유사 프로젝트 참고

---

**다음 단계**: MVP 프로토타입 개발 시작 - REPL + ripgrep 통합
