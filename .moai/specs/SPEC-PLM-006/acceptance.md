# SPEC-PLM-006: 수락 기준

## Metadata

- ID: SPEC-PLM-006
- Status: Draft
- Created: 2026-02-15

## 수락 기준 (Given-When-Then)

### 변경 주문 생성

- AC-001: Given 사용자가 변경 주문을 생성할 때, When 유형/제목/설명을 입력하면, Then 고유 번호가 부여된 변경 주문이 draft 상태로 생성된다
- AC-002: Given 변경 주문이 draft 상태일 때, When 제출하면, Then 상태가 submitted로 변경된다

### 승인 워크플로우

- AC-003: Given 2명의 승인자가 배정되었을 때, When 2명 모두 승인하면, Then 상태가 approved로 변경된다
- AC-004: Given 2명의 승인자 중, When 1명이 거부하면, Then 상태가 rejected로 변경된다
- AC-005: Given 거부된 변경 주문을, When 수정 후 재제출하면, Then 새 검토 사이클이 시작된다
- AC-006: Given 승인된 변경 주문을, When 구현 완료 처리하면, Then 상태가 implemented로 변경된다

### 감사 추적

- AC-007: Given 변경 주문 상태가 3번 변경되었을 때, When 감사 추적을 조회하면, Then 3개의 상태 변경 기록이 시간순으로 표시된다
- AC-008: Given 감사 추적 기록이 존재할 때, When 삭제를 시도하면, Then 삭제가 거부된다

### 영향 분석

- AC-009: Given 변경 주문에 3개 부품이 지정되었을 때, When 영향 분석을 실행하면, Then 3개 부품과 관련 BOM이 표시된다

## Quality Gate

- [ ] 변경 주문 라이프사이클 동작 (draft -> submitted -> in_review -> approved -> implemented)
- [ ] 다중 승인자 워크플로우 동작
- [ ] 거부 → 재제출 플로우 동작
- [ ] 감사 추적 무결성 확인
- [ ] 영향 분석 동작
- [ ] 85%+ 코드 커버리지

## Definition of Done

- [ ] 모든 AC 항목 통과
- [ ] 상태 전이 규칙 100% 커버리지
- [ ] 감사 추적 INSERT-only 보장
- [ ] 단위/통합/E2E 테스트 작성 및 통과
