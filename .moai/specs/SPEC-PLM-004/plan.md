# SPEC-PLM-004: 구현 계획

## Metadata

- ID: SPEC-PLM-004
- Status: Draft
- Created: 2026-02-15

## 마일스톤

### Primary Goal: 이슈 CRUD 기반

- issues, issue_comments, labels, issue_labels, milestones Drizzle 스키마
- 이슈 생성/조회/수정/삭제 tRPC 라우터
- 프로젝트 키 기반 순차 번호 자동 부여
- 이슈 목록 페이지 (커서 페이지네이션)
- 이슈 상세 페이지

### Secondary Goal: 상태 워크플로우 및 코멘트

- 상태 전이 규칙 엔진 (status-machine.ts)
- 상태 변경 API (전이 규칙 검증)
- 코멘트 CRUD
- 이슈 필터링 (상태, 담당자, 우선순위, 라벨)

### Tertiary Goal: 라벨, 마일스톤, 칸반

- 라벨 CRUD 및 이슈 할당
- 마일스톤 CRUD 및 진행률
- 칸반 보드 UI (dnd-kit)
- 드래그 앤 드롭 상태 변경 (낙관적 업데이트)

### Final Goal: 고급 기능

- 이슈 필터 바 컴포넌트
- 담당자 할당 (프로젝트 멤버 검증)
- 서브태스크 (parent_id)
- 이슈 번호 기반 URL 라우팅 (PLM-1)

## 기술적 접근 방식

1. 이슈 번호는 트랜잭션 내 `SELECT MAX(number) + 1` 방식
2. 상태 전이 규칙은 별도 모듈(status-machine.ts)로 분리
3. 커서 기반 페이지네이션: `WHERE id > cursor ORDER BY created_at DESC LIMIT 50`
4. 칸반 보드: dnd-kit 라이브러리 + TanStack Query 낙관적 업데이트
5. 필터링: URL search params 기반 + Drizzle where 조건 동적 빌드

## 리스크 및 대응

| 리스크 | 대응 |
|--------|------|
| 이슈 번호 동시 생성 충돌 | 트랜잭션 + UNIQUE 제약조건 |
| 칸반 드래그 UX 성능 | 낙관적 업데이트 + 디바운스 |
| 복잡한 필터 조합 | 인덱스 최적화 + 쿼리 플래닝 |
