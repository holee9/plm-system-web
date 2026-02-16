# SPEC-PLM-007: 수락 기준

## Metadata

- ID: SPEC-PLM-007
- Status: Draft
- Created: 2026-02-15

## 수락 기준 (Given-When-Then)

### 대시보드

- AC-001: Given 프로젝트에 10개 이슈가 있을 때, When 대시보드에 접근하면, Then 통계 카드에 이슈 수 10이 표시된다
- AC-002: Given 이슈가 다양한 상태에 있을 때, When 대시보드에 접근하면, Then 상태 분포 차트가 렌더링된다
- AC-003: Given 신규 사용자가, When 대시보드에 접근하면, Then Empty State 안내가 표시된다
- AC-004: Given 대시보드를 요청할 때, When 통계를 로드하면, Then 500ms 이내에 응답한다

### 알림

- AC-005: Given 이슈가 할당되었을 때, When 알림을 확인하면, Then 미읽음 알림으로 표시된다
- AC-006: Given 3개 미읽음 알림이 있을 때, When 알림 벨을 확인하면, Then 배지에 3이 표시된다
- AC-007: Given 알림을 클릭할 때, When 해당 리소스로 이동하면, Then 알림이 읽음 처리된다
- AC-008: Given 전체 읽음을 요청할 때, When 처리가 완료되면, Then 모든 알림이 읽음 상태가 된다
- AC-009: Given SSE 연결이 활성화되었을 때, When 새 알림이 발생하면, Then 실시간으로 표시된다

### 문서/파일 관리

- AC-010: Given 50MB 이하 파일을, When 업로드하면, Then 파일이 저장되고 메타데이터가 기록된다
- AC-011: Given 50MB 초과 파일을, When 업로드하려 하면, Then 크기 초과 에러가 표시된다
- AC-012: Given 문서에 새 버전을 업로드할 때, When 완료되면, Then 이전 버전이 보존되고 새 버전이 활성화된다
- AC-013: Given 업로드된 파일을, When 다운로드하면, Then 정상 다운로드된다

### 활동 피드

- AC-014: Given 다양한 활동이 발생했을 때, When 활동 피드를 조회하면, Then 최근 활동이 시간순으로 표시된다

## Quality Gate

- [ ] 대시보드 통계 카드 + 차트 동작
- [ ] 알림 생성/조회/읽음처리 동작
- [ ] SSE 또는 폴링 실시간 알림 동작
- [ ] 파일 업로드/다운로드 동작
- [ ] 문서 버전 관리 동작
- [ ] 활동 피드 동작
- [ ] Empty State UI 동작
- [ ] 85%+ 코드 커버리지

## Definition of Done

- [ ] 모든 AC 항목 통과
- [ ] 대시보드 통계 쿼리 500ms 이내 확인
- [ ] 파일 MIME 타입 검증 확인
- [ ] 알림 쿨다운 메커니즘 확인
- [ ] 단위/통합/E2E 테스트 작성 및 통과
