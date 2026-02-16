# SPEC-PLM-003: 수락 기준

## Metadata

- ID: SPEC-PLM-003
- Status: Draft
- Created: 2026-02-15

## 수락 기준 (Given-When-Then)

### 프로젝트 생성

- AC-001: Given 인증된 사용자가, When 유효한 이름/키/설명으로 프로젝트를 생성하면, Then 프로젝트가 생성되고 요청자가 admin으로 등록된다
- AC-002: Given 중복된 프로젝트 키로, When 프로젝트를 생성하려 하면, Then "이미 사용 중인 프로젝트 키입니다" 에러가 반환된다
- AC-003: Given 유효하지 않은 키 형식으로, When 프로젝트를 생성하려 하면, Then 유효성 검증 에러가 반환된다

### 프로젝트 조회

- AC-004: Given 3개 프로젝트 멤버인 사용자가, When 프로젝트 목록을 조회하면, Then 해당 3개 프로젝트만 반환된다
- AC-005: Given 아카이브된 프로젝트가 있을 때, When 기본 필터로 목록을 조회하면, Then 아카이브 프로젝트는 제외된다

### 프로젝트 수정

- AC-006: Given 프로젝트 admin이, When 이름/설명을 수정하면, Then 변경 사항이 저장된다
- AC-007: Given 프로젝트 viewer가, When 프로젝트 수정을 시도하면, Then 403 에러가 반환된다

### 멤버 관리

- AC-008: Given 프로젝트 admin이, When 새 멤버를 추가하면, Then 해당 사용자가 프로젝트에 등록된다
- AC-009: Given 프로젝트 admin이, When 멤버 역할을 변경하면, Then 역할이 업데이트된다
- AC-010: Given 프로젝트 비멤버가, When 프로젝트 데이터에 접근하면, Then 403 에러가 반환된다

### 아카이브

- AC-011: Given 프로젝트 admin이, When 프로젝트를 아카이브하면, Then 상태가 archived로 변경된다
- AC-012: Given 아카이브된 프로젝트에서, When 복원을 실행하면, Then 상태가 active로 변경된다

## Quality Gate

- [ ] 프로젝트 CRUD 동작 확인
- [ ] 프로젝트 키 고유성 보장
- [ ] 멤버 역할 기반 접근 제어 동작
- [ ] 프로젝트별 데이터 격리 확인
- [ ] 85%+ 코드 커버리지

## Definition of Done

- [ ] 모든 AC 항목 통과
- [ ] 단위/통합/E2E 테스트 작성 및 통과
- [ ] 프로젝트 레이아웃/사이드바 구현
- [ ] Empty State UI 구현
