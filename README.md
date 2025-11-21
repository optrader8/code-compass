# Code Compass

🔍 **Advanced code search and analysis tool with LSP support**

Code Compass는 대규모 코드베이스에서 빠르고 정확한 코드 검색과 분석을 제공하는 Node.js/TypeScript 기반 CLI 도구입니다. 개발자와 AI 코딩 에이전트 모두를 위해 설계되었습니다.

## ✨ 특징

- **⚡ 빠른 검색**: ripgrep 기반의 고성능 텍스트 검색
- **🎯 정확한 분석**: AST 기반의 구조적 코드 분석
- **🌐 LSP 지원**: Language Server Protocol 기반 IDE 통합
- **🤖 에이전트 친화적**: JSON 출력으로 AI/LLM과의 통합 용이
- **🎨 인터랙티브 TUI**: ink 기반의 현대적 터미널 인터페이스

## 🚀 빠른 시작

### 설치

```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 전역 설치 (선택사항)
npm install -g .
```

### 기본 사용법

```bash
# 인터랙티브 모드 시작 (기본)
npx code-compass

# 또는
npm start

# 코드 검색
npx code-compass search "pattern" --json

# 코드 분석
npx code-compass analyze ./src --recursive

# LSP 서버 시작
npx code-compass lsp --port 7777
```

## 📖 사용법

### 1. 인터랙티브 모드

기본적으로 Code Compass는 ink 기반의 인터랙티브 터미널 인터페이스를 제공합니다:

```
╔════════════════════════════════════════╗
║     🔍 Code Compass Interactive     ║
╚════════════════════════════════════════╝

❯ search query
🔍 Searching for: search query
Found 3 results:
1. src/index.ts:42 - const pattern = "search query"
2. src/utils/search.ts:15 - function searchquery()
3. src/core/engine.ts:78 - // search query implementation
```

### 2. CLI 명령어

#### 검색 (`search`)

```bash
# 기본 텍스트 검색
npx code-compass search "function getUserById"

# 파일 타입 필터링
npx code-compass search "UserRepository" --file "**/*.ts"

# JSON 출력 (AI/LLM용)
npx code-compass search "class.*Service" --json --type function

# 언어 특정 검색
npx code-compass search "def main" --language python
```

#### 분석 (`analyze`)

```bash
# 프로젝트 분석
npx code-compass analyze ./src --recursive --metrics

# 복잡도 분석
npx code-compass analyze ./src --complexity

# 의존성 분석
npx code-compass analyze ./src --dependencies
```

#### LSP 서버 (`lsp`)

```bash
# TCP 모드 (기본)
npx code-compass lsp --port 7777 --host 127.0.0.1

# stdio 모드
npx code-compass lsp --stdio
```

## 🏗️ 아키텍처

### 핵심 컴포넌트

```
code-compass/
├── src/
│   ├── core/                   # 핵심 비즈니스 로직
│   │   ├── engine.ts          # 메인 오케스트레이션 엔진
│   │   └── analyzer.ts        # 코드 분석기
│   ├── parsers/               # 언어별 파서
│   │   ├── registry.ts        # 파서 레지스트리
│   │   ├── typescript.ts      # TS/JS 파서
│   │   └── python.ts          # Python 파서
│   ├── utils/                 # 유틸리티 모듈
│   │   ├── ripgrep.ts         # 텍스트 검색
│   │   ├── cache.ts           # LRU 캐시
│   │   └── formatters.ts      # 출력 포맷터
│   ├── types/                 # TypeScript 타입 정의
│   ├── ui/                    # ink UI 컴포넌트
│   │   └── BasicApp.tsx       # 기본 TUI 앱
│   ├── lsp-server.ts          # LSP 서버 구현
│   └── index.ts               # CLI 진입점
```

### 데이터 흐름

1. **검색 요청** → `CoreEngine`
2. **텍스트 검색** → `ripgrep` 래퍼
3. **AST 파싱** → `ASTParser` (tree-sitter)
4. **메타데이터 분석** → `CodeAnalyzer`
5. **결과 포맷팅** → `formatters`
6. **캐싱** → `LRUCache`

## 🔧 개발

### 환경 설정

```bash
# 개발 의존성 설치
npm install

# TypeScript 빌드
npm run build

# 개발 모드 (watch)
npm run dev

# 테스트 실행
npm test

# 테스트 (watch 모드)
npm run test:watch

# 코드 린트
npm run lint
```

### 프로젝트 구조

- **TypeScript**: strict mode, 2-space indentation
- **테스트**: Jest with coverage
- **코드 스타일**: ESLint + Prettier
- **빌드**: TypeScript Compiler

### 새로운 언어 지원 추가

1. `src/parsers/`에 새 파서 파일 생성
2. `BaseParser` 인터페이스 구현
3. `ASTParser` 레지스트리에 등록
4. 테스트 케이스 작성

예시:

```typescript
// src/parsers/rust.ts
import { BaseParser, ParseResult } from './base';

export class RustParser extends BaseParser {
  parse(filePath: string, content: string): ParseResult {
    // Rust AST 파싱 로직
  }
}
```

## 📊 지원 언어

| 언어 | 상태 | 파서 |
|------|------|------|
| TypeScript | ✅ | tree-sitter-typescript |
| JavaScript | ✅ | tree-sitter-javascript |
| Python | ✅ | tree-sitter-python |
| Go | 🚧 | 계획됨 |
| Rust | 🚧 | 계획됨 |
| Java | 🚧 | 계획됨 |

## 🔌 LSP 통합

Code Compass는 LSP(Language Server Protocol) 서버를 제공하여 IDE와 통합될 수 있습니다:

### 지원 기능

- **문서 동기화**: Incremental text document sync
- **호버 정보**: Symbol documentation
- **정의로 이동**: Go to definition
- **참조 찾기**: Find references
- **문서 기호**: Document symbols
- **워크스페이스 기호**: Workspace symbols
- **실험적 기능**: 코드 메트릭, 시맨틱 검색

### IDE 설정

#### VS Code

```json
// .vscode/settings.json
{
  "codeAnalysis.enable": true,
  "codeAnalysis.lsp.port": 7777
}
```

## 🤖 AI/LLM 통합

Code Compass는 AI 코딩 에이전트와의 통합을 위해 설계되었습니다:

### JSON 출력 형식

```json
{
  "results": [
    {
      "location": {
        "uri": "file:///src/services/user.ts",
        "range": {
          "start": { "line": 45, "character": 0 },
          "end": { "line": 67, "character": 1 }
        }
      },
      "content": "async function getUserById(id: string): Promise<User> { ... }",
      "score": 0.95,
      "metadata": {
        "fileType": "typescript",
        "language": "typescript",
        "symbolType": "function",
        "complexity": 5,
        "lastModified": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "count": 1,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Claude/ChatGPT 사용 예시

```
User: "getUserById 함수를 찾아서 구조를 분석해줘"

AI: code-compass search "getUserById" --type function --json

[결과를 파싱하여 분석 제공]
```

## 🔍 검색 타입

### 텍스트 검색
- 기본 패턴 매칭 (ripgrep 기반)
- 정규표현식 지원
- 대소문자 구분 옵션

### 구조적 검색
- 함수/메서드 정의
- 클래스/인터페이스 선언
- import/export 문
- 변수 선언

### 메타데이터 검색
- 복잡도 기반 필터링
- 의존성 관계 검색
- 호출 그래프 탐색

## 📈 성능

- **검색 속도**: 10,000+ 파일 < 1초
- **메모리 사용**: LRU 캐시로 최적화
- **병렬 처리**: Worker threads 지원
- **캐싱**: 파일 해시 기반의 지능형 캐시

## 🛠️ 명령어 참조

### 글로벌 옵션

```bash
--help, -h     도움말 표시
--version, -v 버전 정보
--config       설정 파일 경로 지정
```

### search 명령어

```bash
npx code-compass search <pattern> [options]

옵션:
  -t, --type <type>        검색 타입 (text|function|class|import)
  -f, --file <pattern>     파일 패턴 필터
  -l, --language <lang>    언어 필터
  -c, --context <lines>    컨텍스트 라인 수 (기본: 3)
  --json                   JSON 출력
  --case-sensitive        대소문자 구분
  --regex                  정규표현식 모드
```

### analyze 명령어

```bash
npx code-compass analyze <path> [options]

옵션:
  -r, --recursive         재귀적 분석
  --metrics               코드 메트릭 표시
  --complexity            복잡도 분석
  --dependencies          의존성 분석
  --json                  JSON 출력
```

### lsp 명령어

```bash
npx code-compass lsp [options]

옵션:
  --stdio                 stdio 통신 사용
  --port <port>           포트 번호 (기본: 7777)
  --host <host>           호스트 주소 (기본: 127.0.0.1)
```

## 🤝 기여

기여는 환영합니다! 다음 단계를 따라주세요:

1. 이슈 생성 또는 기존 이슈 확인
2. 포크 및 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
4. 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### 개발 가이드라인

- TypeScript strict mode 준수
- 100% 테스트 커버리지 목표
- ESLint 규칙 준수
- 의미있는 커밋 메시지 작성

## 📄 라이선스

MIT License - [LICENSE](LICENSE) 파일 참조

## 🔗 관련 링크

- [ripgrep](https://github.com/BurntSushi/ripgrep) - 고속 텍스트 검색
- [tree-sitter](https://tree-sitter.github.io/) - 파서 생성기
- [ink](https://github.com/vadimdemedes/ink) - React for CLIs
- [vscode-languageserver](https://github.com/microsoft/vscode-languageserver-node) - LSP for Node.js

## 📞 지원

- 🐛 [버그 리포트](https://github.com/your-org/code-compass/issues)
- 💡 [기능 요청](https://github.com/your-org/code-compass/issues)
- 💬 [토론](https://github.com/your-org/code-compass/discussions)

---

**Code Compass** - 코드 탐색의 새로운 기준 🧭