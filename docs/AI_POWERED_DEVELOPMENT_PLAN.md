# AI 기반 PLM 시스템 개발 계획서
## Teams Mode + Worktree + MCP 통합 워크플로우

**버전**: 2.0
**작성일**: 2026-02-16
**프로젝트**: PLM System Web
**개발 방법론**: Hybrid (TDD for new, DDD for legacy)

---

## 1. 개요

### 1.1 목표

**Claude Code (MoAI)**, **Codex**, **Pencil**이 각자의 전문 영역에서 협업하여 최고의 코드 품질 결과물을 생성하는 AI 기반 개발 시스템 구축.

### 1.2 핵심 도구 및 역할

| 도구 | 주요 역할 | MCP 연동 |
|------|-----------|----------|
| **Claude Code (MoAI)** | 프로젝트 오케스트레이션, SPEC 관리, 에이전트 조정 | Sequential Thinking, Context7 |
| **Pencil** | UI/UX 디자인 시스템, 디자인 토큰 관리 | Pencil MCP |
| **Codex** | 코드 생성, 컴포넌트 구현 | Codex MCP |
| **Teams Mode** | 병렬 작업 실행, 에이전트 팀 코디네이션 | Agent Teams API |

---

## 2. AI 도구별 상세 역할 분배

### 2.1 Claude Code (MoAI) - 전략적 오케스트레이터

**주요 책임:**
- **SPEC 문서 관리**: EARS 형식 요구사항 정의
- **에이전트 팀 코디네이션**: Teams Mode를 통한 병렬 작업 관리
- **품질 게이트**: TRUST 5 프레임워크 검증
- **Git 워크플로우**: worktree 기반 브랜치 관리

**사용 MCP:**
- **Sequential Thinking**: 복잡한 아키텍처 결정, 기술 트레이드오프 분석
- **Context7**: Next.js, tRPC, Drizzle 문서 검색

### 2.2 Pencil - UI/UX 디자인 전문가

**주요 책임:**
- **디자인 시스템 설계**: 색상, 타이포그래피, 스페이스 정의
- **와이어프레임 생성**: 페이지 레이아웃, 컴포넌트 구조
- **디자인 토큰 관리**: 일관된 디자인 언어 유지
- **프로토타이핑**: 인터랙티브 UI 설계

**담당 에이전트**: `team-designer` (Teams Mode)

### 2.3 Codex - 코드 생성 전문가

**주요 책임:**
- **컴포넌트 구현**: Pencil 디자인을 React/Next.js 코드로 변환
- **API 엔드포인트**: tRPC 프로시저, DB 스키마 생성
- **테스트 코드**: Vitest 단위 테스트, Playwright E2E 테스트
- **리팩토링**: 코드 품질 개선, 성능 최적화

**사용 시점**: `team-backend-dev`, `team-frontend-dev`가 코드 생성 필요 시 호출

---

## 3. Teams Mode 기반 개발 워크플로우

### 3.1 Plan Phase (계획 단계)

**팀 구성**: 3명의 병렬 연구원

```yaml
plan_research:
  roles:
    - researcher:    # 코드베이스 탐색 (haiku)
    - analyst:       # 요구사항 분석
    - architect:     # 기술 설계
```

**작업 흐름:**
1. **TeamCreate**: `moai-plan-{feature-slug}` 팀 생성
2. **병렬 연구**: 3명의 팀원이 동시에 작업
3. **결과 종합**: MoAI가 연구 결과를 SPEC 문서로 정리
4. **팀 정리**: 모든 팀원 shutdown 후 TeamDelete
5. **컨텍스트 정리**: `/clear` 실행

**생산물**: `.moai/specs/SPEC-XXX/spec.md`

### 3.2 Run Phase (구현 단계)

**팀 구성**: 4명의 병렬 구현원

```yaml
design_implementation:
  roles:
    - designer:       # Pencil MCP를 통한 UI/UX 설계
    - backend-dev:    # tRPC, Drizzle ORM 구현
    - frontend-dev:   # React 컴포넌트 구현
    - tester:         # 테스트 작성 및 실행
```

**파일 소유권 (Write 충돌 방지):**

| 역할 | 소유 파일 패턴 |
|------|---------------|
| designer | `**/*.pen`, `src/lib/design-tokens.ts` |
| backend-dev | `src/server/**/*`, `src/modules/**/server.ts` |
| frontend-dev | `src/app/**/*.tsx`, `src/components/**/*.tsx` |
| tester | `tests/**/*`, `**/*.test.ts`, `**/*.spec.ts` |

**작업 흐름:**
1. **TeamCreate**: `moai-run-{feature-slug}` 팀 생성
2. **TaskCreate**: 구현 작업을 TaskList에 등록
3. **병렬 구현**: 팀원이 자율적으로 Task를 Claim하고 수행
4. **품질 검증**: `team-quality`가 TRUST 5 검증
5. **팀 정리**: 모든 팀원 shutdown 후 TeamDelete

**사용 MCP:**
- designer: Pencil MCP
- backend-dev: Context7 (Drizzle, tRPC 문서)
-tester: 없음

### 3.3 Sync Phase (동기화 단계)

**담당**: `manager-docs` (단일 에이전트)

**작업:**
- API 문서 생성
- README 업데이트
- CHANGELOG 작성
- PR 생성

---

## 4. Worktree 기반 브랜치 전략

### 4.1 Worktree 구조

```bash
# 메인 작업 공간
D:\workspace-github\plm-system-web/          # main 브랜치

# 기능별 Worktree
D:\workspace-github\plm-system-web-worktree\
├── feature-authentication/      # 인증 기능
├── feature-plm-bom/            # PLM BOM 관리
├── feature-issue-tracking/     # 이슈 추적
├── feature-dashboard/          # 대시보드
└── feature-notifications/      # 알림 시스템
```

### 4.2 Worktree 생성 워크플로우

**Plan Phase 전:**
```bash
# 1. Worktree 생성
git worktree add ../plm-system-web-worktree/feature-{name} -b feature/{name}

# 2. 작업 디렉토리 이동
cd ../plm-system-web-worktree/feature-{name}

# 3. SPEC 문서 생성 (/moai plan)
# ... Plan Phase 진행 ...

# 4. 컨텍스트 정리
/clear

# 5. 구현 시작 (/moai run SPEC-XXX)
# ... Run Phase 진행 ...
```

**구현 완료 후:**
```bash
# 1. Worktree로 이동
cd ../plm-system-web-worktree/feature-{name}

# 2. Sync Phase 실행 (/moai sync SPEC-XXX)
# ... 문서화, PR 생성 ...

# 3. Worktree 정리
cd ../plm-system-web
git worktree remove ../plm-system-web-worktree/feature-{name}
```

---

## 5. 개발 방법론 (Hybrid Mode)

### 5.1 Hybrid 모드 설정

```yaml
# .moai/config/sections/quality.yaml
development_mode: "hybrid"

hybrid_settings:
  new_features: tdd        # 새 코드: RED-GREEN-REFACTOR
  legacy_refactoring: ddd  # 기존 코드: ANALYZE-PRESERVE-IMPROVE
  min_coverage_new: 85     # 신규 코드 커버리지
  min_coverage_legacy: 85  # 리팩토링 코드 커버리지
```

### 5.2 TDD 사이클 (새 코드)

**team-tester**가 주도:
1. **RED**: 실패하는 테스트 작성
2. **GREEN**: 최소한의 코드로 테스트 통과
3. **REFACTOR**: 코드 품질 개선

### 5.3 DDD 사이클 (기존 코드)

**backend-dev/frontend-dev**가 주도:
1. **ANALYZE**: 기존 동작 분석
2. **PRESERVE**: 특성 테스트 작성 (동작 보존)
3. **IMPROVE**: 기능 개선

---

## 6. MCP 서버 활용 전략

### 6.1 Sequential Thinking MCP

**사용 시점:**
- 아키텍처 결정 전
- 기술 스택 선택 시
- 복잡한 버그 분석 시
- 성능 최적화 계획 시

**활성화 방법:** `--ultrathink` 플래그

### 6.2 Context7 MCP

**사용 시점:**
- Next.js 15 기능 확인 시
- tRPC 프로시저 작성 시
- Drizzle ORM 쿼리 작성 시
- React 19 패턴 적용 시

### 6.3 Pencil MCP

**사용 시점:**
- 새로운 페이지 설계 시
- 컴포넌트 디자인 시스템 정의 시
- 디자인 토큰 업데이트 시

**담당 에이전트:** `team-designer`

### 6.4 Codex MCP

**사용 시점:**
- Pencil 디자인을 코드로 변환 시
- 반복적인 CRUD 코드 생성 시
- 테스트 코드 작성 시

**호출 방법:** `mcp__codex__codex` 툴 사용

---

## 7. 품질 관리 (TRUST 5)

### 7.1 TRUST 5 차원

| 차원 | 검증 항목 | 책임자 |
|------|-----------|--------|
| **Tested** | 85%+ 커버리지, 단위/E2E 테스트 | team-tester |
| **Readable** | 명명 규칙, 영어 주석, LSP 통과 | team-quality |
| **Unified** | 일관된 스타일, Biome 포맷팅 | team-quality |
| **Secured** | OWASP 준수, 입력 검증 | team-quality |
| **Trackable** | 커밋 메시지, 이슈 연결 | MoAI |

### 7.2 LSP 품질 게이트

```yaml
# .moai/config/sections/quality.yaml
lsp_quality_gates:
  run:
    max_errors: 0
    max_type_errors: 0
    max_lint_errors: 0
    allow_regression: false
```

---

## 8. 첫 번째 기능: 인증 시스템

### 8.1 SPEC 문서: SPEC-AUTH-001

**기능:** 사용자 인증 및 권한 관리

**EARS 요구사항:**
1. **WHEN** 사용자가 이메일과 비밀번호를 입력하고 로그인 버튼을 클릭하면, **THE SYSTEM SHALL** 유효한 자격증명을 확인하고 JWT 토큰을 발급한다.
2. **WHEN** 인증되지 않은 사용자가 보호된 리소스에 접근하려고 하면, **THE SYSTEM SHALL** 401 Unauthorized를 반환한다.
3. **IF** 사용자가 관리자 역할을 가지고 있으면, **THE SYSTEM SHALL** 관리자 대시보드에 접근을 허용한다.

**수용 기준:**
- 이메일 중복 검증
- 비밀번호 해싱 (bcrypt)
- JWT 토큰 만료 관리
- 역할 기반 접근 제어 (RBAC)

### 8.2 Teams Mode 작업 분배

**Plan Phase:**
- researcher: `src/modules/identity/` 코드베이스 분석
- analyst: 인증 요구사항, 보안 기준 분석
- architect: JWT 세션 관리, RBAC 아키텍처 설계

**Run Phase:**
- designer: 로그인/회원가입 페이지 Pencil 디자인
- backend-dev: tRPC 인증 프로시저, Drizzle 스키마
- frontend-dev: React 컴포넌트, Zustand 인증 스토어
- tester: Vitest 단위 테스트, Playwright E2E

---

## 9. 실행 가이드

### 9.1 첫 기능 개발 시작

```bash
# 1. Worktree 생성
git worktree add ../plm-system-web-worktree/feature-authentication -b feature/authentication

# 2. 작업 디렉토리 이동
cd ../plm-system-web-worktree/feature-authentication

# 3. Plan Phase (Teams Mode)
/moai plan --team "사용자 인증 시스템 구현"

# 4. Run Phase (Teams Mode)
/moai run --team SPEC-AUTH-001

# 5. Sync Phase
/moai sync SPEC-AUTH-001

# 6. 메인으로 병귀
cd ../plm-system-web
git merge feature/authentication
git worktree remove ../plm-system-web-worktree/feature-authentication
```

### 9.2 Teams Mode 플래그

| 플래그 | 동작 |
|--------|------|
| `--team` | Teams Mode 강제 |
| `--solo` | Sub-agent Mode 강제 |
| 없음 | 자동 선택 (복잡도 기반) |

---

## 10. 성공 지표

### 10.1 개발 생산성
- SPEC 문서 자동화
- 병렬 구현으로 개발 시간 단축
- 반복 작업 자동화

### 10.2 코드 품질
- 85%+ 테스트 커버리지 유지
- LSP 에러 0개 유지
- TRUST 5 준수

### 10.3 디자인 일관성
- Pencil 디자인 토큰 준수
- 컴포넌트 재사용성
- 접근성 (WCAG 2.1 AA)

---

## 부록 A: 에이전트 팀 레퍼런스

### A.1 Plan Phase 팀

| 역할 | 모델 | 모드 | 책임 |
|------|------|------|------|
| researcher | haiku | plan (read-only) | 코드베이스 탐색 |
| analyst | inherit | plan (read-only) | 요구사항 분석 |
| architect | inherit | plan (read-only) | 기술 설계 |

### A.2 Run Phase 팀

| 역할 | 모델 | 모드 | 책임 | 전용 MCP |
|------|------|------|------|----------|
| designer | inherit | acceptEdits | UI/UX 설계 | Pencil |
| backend-dev | inherit | acceptEdits | 서버 구현 | Context7 |
| frontend-dev | inherit | acceptEdits | 클라이언트 구현 | Context7 |
| tester | inherit | acceptEdits | 테스트 작성 | 없음 |
| quality | inherit | plan (read-only) | 품질 검증 | 없음 |

---

## 부록 B: MCP 서버 설정

### B.1 현재 활성화된 MCP 서버

```json
// C:\Users\user\.mcp.json
{
  "mcpServers": {
    "context7": { ... },
    "sequential-thinking": { ... },
    "pencil": { ... },
    "codex": {
      "command": "codex.exe",
      "args": ["mcp-server"],
      "connectionTimeout": 60000
    }
  }
}
```

### B.2 Teams Mode 필수 설정

```json
// settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

```yaml
# .moai/config/sections/workflow.yaml
workflow:
  team:
    enabled: true
    max_teammates: 10
    delegate_mode: true
```

---

**문서 버전**: 2.0
**마지막 업데이트**: 2026-02-16
**유지 관리자**: MoAI Orchestrator
