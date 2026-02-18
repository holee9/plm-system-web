# Plan: 프로젝트 리뷰후 작업목록 업데이트

## Context

PLM System Web 프로젝트는 현재 Phase 3 (PLM Workflows) ~95% 완료 상태입니다. P1(필수)과 P2(중요) 우선순위 작업은 모두 완료되었으며, 현재 다음과 같은 변경사항이 축적되어 있습니다:

1. **SSE (Server-Sent Events) 실시간 알림 구현 완료**
   - `/api/sse/notifications` 엔드포인트 생성
   - `use-sse-notifications.ts` Hook 구현
   - 인증 연동 완료

2. **변경 주문(Component) 필터링 기능 추가**
   - 우선순위 필터 UI
   - 고급 필터 패널 토글

3. **대시보드 기간 선택 기능 추가**
   - 기간 선택 UI (전체, 7일, 30일, 3개월, 1년)
   - 차트 인터랙티브 필터링

4. **프로젝트 관련 테스트 파일 추가**
   - 통합 테스트 (integration/project/)
   - 단위 테스트 (unit/project/)
   - 서비스 테스트 (src/modules/project/__tests__/)

이 계획은 축적된 변경사항을 정리하고, 남은 P3(선택사항) 작업을 위한 명확한 작업 목록을 작성하는 것을 목표로 합니다.

---

## Current State Analysis

### Completed Work (P1 + P2)

| 영역 | 완료된 기능 | 파일 |
|------|-----------|------|
| **SSE 알림** | 실시간 알림, 연결 상태 표시, 인증 연동 | `src/app/api/sse/notifications/route.ts`, `src/hooks/use-sse-notifications.ts` |
| **변경 주문** | 필터링, 검색, 우선순위 필터 | `change-order-list-client.tsx`, `change-order-list.tsx` |
| **대시보드** | 기간 선택, 차트 필터링, 통계 데이터 연동 | `dashboard-client.tsx` |
| **테스트** | 프로젝트 통합/단위 테스트 추가 | `tests/integration/project/`, `tests/unit/project/`, `src/modules/project/__tests__/` |

### Teammate Findings Summary

**Researcher (코드베이스 탐색 완료):**
- SSE 엔드포인트 구현 상태: Core 구현 완료, Connection pooling 필요
- 클라이언트 Hook 구현 상태: 완료, Exponential backoff 필요
- 12개 프로젝트 테스트 파일 추가됨
- Coverage 상태: 검증 필요

**Analyst (요구사항 분석 완료):**
- 4개 사용자 스토리 정의됨:
  1. SSE Notification System Completion
  2. Change Order List Component Enhancement
  3. Project Dashboard Improvements
  4. Test Coverage Expansion
- 9개 작업 항목 식별됨 (High: 4, Medium: 2, Low: 3)
- 주요 발견: SSE connection pooling 필요, 필터 URL 동기화 필요

**Architect (기술 설계 완료):**
- 3단계 접근법 제안: Assessment → Stabilization → Continuation
- SPEC-PLM-TASK-UPDATE 구조 제안
- 파일 영향 분석 완료

### Immediate Work Items (Teammate Identified)

**High Priority:**
1. Test Coverage Verification - 기존 테스트 통과 및 85%+ 커버리지 확인
2. SSE Endpoint Tests - `/api/sse/notifications` 라우트 테스트 추가
3. SSE Connection Pooling - 다중 탭 처리 (최대 5 연결)
4. SSE Exponential Backoff - 재연결 로직 개선

**Medium Priority:**
5. Change Order URL Sync - 필터를 URL 쿼리 파라미터와 동기화
6. SSE Hook Tests - `use-sse-notifications.ts` Hook 테스트

**Low Priority:**
7. Dashboard URL Sync - 날짜 범위를 URL과 동기화
8. Dashboard Error Boundaries - 위젯 에러 핸들링 추가
9. Final Coverage Verification - 모든 변경 후 85%+ 커버리지 확인

### Remaining Work (P3 - Optional)

다음 P3 선택적 기능들이 남아 있습니다 (총 ~18시간 예상):

| ID | 기능 | 영역 | 예상 시간 |
|----|------|------|-----------|
| C-003 | 변경 주문 내보내기 (CSV, PDF) | 변경주문 | 3h |
| C-004 | 일괄 처리 대량 승인/거부 | 변경주문 | 2h |
| D-006 | 알림 설정 (푸시, 이메일) | 알림 | 3h |
| D-010 | 문서 미리보기 (PDF, 이미지) | 문서 | 3h |
| D-011 | 버전 간 비교 UI | 문서 | 4h |
| D-015 | 사용자 지정 대시보드 (위젯 배치) | 대시보드 | 6h |

---

## Recommended Approach

### Phase 1: 현재 변경사항 정리 및 커밋

축적된 변경사항을 체계적으로 커밋하고, 프로젝트 문서를 업데이트합니다.

**Tasks:**

1. **테스트 실행 및 검증**
   - 모든 단위 테스트 실행 (`npm test`)
   - 통합 테스트 실행 (`npm run test:e2e`)
   - 타입 검사 (`npm run typecheck`)
   - 린트 검사 (`npm run lint`)

2. **변경사항 커밋**
   - SSE 알림 구현 커밋
   - 변경 주문 필터링 커밋
   - 대시보드 기간 선택 커밋
   - 테스트 파일 추가 커밋

3. **문서 업데이트**
   - README.md 최신화
   - CHANGELOG.md 업데이트

### Phase 2: P3 선택적 기능 구현 (선택사항)

P3 기능들은 프로젝트 요구사항에 따라 선택적으로 구현할 수 있습니다.

**추천 구현 순서:**

1. **문서 고급 기능** (D-010, D-011) - 7시간
   - 문서 미리보기 기능은 사용자 경험 향상에 직접적인 영향
   - 버전 간 비교는 PLM 시스템의 핵심 기능

2. **변경 주문 내보내기** (C-003, C-004) - 5시간
   - CSV/PDF 내보내기는 보고서 생성에 유용
   - 일괄 처리는 대량 작업 효율성 향상

3. **알림 설정** (D-006) - 3시간
   - 푸시/이메일 알림 설정은 사용자 맞춤형 경험 제공

4. **사용자 지정 대시보드** (D-015) - 6시간
   - 위젯 배치 기능은 고급 사용자 경험 제공

### Phase 3: 검증 및 배포 준비

모든 변경사항을 검증하고 배포를 준비합니다.

**Tasks:**

1. **품질 검증**
   - TRUST 5 품질 게이트 통과 확인
   - 코드 커버리지 85%+ 달성 확인
   - 보안 검증 (OWASP)

2. **성능 최적화**
   - SSE 연결 관리 최적화
   - 대시보드 쿼리 성능 검증

3. **배포 준비**
   - Docker 이미지 빌드
   - 배포 체크리스트 확인

---

## Critical Files to Modify

### 현재 상태 정리 관련

1. **README.md** - 최신 구현 현황 반영
2. **CHANGELOG.md** - 새로운 기능들 기록

### P3 기능 구현 관련 (선택사항)

1. **변경 주문 내보내기**
   - `src/modules/change-order/export.ts` (NEW)
   - `src/components/changes/export-dialog.tsx` (NEW)
   - `src/modules/change-order/router.ts` (MODIFY)

2. **문서 미리보기**
   - `src/app/projects/[key]/documents/preview/[...id]/page.tsx` (NEW)
   - `src/components/document/document-preview.tsx` (NEW)

3. **알림 설정**
   - `src/app/settings/notifications/page.tsx` (NEW)
   - `src/modules/notification/settings.ts` (NEW)

---

## Verification Plan

### Phase 1 검증 (현재 상태 정리)

```bash
# 테스트 실행
npm test                      # 단위 테스트
npm run test:e2e             # 통합 테스트

# 코드 품질 검사
npm run typecheck            # 타입 검사
npm run lint                 # 린트 검사

# SSE 연결 테스트
# 1. 로그인 후 SSE 연결 확인
# 2. 알림 생성 시 실시간 수신 확인
# 3. 연결 끊김 시 재연결 확인
```

### Phase 2 검증 (P3 기능)

각 P3 기능에 대한 E2E 테스트 작성:
- 문서 미리보기: PDF/이미지 렌더링 확인
- 변경 주문 내보내기: CSV/PDF 다운로드 확인
- 알림 설정: 설정 저장 및 적용 확인

---

## Dependencies & Constraints

### Dependencies
- SSE 알림 기능은 인증 시스템 의존
- 대시보드 차트는 데이터베이스 쿼리 성능 의존

### Constraints
- P3 기능은 선택사항으로, 프로젝트 우선순위에 따라 구현 결정
- SSE 연결 수는 서버 리소스 제한 고려

---

## Success Criteria

1. **Phase 1 완료 기준**
   - 모든 테스트 통과 (단위 + 통합)
   - 타입 에러 0개, 린트 에러 0개
   - SSE 알림 실시간 작동 확인
   - 문서 최신화 완료

2. **Phase 2 완료 기준** (선택사항)
   - 선택된 P3 기능들 구현 완료
   - 각 기능 E2E 테스트 통과

3. **Phase 3 완료 기준**
   - TRUST 5 품질 게이트 통과
   - 커버리지 85%+ 달성
   - 배포 준비 완료

---

## User Decision

**선택된 옵션: 전체 구현 (Phase 1 + 모든 P3)**

사용자가 전체 구현을 선택하여, 다음 작업을 순차적으로 진행합니다:

1. **Phase 1 (즉시 실행)**: 현재 변경사항 정리 및 커밋
   - SSE 알림, 필터링, 대시보드 변경사항 커밋
   - 테스트 실행 및 검증
   - 문서 업데이트

2. **Phase 2 (선택된 P3 전체 구현)**: 모든 P3 선택적 기능 구현
   - C-003, C-004: 변경 주문 내보내기 및 일괄 처리 (5h)
   - D-010, D-011: 문서 미리보기 및 버전 비교 (7h)
   - D-006: 알림 설정 (3h)
   - D-015: 사용자 지정 대시보드 (6h)
   - **총 예상 시간: 약 21시간**

3. **Phase 3 (마지막 단계)**: 검증 및 배포 준비

각 Phase 완료 후 사용자 승인을 받아 다음 Phase로 진행합니다.

---

## Execution Order

### SPEC 생성 계획

전체 구현을 위해 다음과 같이 SPEC 문서를 생성합니다:

1. **SPEC-PLM-008**: 현재 변경사항 정리 (Phase 1)
2. **SPEC-PLM-009**: P3 변경 주문 고급 기능 (C-003, C-004)
3. **SPEC-PLM-010**: P3 문서 고급 기능 (D-010, D-011)
4. **SPEC-PLM-011**: P3 알림 설정 (D-006)
5. **SPEC-PLM-012**: P3 사용자 지정 대시보드 (D-015)

각 SPEC은 `/moai run` 명령으로 순차적으로 실행됩니다.
