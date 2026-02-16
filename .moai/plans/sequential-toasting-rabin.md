# Claude Code ↔ Codex 협업 환경 구축 Plan

## Context

**중요한 사실: MoAI는 필수가 아닙니다.**

Codex MCP 서버는 이미 `.mcp.json`에 설정되어 있으며, Claude Code가 **직접** MCP 도구를 호출하여 Codex와 통신할 수 있습니다. MoAI 페르소나는 선택 사항일 뿐입니다.

**현재 상태:**
- ✅ Codex MCP 서버 설정됨 (`C:\Users\user\.mcp.json`)
- ✅ ChatGPT 확장 설치됨
- ❌ MCP 도구들을 실제로 호출하는 방법이 미확립

**두 가지 구현 옵션:**
1. **MoAI 기반** - expert-codex agent 생성 (MoAI 프레임워크 활용)
2. **직접 MCP 호출** - Claude가 MCP 도구를 직접 호출 (간단, 빠름)

**목표:**
Claude Code가 OpenAI Codex(GPT-4)와 직접 통신하여 작업을 위임하고 결과를 받는 협업 환경 구축

---

## 현재 상황 분석

### ✅ 이미 구성된 것
1. **Codex MCP 서버** (`C:\Users\user\.mcp.json`)
   ```json
   "codex": {
     "command": "C:\\Users\\user\\.vscode\\extensions\\openai.chatgpt-0.4.74-win32-x64\\bin\\windows-x86_64\\codex.exe",
     "args": ["mcp-server"]
   }
   ```

### ❌ 누락된 것
1. **MCP 도구 목록 확인** - `mcp__codex__*` 도구들이 실제로 노출되는지 확인 필요
2. **직접 호출 예제** - Claude가 Codex를 호출하는 사용 패턴 부재
3. **결과 파싱** - Codex 응답을 Claude가 해석하는 방법 정의 부족

### 🎯 핵심 발견
**MoAI Agent 시스템은 선택 사항입니다.**
- Codex MCP 서버는 Claude Code CLI 레벨에서 작동
- `ToolSearch`로 도구 발견 후 직접 호출 가능
- 복잡한 agent 정의 없이도 즉시 사용 가능

---

## 권장 구현 방안: 간단한 직접 호출

### 단계 1: MCP 도구 확인 (Plan 모드 해제 후)

```typescript
// 1. 도구 검색
ToolSearch(query: "codex", max_results: 10)
```

예상 결과: `mcp__codex__exec`, `mcp__codex__status` 등의 도구 목록

### 단계 2: Codex 직접 호출 테스트

```typescript
// 2. 도구 직접 호출 (Plan 모드 해제 후)
// MCP 도구 이름은 ToolSearch 결과로 확인 필요

// 예시 형식 (실제 도구 이름은 검색 후 확인):
mcp__codex__exec({
  task: "Analyze this TypeScript file and suggest improvements",
  file: "src/server/db/schema.ts"
})
```

### 단계 3: 간단한 래퍼 함수 작성 (선택)

복잡한 agent 정의 없이 필요할 때마다 직접 호출하거나,
간단한 도우미 함수를 `src/lib/codex.ts`에 작성:

```typescript
// src/lib/codex.ts (선택 사항)
export async function askCodex(task: string, context?: string) {
  // MCP 도구 직접 호출 또는 Bash로 CLI 실행
}
```

### 단계 4: 검증

```bash
# Codex 로그인 상태 확인
"C:\Users\user\.vscode\extensions\openai.chatgpt-0.4.74-win32-x64\bin\windows-x86_64\codex.exe" login status
```

---

## MoAI 기반 구현 (선택 사항)

MoAI agent 시스템을 활용하고 싶다면 추가 작업:

### 추가 단계 A: Codex Agent 정의

**파일:** `.claude/agents/moai/expert-codex.md`

### 추가 단계 B: Codex Skill

**파일:** `.claude/skills/moai-codex-integration.md`

**하지만 이것은 선택 사항입니다.**

---

## 수정할 파일 목록 (최소화)

| 파일 | 작업 | 필수 여부 |
|------|------|----------|
| `.mcp.json` | 이미 설정됨 | ✅ 완료 |
| `src/lib/codex.ts` | 선택적 래퍼 함수 | ⚪ 선택 |
| `.claude/agents/moai/expert-codex.md` | MoAI 기반 구현 시 | ⚪ 선택 |
| `.claude/skills/moai-codex-integration.md` | MoAI 기반 구현 시 | ⚪ 선택 |

**핵심:** 파일 수정보다 **MCP 도구 호출 방식**을 익히는 것이 중요

---

## 검증 방법

### 1. MCP 도구 확인 (가장 중요)
```typescript
// Plan 모드 해제 후 첫 번째로 할 일
ToolSearch(query: "codex", max_results: 10)
```

### 2. Codex 로그인 확인
```bash
"C:\Users\user\.vscode\extensions\openai.chatgpt-0.4.74-win32-x64\bin\windows-x86_64\codex.exe" login status
```

### 3. 직접 호출 테스트
Plan 모드 해제 후:
```
사용자: "Codex에게 src/server/db/users.ts 파일을 분석하도록 요청해"
```
→ Claude가 `mcp__codex__*` 도구를 찾아서 호출

### 4. 결과 검증
- Codex 응답 수신 여부
- JSON 파싱 가능 여부
- Claude가 결과를 적절히 통합하는지

---

## 최종 구현 계획: 둘 다 구현

### Phase 1: 직접 MCP 호출 (먼저, 빠름)

1. **ToolSearch로 Codex MCP 도구 확인**
   - `ToolSearch(query: "codex", max_results: 10)`
   - 사용 가능한 `mcp__codex__*` 도구 목록 파악

2. **직접 호출 테스트**
   - 발견된 MCP 도구로 간단한 작업 위임 테스트
   - 결과 파싱 방식 확인

### Phase 2: MoAI Agent 래퍼 (그 후, 구조화)

3. **expert-codex Agent 생성**
   - 파일: `.claude/agents/moai/expert-codex.md`
   - 기존 expert-frontend 패턴 참조

4. **Codex Skill 생성**
   - 파일: `.claude/skills/moai-codex-integration.md`
   - MCP 도어 사용 방법, 결과 파싱 정의

---

## 예상 소요 시간

| 단계 | 작업 | 시간 |
|------|------|------|
| 1 | MCP 도구 확인 | 5분 |
| 2 | 직접 호출 테스트 | 10분 |
| 3 | expert-codex Agent 작성 | 15분 |
| 4 | moai-codex-integration Skill 작성 | 15분 |
| 5 | 통합 테스트 | 10분 |
| **합계** | | **55분** |

---

## 구현 순서

```
1. ToolSearch("codex")
   ↓
2. mcp__codex__* 직접 호출 테스트
   ↓
3. .claude/agents/moai/expert-codex.md 작성
   ↓
4. .claude/skills/moai-codex-integration.md 작성
   ↓
5. Task("expert-codex") 테스트
```
