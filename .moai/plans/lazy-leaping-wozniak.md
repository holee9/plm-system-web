# PLM System Web - 남은 구현 계획

## Context

PLM System Web 프로젝트는 7개 SPEC으로 구성된 제품 수명 주기 관리 시스템입니다. 현재 전체 진행률은 약 75%이나, **핵심 기능들의 완성도**, **테스트 커버리지**, **보안** 등에서 중요한 갭이 존재합니다.

### 현재 상태 요약

| SPEC | 완료율 | 상태 | 주요 미구현 |
|------|--------|------|-------------|
| SPEC-PLM-001 | 100% | ✅ 완료 | - |
| SPEC-PLM-002 | 70% | 🟡 인증 확인 | 이메일 인증, rate limiting |
| SPEC-PLM-003 | 80% | 🟡 대부분 완료 | 프로젝트 아카이빙 |
| SPEC-PLM-004 | 85% | 🟡 거의 완료 | 이슈/코멘트/마일스톤 삭제, 수정 |
| SPEC-PLM-005 | 90% | 🟡 거의 완료 | revision.getById |
| SPEC-PLM-006 | 90% | 🟡 거의 완료 | 마이그레이션 파일 |
| SPEC-PLM-007 | 70% | 🔴 인증 연동 시급 | SSE, 인증 컨텍스트 연동 |

### Critical Issues (발견된 문제점)

1. **보안 취약점 (HIGH)**: `src/app/api/attachments/[id]/download/route.ts:40` - 인증 체크 누락
2. **테스트 커버리지**: 현재 ~9% vs 목표 85% (76%p 부족)
3. **인증 불확실성**: 알림 라우터에 TEST_USER_ID 하드코딩
4. **타입 안전성**: 60+ `any` 타입 사용
5. **TODO 항목**: 45개 구현 미완료 항목

---

## 추천 접근 방식

### Phase 1: 기반 안정화 (P0 - 긴급)

**목표**: 시스템 안정성과 보안 확보

#### 1.1 보안 취약점 해결
- 첨부파일 다운로드 인증 체크 추가
- 모든 protectedProcedure에 실제 인증 로직 연동 확인

**파일**:
- `src/app/api/attachments/[id]/download/route.ts`
- `src/server/trpc/middleware/auth.ts`

#### 1.2 인증 시스템 완성
- 이메일 인증 흐름 구현
- 알림 라우터 인증 컨텍스트 연동 (TEST_USER_ID 제거)

**파일**:
- `src/modules/notification/router.ts`
- `src/server/trpc/routers/auth.ts`

### Phase 2: 핵심 기능 완성 (P1 - 높음)

**목표**: CRUD 완결성 확보

#### 2.1 이슈 추적 완성
- issue.delete (관리자용)
- comment.update/delete
- milestone.update/close

**파일**:
- `src/modules/issue/router.ts` (TODO 주석 위치)

#### 2.2 PLM 리비전 완성
- revision.getById 구현

**파일**:
- `src/modules/plm/router.ts` (TODO 주석 위치)

### Phase 3: 코드 품질 개선 (P2 - 중간)

**목표**: 유지보수성 향상

#### 3.1 코드 중복 제거
- SupplierSelector와 ManufacturerSelector 통합

**파일**:
- `src/components/plm/ManufacturerSelector.tsx`
- `src/components/plm/SupplierSelector.tsx`

#### 3.2 타입 안전성 개선
- `any` 타입을 구체적인 타입으로 대체
- 특히 `src/modules/plm/types.ts`, `src/modules/plm/service.ts`

#### 3.3 React 최적화
- 대시보드 필터에 useMemo 적용
- 불필요한 리렌더링 제거

**파일**:
- `src/app/projects/[key]/dashboard/dashboard-client.tsx`

### Phase 4: 테스트 커버리지 (장기)

**목표**: 85% 커버리지 달성

#### 4.1 비즈니스 로직 테스트
- project service 테스트
- issue service 테스트
- PLM service 테스트
- notification service 테스트

**파일** (새로 생성):
- `tests/unit/modules/project/service.test.ts`
- `tests/unit/modules/issue/service.test.ts`
- `tests/unit/modules/plm/service.test.ts`
- `tests/unit/modules/notification/service.test.ts`

#### 4.2 통합 테스트
- tRPC 라우터 통합 테스트

---

## 의존성 관계

```
Phase 1 (보안/인증) → Phase 2 (핵심 기능) → Phase 3 (품질) → Phase 4 (테스트)
     [P0 - 긴급]          [P1 - 높음]          [P2 - 중간]      [장기 목표]
```

**순서 권장**: Phase 1 → Phase 2 → Phase 3 → Phase 4

---

## 검증 방법

### Phase 1 완료 기준
- [ ] 첨부파일 다운로드가 인증된 사용자만 가능
- [ ] 알림 라우터가 실제 사용자 컨텍스트 사용
- [ ] 모든 protectedProcedure가 인증 확인

### Phase 2 완료 기준
- [ ] 이슈 삭제 기능 동작
- [ ] 코멘트 수정/삭제 동작
- [ ] 마일스톤 수정/닫기 동작
- [ ] 리비전 상세 조회 동작

### Phase 3 완료 기준
- [ ] 중복 코드 제거 (ManufacturerSelector/SupplierSelector)
- [ ] `any` 타입 50% 이상 감소
- [ ] 대시보드 필터 최적화 적용

### Phase 4 완료 기준
- [ ] 테스트 커버리지 70% 이상
- [ ] 모든 service 파일에 단위 테스트

---

## 주요 파일 목록

### 수정 필요 파일 (우선순위 순)

1. `src/app/api/attachments/[id]/download/route.ts` - 보안 취약점
2. `src/modules/notification/router.ts` - 인증 연동
3. `src/modules/issue/router.ts` - CRUD 완성
4. `src/modules/plm/router.ts` - revision.getById
5. `src/components/plm/ManufacturerSelector.tsx` - 코드 중복
6. `src/components/plm/SupplierSelector.tsx` - 코드 중복

### 테스트 파일 생성 (Phase 4)

1. `tests/unit/modules/project/service.test.ts`
2. `tests/unit/modules/issue/service.test.ts`
3. `tests/unit/modules/plm/service.test.ts`
4. `tests/unit/modules/notification/service.test.ts`
