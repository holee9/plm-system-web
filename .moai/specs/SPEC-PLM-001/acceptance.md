# SPEC-PLM-001: 수락 기준

## Metadata

- ID: SPEC-PLM-001
- Status: Draft
- Created: 2026-02-15

## 수락 기준 (Given-When-Then)

### 개발 환경 설정

- AC-001: Given 프로젝트 저장소가 클론되었을 때, When `pnpm install`을 실행하면, Then 모든 의존성이 에러 없이 설치된다
- AC-002: Given pnpm이 설치되어 있을 때, When `pnpm dev`를 실행하면, Then Next.js 15 개발 서버가 localhost:3000에서 실행된다
- AC-003: Given Docker가 설치되어 있을 때, When `docker compose up -d`를 실행하면, Then PostgreSQL 16 컨테이너가 healthy 상태로 실행된다

### tRPC 통합

- AC-004: Given 개발 서버와 DB가 실행 중일 때, When `GET /api/trpc/health.check`을 호출하면, Then `{ result: { data: { status: "ok" } } }` 응답을 반환한다
- AC-005: Given tRPC 클라이언트가 초기화되었을 때, When React 컴포넌트에서 `trpc.health.check.useQuery()`를 호출하면, Then 타입 안전한 응답을 받을 수 있다

### Drizzle ORM

- AC-006: Given PostgreSQL이 실행 중일 때, When `pnpm db:push`를 실행하면, Then 스키마가 데이터베이스에 동기화된다
- AC-007: Given 스키마가 동기화되었을 때, When `pnpm db:studio`를 실행하면, Then Drizzle Studio가 브라우저에서 열린다

### 코드 품질

- AC-008: Given 프로젝트 코드가 존재할 때, When `pnpm lint`를 실행하면, Then Biome가 에러 0건으로 완료된다
- AC-009: Given 테스트 파일이 존재할 때, When `pnpm test`를 실행하면, Then Vitest가 모든 테스트를 통과시킨다
- AC-010: Given TypeScript 파일이 존재할 때, When `pnpm tsc --noEmit`를 실행하면, Then 타입 에러 0건이다

### 프로젝트 구조

- AC-011: Given `src/modules/` 디렉토리를 확인할 때, When 디렉토리 목록을 조회하면, Then identity, project, issue, plm, document, notification, reporting 7개 디렉토리가 존재한다

## Quality Gate

- [ ] `pnpm install` 성공
- [ ] `docker compose up -d` 성공 (PostgreSQL healthy)
- [ ] `pnpm dev` 성공 (localhost:3000 응답)
- [ ] tRPC health check 응답 확인
- [ ] `pnpm lint` 에러 0건
- [ ] `pnpm test` 전체 통과
- [ ] `tsc --noEmit` 에러 0건
- [ ] 7개 모듈 디렉토리 존재

## Definition of Done

- [ ] 모든 AC 항목 통과
- [ ] README.md에 개발 환경 설정 가이드 포함
- [ ] .env.example 파일 제공
- [ ] 초기 커밋 완료
