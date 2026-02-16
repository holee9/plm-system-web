# SPEC-PLM-003: 구현 계획

## Metadata

- ID: SPEC-PLM-003
- Status: Draft
- Created: 2026-02-15

## 마일스톤

### Primary Goal: 프로젝트 CRUD

- projects, project_members Drizzle 스키마 작성
- 프로젝트 생성/조회/수정 tRPC 라우터 구현
- 프로젝트 키 고유성 검증
- 프로젝트 목록 및 생성 페이지 UI

### Secondary Goal: 멤버 관리

- 멤버 추가/제거/역할 변경 라우터 구현
- 프로젝트별 데이터 격리 미들웨어
- 멤버 관리 UI (목록, 초대, 역할 변경)

### Tertiary Goal: 아카이브 및 설정

- 프로젝트 아카이브/복원 기능
- 프로젝트 설정 페이지
- Empty State UI 컴포넌트

### Final Goal: 프로젝트 레이아웃

- 프로젝트별 사이드바 네비게이션
- 프로젝트 컨텍스트 레이아웃 (이슈, BOM 등 서브 페이지용)

## 기술적 접근 방식

1. 프로젝트 키는 URL 라우팅 기반 (`/projects/[key]`)
2. tRPC middleware로 프로젝트 멤버십/역할 검증
3. Drizzle ORM의 select + where로 데이터 격리
4. TanStack Query로 프로젝트 목록 캐싱 및 낙관적 업데이트
5. shadcn/ui DataTable로 프로젝트 목록 표시

## 리스크 및 대응

| 리스크 | 대응 |
|--------|------|
| 프로젝트별 데이터 격리 누락 | 공통 미들웨어에서 project_id 필터 강제 |
| 프로젝트 키 충돌 | DB UNIQUE + 실시간 중복 검사 |
| URL 기반 키 변경 불가 | MVP에서는 키 변경 미지원, 추후 리다이렉트 |
