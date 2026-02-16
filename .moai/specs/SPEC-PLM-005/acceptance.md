# SPEC-PLM-005: 수락 기준

## Metadata

- ID: SPEC-PLM-005
- Status: Draft
- Created: 2026-02-15

## 수락 기준 (Given-When-Then)

### 부품 관리

- AC-001: Given 사용자가 부품을 생성할 때, When 유효한 부품 번호와 이름을 입력하면, Then 부품과 초기 리비전(Rev A)이 생성된다
- AC-002: Given 중복 부품 번호로, When 부품을 생성하려 하면, Then 에러가 반환된다
- AC-003: Given 부품을 수정할 때, When 변경을 저장하면, Then 새 리비전이 생성되고 이전 리비전이 보존된다

### BOM 트리

- AC-004: Given BOM에 자식 부품을 추가할 때, When 순환 참조가 발생하면, Then 에러가 반환된다
- AC-005: Given 5단계 깊이 BOM이 있을 때, When 트리를 조회하면, Then 모든 레벨이 표시된다
- AC-006: Given BOM 아이템 수량을 변경할 때, When 저장하면, Then 수량이 업데이트된다

### 리비전 이력

- AC-007: Given 3개 리비전이 있을 때, When 이력을 조회하면, Then Rev A, B, C가 시간순으로 표시된다

### Where-Used

- AC-008: Given 부품이 2개 BOM에 사용될 때, When Where-Used를 실행하면, Then 2개 BOM이 반환된다

### 내보내기

- AC-009: Given BOM 데이터가 있을 때, When CSV 내보내기를 실행하면, Then CSV 파일이 다운로드된다

## Quality Gate

- [ ] 부품 CRUD 동작
- [ ] BOM 트리 재귀 조회 동작
- [ ] 순환 참조 방지 동작
- [ ] 리비전 자동 생성 동작
- [ ] Where-Used 쿼리 동작
- [ ] 85%+ 코드 커버리지

## Definition of Done

- [ ] 모든 AC 항목 통과
- [ ] 순환 참조 검사 테스트 100% 커버리지
- [ ] BOM 트리 10단계 성능 검증 (2초 이내)
- [ ] 단위/통합/E2E 테스트 작성 및 통과
