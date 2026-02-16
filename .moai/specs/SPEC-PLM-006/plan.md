# SPEC-PLM-006: 구현 계획

## Metadata

- ID: SPEC-PLM-006
- Status: Draft
- Created: 2026-02-15

## 마일스톤

### Primary Goal: 변경 주문 기본

- change_orders, change_order_approvals Drizzle 스키마
- 변경 주문 CRUD tRPC 라우터
- 상태 전이 규칙 엔진
- 변경 주문 목록/생성/상세 페이지

### Secondary Goal: 승인 워크플로우

- 승인자 배정 및 관리
- 승인/거부 프로세스 (병렬 승인)
- 거부 후 재수정/재제출 플로우
- 승인 패널 UI

### Tertiary Goal: 감사 추적 및 영향 분석

- 감사 추적 기록 (모든 상태 변경)
- 감사 추적 타임라인 UI
- 영향 분석 (관련 부품/BOM 조회)
- 영향 분석 패널 UI

### Final Goal: 모듈 간 통신

- In-process 이벤트 버스 구현
- 승인 시 이슈 자동 생성 연동 (선택사항)
- 구현 완료 시 부품 리비전 연결

## 기술적 접근 방식

1. 상태 전이 규칙은 별도 모듈로 분리 (change-order-machine.ts)
2. 다중 승인은 change_order_approvals 테이블로 개별 추적
3. 감사 추적은 INSERT-only 패턴 (UPDATE/DELETE 금지)
4. 트랜잭션으로 상태 + 승인 일관성 보장
5. EventEmitter 기반 in-process 이벤트 버스

## 리스크 및 대응

| 리스크 | 대응 |
|--------|------|
| 승인 상태 일관성 | 트랜잭션 내 원자적 업데이트 |
| 감사 추적 무결성 | INSERT-only + DB 레벨 제약 |
| 이벤트 버스 신뢰성 | 동기 이벤트 처리 (비동기 불필요) |
