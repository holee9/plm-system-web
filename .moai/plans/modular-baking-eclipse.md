# Plan: MCP "transmuting" 상태 장시간 지연 문제 해결

## Context

### 문제 현상
Claude Code 터미널에서 "transmuting" 상태가 장시간(수십 초 이상) 지속되는 문제가 발생합니다.

### 원인 분석

**1. npx 실행 방식으로 인한 지연**
- `context7`: `npx -y @upstash/context7-mcp@latest`
- `sequential-thinking`: `npx -y @modelcontextprotocol/server-sequential-thinking`
- `npx -y`는 매번 패키지 버전을 확인하고 필요하면 다운로드하므로 3-10초 지연 발생

**2. MCP 서버 설정 중복**
- 글로벌 설정: `C:\Users\user\.mcp.json`
- 프로젝트 설정: `D:\workspace-github\plm-system-web\.mcp.json`
- 동일한 MCP 서버가 두 정의에서 모두 실행될 가능성

**3. Pencil MCP 설정 불일치**
- 글로벌: `disabled: true`
- 프로젝트: 활성화됨
- Pencil 확장이 설치되어 있지 않거나 실행 중이 아닐 경우 연결 대기 시간 발생

---

## 해결 방안

### 1단계: MCP 서버 최적화

**context7 / sequential-thinking 서버 최적화**
- `npx -y package@latest` 대신 전역 설치된 패키지 사용
- 또는 `npx` 캐시를 활용하여 버전 고정

**수정 전:**
```json
"context7": {
  "command": "npx",
  "args": ["-y", "@upstash/context7-mcp@latest"]
}
```

**수정 후 (옵션 A - 전역 설치):**
```json
"context7": {
  "command": "context7-mcp",
  "args": []
}
```

**수정 후 (옵션 B - 버전 고정):**
```json
"context7": {
  "command": "npx",
  "args": ["@upstash/context7-mcp@1.0.0"]
}
```

### 2단계: 프로젝트 MCP 설정 정리

**선택 사항 A: 글로벌 설정만 사용 (권장)**
- 프로젝트 `.mcp.json` 삭제 또는 최소화
- 모든 MCP 서버를 글로벌에서 관리

**선택 사항 B: 프로젝트 설정만 사용**
- 글로벌 `.mcp.json`에서 중복 서버 제거
- 프로젝트에서만 MCP 서버 정의

### 3단계: Pencil MCP 설정 일치

**Pencil을 사용하지 않는 경우:**
- 프로젝트 `.mcp.json`에서 pencil 서버 제거 또는 비활성화

**Pencil을 사용하는 경우:**
- 글로벌 설정에서 `disabled: false`로 변경
- Pencil VSCode 확장이 설치되어 있는지 확인

---

## Critical Files

| 파일 | 경로 | 작업 |
|------|------|------|
| 글로벌 MCP 설정 | `C:\Users\user\.mcp.json` | 검토 및 최적화 |
| 프로젝트 MCP 설정 | `D:\workspace-github\plm-system-web\.mcp.json` | 수정 또는 삭제 |
| Pencil 확장 | `c:\Users\user\.vscode\extensions\highagency.pencildev-0.6.24\` | 존재 확인 |

---

## Verification

**수정 후 확인 사항:**

1. Claude Code 재시작 후 `transmuting` 시간 측정
2. MCP 서버 연결 상태 확인
3. 각 MCP 서버의 도구 사용 가능성 확인:
   - `mcp__context7__resolve-library-id`
   - `mcp__sequential-thinking__sequentialthinking`
   - `mcp__pencil__*` (사용 시)
   - `mcp__codex__*` (사용 시)

**기대 결과:**
- `transmuting` 상태가 5초 이내로 완료
- 모든 MCP 서버가 정상적으로 연결됨
