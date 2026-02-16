# SPEC-PLM-004: 수락 기준

## Metadata

- ID: SPEC-PLM-004
- Status: Draft
- Created: 2026-02-15

## 수락 기준 (Given-When-Then)

### 이슈 CRUD

- AC-001: Given 프로젝트 멤버가, When 이슈를 생성하면, Then 프로젝트 키 기반 순차 번호가 부여된다
- AC-002: Given 여러 이슈가 존재할 때, When 이슈 목록을 조회하면, Then 커서 기반 페이지네이션으로 반환된다
- AC-003: Given 이슈가 존재할 때, When 이슈를 수정하면, Then 변경 사항이 저장된다

### 상태 워크플로우

- AC-004: Given 이슈 상태가 open일 때, When in_progress로 변경하면, Then 상태가 업데이트된다
- AC-005: Given 이슈 상태가 open일 때, When done으로 직접 변경하려 하면, Then 에러가 반환된다
- AC-006: Given 이슈 상태가 closed일 때, When open으로 reopen하면, Then 상태가 업데이트된다

### 코멘트

- AC-007: Given 이슈에 코멘트를 작성하면, When 이슈 상세를 조회하면, Then 코멘트가 표시된다
- AC-008: Given 다른 사용자의 코멘트에 대해, When 삭제를 시도하면, Then 권한 에러가 반환된다 (admin 제외)

### 라벨 및 마일스톤

- AC-009: Given 라벨이 생성되었을 때, When 이슈에 라벨을 할당하면, Then 라벨 필터링이 동작한다
- AC-010: Given 마일스톤에 5개 이슈가 있을 때, When 3개가 완료되면, Then 마일스톤 진행률이 60%로 표시된다

### 칸반 보드

- AC-011: Given 칸반 보드에서, When 이슈를 in_progress 컬럼으로 드래그하면, Then 이슈 상태가 in_progress로 변경된다
- AC-012: Given 칸반 보드에서, When 허용되지 않은 상태 컬럼으로 드래그하면, Then 이동이 취소되고 원래 위치로 복원된다

### 필터링

- AC-013: Given 다양한 이슈가 있을 때, When "상태: open, 우선순위: high"로 필터링하면, Then 해당 조건의 이슈만 반환된다

## Quality Gate

- [ ] 이슈 CRUD 동작
- [ ] 상태 전이 규칙 동작
- [ ] 커서 기반 페이지네이션 동작
- [ ] 코멘트 CRUD 동작
- [ ] 라벨/마일스톤 관리 동작
- [ ] 칸반 보드 드래그 앤 드롭 동작
- [ ] 필터링 동작
- [ ] 85%+ 코드 커버리지

## Definition of Done

- [ ] 모든 AC 항목 통과
- [ ] 단위/통합/E2E 테스트 작성 및 통과
- [ ] 상태 전이 규칙 100% 커버리지
- [ ] 칸반 보드 드래그 UX 동작 확인
