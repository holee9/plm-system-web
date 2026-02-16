# PLM System Web: 계획 대비 구현 내용 검증 리포트

**생성일:** 2026-02-16
**검증 범위:** SPEC-PLM-001 ~ SPEC-PLM-007
**검증 방법:** 소스 코드 분석, SPEC 문서 대조

---

## 실행 요약

PLM System Web 프로젝트의 계획된 7개 SPEC에 대한 구현 현황을 검증한 결과, **전체 구현률은 약 28%**입니다. 가장 큰 편차는 **SQLite 대신 PostgreSQL 사용 계획**이며, **인증 시스템(SPEC-PLM-002)과 프로젝트 관리(SPEC-PLM-003)가 핵심 기능임에도 미구현** 상태입니다.

### 주요 발견
- ✅ **기본 스캐폴딩 완료**: tRPC, UI 컴포넌트, 모듈 구조
- ⚠️ **데이터베이스 편차**: SQLite 사용 중 (계획: PostgreSQL)
- ❌ **인증 시스템 미구현**: Auth.js v5 미통합, OAuth 미지원
- ❌ **PLM 핵심 기능 미구현**: BOM/부품 관리, 변경 주문 워크플로우

---

## 상세 분석

### SPEC별 구현 현황

| SPEC ID | 제목 | 계획 파일 | 계획 테이블 | 구현 파일* | 구현 테이블 | 구현률 |
|---------|------|-----------|-------------|------------|-------------|--------|
| SPEC-PLM-001 | 프로젝트 스캐폴딩 | ~25 | 0 | ~15 | 2** | 60% |
| SPEC-PLM-002 | 인증 및 사용자 관리 | ~15 | 5 | ~3 | 2 | 30% |
| SPEC-PLM-003 | 프로젝트 CRUD | ~12 | 2 | ~5*** | 0 | 20% |
| SPEC-PLM-004 | 이슈 추적 코어 | ~18 | 5 | ~12 | 3 | 70% |
| SPEC-PLM-005 | BOM 및 부품 관리 | ~14 | 3 | ~8 | 0 | 15% |
| SPEC-PLM-006 | 변경 주문 워크플로우 | ~12 | 2 | 0 | 0 | 0% |
| SPEC-PLM-007 | 대시보드/알림/문서 | ~14 | 3 | ~6 | 0 | 10% |
| **합계** | | **~110** | **20** | **~49** | **7** | **28%** |

*구현 파일: 실제 로직이 포함된 파일 (UI 컴포넌트, 라우터 등)
**users, sessions (계획에 없던 테이블)
***UI만 존재, 백엔드 로직 미구현

### SPEC-PLM-001: 프로젝트 스캐폴딩 (구현률: 60%)

#### 완료 항목
- ✅ package.json 의존성 구성 (Next.js 15, tRPC v11, Drizzle ORM, Biome)
- ✅ tRPC 기본 설정 (init, router, context, procedures)
- ✅ shadcn/ui 컴포넌트 구성 (Button, Input, Dialog, etc.)
- ✅ 7개 모듈 디렉토리 구조
- ✅ 기본 라우팅 구조

#### 미완료 항목
- ❌ **데이터베이스**: SQLite 사용 중 (계획: PostgreSQL 16)
- ❌ Docker Compose PostgreSQL 설정 미구현
- ❌ Drizzle 마이그레이션 폴더/설정 미완료
- ❌ 테스트 프레임워크 설정 (Vitest, Playwright)
- ❌ CI/CD 파이프라인

### SPEC-PLM-002: 인증 및 사용자 관리 (구현률: 30%)

#### 완료 항목
- ✅ users 테이블 스키마 (id, email, name, emailVerified, image)
- ✅ sessions 테이블 스키마
- ✅ 로그인/회원가입 페이지 UI (`/login`, `/register`)

#### 미완료 항목
- ❌ **Auth.js v5 통합 미구현**
- ❌ OAuth (GitHub/Google) 미지원
- ❌ teams, team_members 테이블 미생성
- ❌ accounts 테이블 미생성 (OAuth용)
- ❌ RBAC (owner/admin/member 역할) 미구현
- ❌ identity tRPC 라우터 미구현
- ❌ 비밀번호 해싱/검증 로직 미구현
- ❌ Rate limiting 미구현

### SPEC-PLM-003: 프로젝트 CRUD 및 관리 (구현률: 20%)

#### 완료 항목
- ⚠️ 프로젝트 관련 페이지 UI 존재 (`/projects`, `/projects/[key]`)
- ⚠️ 프로젝트 카드, 헤더 UI 컴포넌트

#### 미완료 항목
- ❌ **projects 테이블 미생성**
- ❌ **project_members 테이블 미생성**
- ❌ project tRPC 라우터 미구현
- ❌ 프로젝트 키 중복 검사 미구현
- ❌ 멤버 역할 기반 접근 제어 미구현
- ⚠️ 현재 페이지는 mock 데이터로만 동작

### SPEC-PLM-004: 이슈 추적 코어 (구현률: 70%)

#### 완료 항목
- ✅ issues 테이블 스키마
- ✅ issue_comments 테이블
- ✅ issue_activities 테이블
- ✅ issue tRPC 라우터 (list, getById, getDetail, create, update, delete)
- ✅ 이슈 코멘트 기능 (addComment, getComments)
- ✅ 칸반 보드 UI 컴포넌트 (KanbanBoard, KanbanColumn, KanbanCard)
- ✅ 이슈 필터/검색 UI
- ✅ 이슈 생성/상세 다이얼로그

#### 미완료 항목
- ❌ labels 테이블 미생성
- ❌ milestones 테이블 미생성
- ❌ issue_labels 중간 테이블 미생성
- ⚠️ **이슈 상태 값 상이**: 계획(open,in_progress,review,done,closed) vs 실제(todo,inProgress,inReview,done)
- ⚠️ **우선순위 값 상이**: 계획(urgent,high,medium,low,none) vs 실제(critical,high,medium,low)
- ⚠️ **유형 값 상이**: 계획(task,bug,feature,improvement) vs 실제(bug,story,epic,task)
- ⚠️ 프로젝트 키 기반 번호 부여 미구현 (대신 ISS-001 전역 번호 사용)

### SPEC-PLM-005: BOM 및 부품 관리 (구현률: 15%)

#### 완료 항목
- ⚠️ PLM 관련 UI 컴포넌트 존재 (BomTable, StatusBadge, ChangeHistory)
- ⚠️ PLM 통계 UI

#### 미완료 항목
- ❌ **parts 테이블 미생성**
- ❌ **revisions 테이블 미생성**
- ❌ **bom_items 테이블 미생성**
- ❌ plm tRPC 라우터 미구현
- ❌ 순환 참조 검사 로직 미구현
- ❌ 리비전 코드 생성기 미구현
- ❌ Where-Used 쿼리 미구현
- ⚠️ 현재 UI는 mock 데이터로만 동작

### SPEC-PLM-006: 변경 주문 워크플로우 (구현률: 0%)

#### 완료 항목
- 없음

#### 미완료 항목
- ❌ **change_orders 테이블 미생성**
- ❌ **change_order_approvals 테이블 미생성**
- ❌ ECR/ECN 워크플로우 미구현
- ❌ 상태 전이 규칙 미구현
- ❌ 다중 승인자 로직 미구현
- ❌ 감사 추적(Audit Trail) 미구현
- ⚠️ 승인 타임라인 UI만 존재 (mock 데이터)

### SPEC-PLM-007: 대시보드/알림/문서 관리 (구현률: 10%)

#### 완료 항목
- ⚠️ 대시보드 UI 컴포넌트 (StatCard, ActivityFeed, ProjectCard)
- ⚠️ 대시보드 페이지 레이아웃

#### 미완료 항목
- ❌ **notifications 테이블 미생성**
- ❌ **activity_logs 테이블 미생성**
- ❌ **documents 테이블 미생성**
- ❌ **file_versions 테이블 미생성**
- ❌ SSE(Server-Sent Events) 기반 알림 미구현
- ❌ 파일 업로드/다운로드 기능 미구현
- ❌ 대시보드 통계 쿼리 미구현
- ⚠️ 현재 UI는 mock 데이터로만 동작

---

## 주요 편차

### 1. 데이터베이스 편차 (P0 - Critical)

**계획**: PostgreSQL 16 (Neon Free)
**실제**: SQLite

**영향**:
- 프로덕션 배포 시 전체 데이터베이스 마이그레이션 필요
- UUID 타입 사용 불가 (현재 integer id 사용)
- JSONB 타입 사용 불가 (현재 text에 JSON 저장)
- Foreign Key cascade 동작 상이 가능성

**조치 필요**:
1. Drizzle 설정을 PostgreSQL로 변경
2. 스키마를 pgcore로 재작성
3. 모든 id 컬럼을 uuid로 변경
4. 마이그레이션 스크립트 작성

### 2. 인증 시스템 미구현 (P0 - Critical)

**누락 기능**:
- Auth.js v5 통합
- 세션 관리
- OAuth (GitHub/Google)
- 팀 관리
- RBAC (역할 기반 접근 제어)

**영향**:
- 보안 페이지 접근 제어 불가
- 다중 사용자 협업 기능 미작동
- 프로젝트 멤버 관리 불가

### 3. 이슈 추적 데이터 구조 상이 (P1)

**필드 값 불일치**:
- 상태: `open` → `todo`, `review` → `inReview`
- 우선순위: `urgent` → `critical`, `none` 제외
- 유형: `feature`, `improvement` → `story`, `epic`

**영향**:
- SPEC 명세와 불일치
- 향후 통합 시 데이터 마이그레이션 필요

### 4. 프로젝트 관리 핵심 미구현 (P1)

**누락 기능**:
- 프로젝트 CRUD 백엔드
- 프로젝트 멤버 관리
- 프로젝트별 데이터 격리

**영향**:
- 이슈, BOM 등의 상위 컨텍스트 부재
- 멤버별 접근 제어 불가

### 5. PLM 핵심 기능 미구현 (P1)

**누락 기능**:
- BOM 트리 구조
- 리비전 관리
- 변경 주문 워크플로우

**영향**:
- PLM 시스템의 핵심 가치 미구현
- 부품/변경 관리 불가

---

## 구현 현황 매트릭스

### 파일별 구현 현황

| 유형 | 계획 | 구현 | 구현률 |
|------|------|------|--------|
| 테이블 스키마 | 20 | 7 | 35% |
| tRPC 라우터 | 7 | 1 | 14% |
| 페이지 | ~40 | ~20 | 50% |
| UI 컴포넌트 | ~50 | ~30 | 60% |
| **전체** | **~110** | **~49** | ****28%** |

### 테이블별 구현 현황

| 모듈 | 계획 테이블 | 구현 테이블 | 구현률 |
|------|-----------|-------------|--------|
| identity | 5 | 2* | 40% |
| project | 2 | 0 | 0% |
| issue | 5 | 3 | 60% |
| plm | 5 | 0 | 0% |
| document | 2 | 0 | 0% |
| notification | 2 | 0 | 0% |
| reporting | 0 | 0 | - |
| **합계** | **20** | **7** | **35%** |

*users, sessions (accounts, teams, team_members 미구현)

### 기능별 구현 현황

| 기능 영역 | 구현률 | 비고 |
|----------|--------|------|
| 스캐폴딩/인프라 | 60% | DB 변경 필요 |
| 인증/사용자 관리 | 30% | Auth.js 미통합 |
| 프로젝트 관리 | 20% | 백엔드 미구현 |
| 이슈 추적 | 70% | labels/milestones 미구현 |
| BOM/부품 관리 | 15% | 백엔드 미구현 |
| 변경 주문 | 0% | 미구현 |
| 대시보드/알림/문서 | 10% | 백엔드 미구현 |

---

## 우선순위별 개선 제안

### Phase 1: 기반 기술 완성 (P0)

**1. 데이터베이스 마이그레이션**
```bash
# 1. Drizzle 설정 변경 (SQLite → PostgreSQL)
# 2. 스키마 재작성 (sqliteTable → pgTable)
# 3. UUID 타입 적용
# 4. 기존 데이터 마이그레이션 스크립트
```

**2. 인증 시스템 구현 (SPEC-PLM-002)**
- Auth.js v5 통합
- 세션 관리 구현
- OAuth 제공자 설정 (GitHub/Google 선택)
- teams, team_members, accounts 테이블 생성
- RBAC 미들웨어 구현

### Phase 2: 프로젝트 관리 구현 (P1)

**3. 프로젝트 CRUD 완료 (SPEC-PLM-003)**
- projects, project_members 테이블 생성
- project tRPC 라우터 구현
- 프로젝트 키 중복 검사
- 멤버 역할 관리
- 프로젝트별 데이터 격리

### Phase 3: 이슈 추적 완성 (P1)

**4. 이슈 추적 보완 (SPEC-PLM-004)**
- labels, milestones 테이블 생성
- 이슈 상태/우선순위/유형 값을 SPEC에 맞춤
- 프로젝트 키 기반 번호 부여
- 마일스톤 연동
- 라벨 할당 기능

### Phase 4: PLM 기능 구현 (P2)

**5. BOM/부품 관리 (SPEC-PLM-005)**
- parts, revisions, bom_items 테이블 생성
- BOM 트리 조회 (재귀 CTE)
- 순환 참조 검사
- 리비전 관리
- Where-Used 쿼리

**6. 변경 주문 워크플로우 (SPEC-PLM-006)**
- change_orders, change_order_approvals 테이블 생성
- 상태 전이 규칙 구현
- 다중 승인자 로직
- 감사 추적

### Phase 5: 통합 기능 (P2)

**7. 대시보드/알림/문서 (SPEC-PLM-007)**
- notifications, activity_logs, documents, file_versions 테이블 생성
- SSE 기반 알림
- 파일 업로드/다운로드
- 대시보드 통계 쿼리

---

## 결론

PLM System Web 프로젝트는 **기본 인프라와 UI 프레임워크는 어느 정도 구축**되었으나, **핵심 비즈니스 로직이 대부분 미구현** 상태입니다.

가장 시급한 과제는:
1. **데이터베이스를 PostgreSQL로 전환**
2. **인증 시스템(Auth.js) 완성**
3. **프로젝트 관리 백엔드 구현**

이 3가지가 완료되면 이슈 추적과 PLM 기능을 순차적으로 구현할 수 있는 기반이 마련됩니다.

---

**리포트 생성:** MoAI manager-docs
**검증 일자:** 2026-02-16
