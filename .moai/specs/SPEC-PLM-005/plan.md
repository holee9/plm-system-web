# SPEC-PLM-005: 구현 계획

## Metadata

- ID: SPEC-PLM-005
- Status: Draft
- Created: 2026-02-15

## 마일스톤

### Primary Goal: 부품 CRUD

- parts, revisions Drizzle 스키마 작성
- 부품 생성/조회/수정 tRPC 라우터
- 자동 초기 리비전(Rev A) 생성
- 부품 목록 및 생성 페이지 UI

### Secondary Goal: BOM 트리 관리

- bom_items Drizzle 스키마
- BOM 아이템 추가/수정/삭제 라우터
- 순환 참조 검사 로직 (DFS)
- 재귀적 BOM 트리 조회 (CTE 쿼리)
- BOM 트리 UI 컴포넌트

### Tertiary Goal: 리비전 및 검색

- 부품 수정 시 새 리비전 자동 생성
- 리비전 이력 타임라인 UI
- 부품 검색 (자동완성)
- Where-Used 쿼리

### Final Goal: 내보내기 및 고급 기능

- BOM CSV/Excel 내보내기
- BOM 평면 목록 뷰
- 부품 상태 관리 (draft/active/obsolete)

## 기술적 접근 방식

1. PostgreSQL 재귀 CTE로 BOM 트리 조회
2. DFS 기반 순환 참조 검사 (추가 전 선행 검사)
3. 리비전 코드는 알파벳 순차 (A, B, C, ..., Z, AA, AB, ...)
4. React Tree 컴포넌트로 BOM 렌더링 (확장/축소)
5. CSV 내보내기는 서버 사이드 스트리밍

## 리스크 및 대응

| 리스크 | 대응 |
|--------|------|
| 재귀 CTE 성능 | 깊이 제한(20), 인덱스 최적화 |
| 순환 참조 검사 비용 | 캐시된 그래프 구조 활용 |
| 대량 BOM 렌더링 | 가상화(virtualization) 적용 |
