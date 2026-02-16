# SPEC-PLM-001: 구현 계획

## Metadata

- ID: SPEC-PLM-001
- Status: Draft
- Created: 2026-02-15

## 마일스톤

### Primary Goal: 프로젝트 초기화

- Next.js 15 프로젝트 생성 (App Router, TypeScript, Tailwind)
- package.json 의존성 설정
- TypeScript, Biome, Vitest, Playwright 설정 파일 생성

### Secondary Goal: 서버 인프라

- Docker Compose로 PostgreSQL 16 설정
- Drizzle ORM 연결 및 설정
- tRPC v11 서버/클라이언트 설정
- Health check 엔드포인트 구현

### Tertiary Goal: 모듈 구조

- `src/modules/` 하위 7개 바운디드 컨텍스트 디렉토리 생성
- 각 모듈의 기본 구조 (schemas/, router.ts, service.ts, types.ts) 뼈대 생성
- shadcn/ui 기본 컴포넌트 설치

### Final Goal: 검증

- 기본 단위 테스트 작성 및 실행
- Docker + Dev Server 통합 동작 확인
- README.md 개발 환경 가이드 작성

## 기술적 접근 방식

1. `create-next-app`으로 기본 프로젝트 생성 후 커스터마이징
2. tRPC v11 공식 가이드 기반 설정 (App Router 통합)
3. Drizzle ORM 공식 PostgreSQL 어댑터 사용
4. Biome는 ESLint + Prettier 대체 (단일 도구)
5. shadcn/ui CLI로 기본 컴포넌트 설치

## 리스크 및 대응

| 리스크 | 대응 |
|--------|------|
| Next.js 15 + tRPC v11 통합 이슈 | 공식 예제 참고, Context7 문서 확인 |
| Tailwind CSS 4 호환성 | shadcn/ui 최신 버전 호환 확인 |
| PostgreSQL Docker 초기화 실패 | healthcheck + 재시도 로직 |
