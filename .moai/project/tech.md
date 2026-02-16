# PLM System Web - 기술 스택 가이드

## 기술 스택 개요

PLM System Web은 최신 웹 기술을 기반으로 타입 안정성, 개발 생산성, 사용자 경험을 모두 만족하는 모던 스택으로 구성되었습니다.

### 핵심 기술 스택 매트릭스

#### 프론트엔드

| 계층 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 프레임워크 | Next.js | 15.0 | 풀스택 React 프레임워크 (App Router) |
| UI 라이브러리 | React | 19.0 | 컴포넌트 기반 UI |
| 언어 | TypeScript | 5.7 (strict) | 타입 안정성 |
| 스타일링 | Tailwind CSS | 4.0 | 유틸리티 CSS |
| UI 컴포넌트 | shadcn/ui | Latest | Radix UI 기반 프리미엄 컴포넌트 |
| UI 프리미티브 | Radix UI | Latest | 접근 가능한 컴포넌트 (9개 패키지) |
| 상태 관리 | Zustand | 5.0 | 가볍고 간단한 상태 관리 |
| 데이터 페칭 | TanStack Query | 5.0 (tRPC 통합) | 캐싱, 동기화 |
| 폼 관리 | React Hook Form | 7.51 | 성능 최적화된 폼 |
| 검증 | Zod | 3.23 | 런타임 스키마 검증 |
| 드래그&드롭 | dnd-kit | Latest | 접근성 높은 라이브러리 |
| 애니메이션 | Framer Motion | 12.34 | 선언적 애니메이션 |
| 테마 | next-themes | 0.4.6 | 라이트/다크 모드 |
| 아이콘 | Lucide React | Latest | 아이콘 라이브러리 |
| 토스트 | Sonner | 1.5 | 간단한 토스트 알림 |

#### 백엔드 (서버리스 API 레이어)

| 계층 | 기술 | 버전 | 용도 |
|------|------|------|------|
| API 레이어 | tRPC | 11.0 | 타입세이프 엔드투엔드 API |
| 언어 | TypeScript | 5.7 (strict) | 타입 안정성 |
| ORM | Drizzle ORM | Latest | 타입세이프 데이터베이스 액세스 |
| 인증 | JWT (jose) | 6.1 | 토큰 기반 인증 |
| 비밀번호 해싱 | bcrypt-ts | 5.0 | 안전한 비밀번호 저장 |
| 날짜 처리 | date-fns | 4.1 | 날짜 유틸리티 |

#### 데이터베이스

| 종류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 주 DB | PostgreSQL | 16 | 관계형 데이터베이스 (Docker) |
| GUI | pgAdmin | Latest | 웹 기반 DB 관리 (Docker) |

#### 테스트

| 종류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 단위 테스트 | Vitest | Latest | 빠른 단위 테스트 |
| 테스트 유틸리티 | @testing-library/react | Latest | React 컴포넌트 테스트 |
| E2E 테스트 | Playwright | Latest | 브라우저 자동화 테스트 |

#### 개발 도구

| 영역 | 기술 | 용도 |
|------|------|------|
| 패키지 매니저 | npm | 의존성 관리 |
| 린팅/포맷팅 | Biome | 빠른 린터 및 포맷터 |
| 타입 검사 | TypeScript 5.7 | 컴파일 타입 체크 |
| 컨테이너화 | Docker Compose | 로컬 개발 환경 |
| 버전 관리 | Git + GitHub | 코드 버전 관리 |

## 프레임워크 선택 사유

### 프론트엔드: Next.js 15 + React 19

**선택 이유**:
- **App Router**: 최신 파일 시스템 기반 라우팅으로 직관적인 구조
- **Server Components**: RSC(React Server Components)로 성능 최적화
- **타입세이프 풀스택**: tRPC 통합으로 엔드투엔드 타입 안전성
- **SEO 최적화**: 서버 사이드 렌더링으로 검색 엔진 최적화
- **자동 코드 분할**: 페이지별 자동 번들링으로 최적의 로딩 속도
- **이미지 최적화**: next/Image로 자동 이미지 최적화
- **무료/오픈소스**: MIT 라이선스
- **대규모 커뮤니티**: 풍부한 리소스와 생태계
- **TypeScript 네이티브**: 완벽한 타입 지원

**대안 비교**:
- **Remix**: 더 강력한 라우팅 하지만 생태계가 더 작음
- **SvelteKit**: 번들 크기가 작지만 채용 시장이 더 작음
- **Vue + Nuxt**: 학습 곡선이 낮지만 TypeScript 지원이 상대적으로 약함

### UI 컴포넌트: shadcn/ui + Radix UI

**선택 이유**:
- **완전한 커스터마이징**: 컴포넌트 소스를 직접 소유하여 완전한 제어
- **Radix UI 기반**: WCAG 2.1 준수하는 접근 가능한 프리미티브
- **Tailwind 통합**: 일관된 스타일링과 디자인 시스템
- **타입스크립트**: 완벽한 타입 안전성
- **복사 & 붙여넣기**: npm 설치 없이 프로젝트로 복사
- **무료**: 오픈소스 라이선스
- **모던한 디자인**: 현대적인 UI/UX 디자인

**대안 비교**:
- **Material-UI**: 더 완성되어 있지만 커스터마이징이 어려움
- **Chakra UI**: 좋은 접근성이지만 Radix UI만큼 유연하지 않음
- **Ant Design**: 더 많은 컴포넌트 하지만 번들 크기가 큼

### API 레이어: tRPC v11

**선택 이유**:
- **엔드투엔드 타입 안전성**: 프론트엔드와 백엔드 간 타입 자동 공유
- **자동 타입 생성**: API 스키마에서 자동으로 TypeScript 타입 생성
- **간결한 문법**: 복잡한 GraphQL 없이 간단한 프로시저 호출
- **Zero Configuration**: 별도의 코드 제너레이터 없이 즉시 사용 가능
- **React Query 통합**: 자동 캐싱, 리트라이, 리프레시
- **최적의 성능**: 직렬화 오버헤드가 최소화
- **Next.js와 완벽한 통합**: App Router와 자연스러운 통합

**대안 비교**:
- **REST API**: 타입 안전성 확보를 위해 별도의 타입 정의 필요
- **GraphQL**: 강력하지만 설정 복잡도가 높고 오버헤드가 큼
- **tRPC 대비 Next.js API Routes**: 타입 자동 공유가 안 됨

### ORM: Drizzle ORM

**선택 이유**:
- **타입스크립트 네이티브**: 완벽한 타입 안전성과 인텔리센스
- **SQL 중심**: ORM 추상화보다 SQL 친화적인 접근
- **경량**: Prisma 대비 번들 크기가 작음
- **마이그레이션 지원**: 데이터베이스 버전 관리 지원
- **Drizzle Studio**: 브라우저 기반 데이터베이스 GUI 제공
- **빠른 개선 속도**: 활발한 개발과 빠른 업데이트
- **단순함**: 학습 곡선이 낮음

**대안 비교**:
- **Prisma**: 더 성숙하고 생태계가 크지만 번들이 큼
- **TypeORM**: 데코레이터 기반이지만 실효 성능이 느림
- **Sequelize**: JavaScript 중심이라 타입 지원이 약함

### 데이터베이스: PostgreSQL 16

**선택 이유**:
- **고급 기능**: JSONB, Full-text Search, Window Functions, Arrays
- **신뢰성**: ACID 준수, 트랜잭션 지원, 30년 이상의 검증
- **성능**: 대규모 데이터셋에 최적화된 쿼리 최적화
- **확장성**: 수평 확장 가능 (Replication, Partitioning)
- **무료/오픈소스**: 라이선스 비용 없음
- **표준 준수**: SQL 표준 준수로 높은 호환성
- **커뮤니티**: 대규모 커뮤니티와 풍부한 리소스

**대안 비교**:
- **MySQL**: 더 간단하지만 고급 기능이 부족함
- **MongoDB**: NoSQL 유연성이 있지만 복잡한 관계형 데이터에 부적합
- **SQLite**: 단일 파일 장점이 있지만 동시성 제한이 있음

### 상태 관리: Zustand

**선택 이유**:
- **간결함**: Redux보다 훨씬 적은 보일러플레이트
- **타입 안전성**: TypeScript 완벽 지원
- **경량**: 1KB 미만의 번들 크기
- **간단한 API**: useState와 유사한 사용법
- **DevTools**: Redux DevTools와 호환
- **미들웨어 지원**: 로깅, 지속성 등 미들웨어 생태계
- **성능**: 불필요한 리렌더링 최적화

**대안 비교**:
- **Redux**: 더 성숙하지만 보일러플레이트가 많음
- **Jotai**: 더 작지만 Zustand만큼 직관적이지 않음
- **Recoil**: Facebook 지원이지만 성능 이슈가 있음

## 개발 환경 요구사항

### 필수 소프트웨어

```
Node.js: 20.0.0 이상 (권장: Latest LTS)
npm: 9.0.0 이상 (또는 pnpm 8.0+)
Docker: 20.10+ (PostgreSQL 컨테이너용)
Git: 2.30 이상
```

### 권장 개발 도구

```
IDE:
  - VS Code (최신 버전)
    확장:
    - Biome (린팅/포맷팅)
    - TypeScript Vue Plugin (Volar)
    - Error Lens (인라인 에러 표시)
    - GitLens (Git 향상)

데이터베이스 도구:
  - Drizzle Studio (npm run db:studio)
  - pgAdmin (Docker 컨테이너)

API 테스팅:
  - tRPC Playground (개발 모드)

브라우저:
  - Chrome (DevTools)
  - Firefox (개발자 도구)
```

### 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/your-org/plm-system-web.git
cd plm-system-web

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env
# .env 파일 편집 (DATABASE_URL 등)

# 4. 데이터베이스 시작
docker compose -f docker/docker-compose.yml up -d

# 5. 데이터베이스 스키마 푸시
npm run db:push

# 6. 개발 서버 시작
npm run dev

# 브라우저: http://localhost:3000
```

## 빌드 및 배포 설정

### 빌드 프로세스

```bash
# 개발 빌드
npm run build

# 프로덕션 빌드
npm run build
NODE_ENV=production npm start

# 빌드 결과
# .next/ - 최적화된 정적 사이트 및 서버 함수
# public/ - 정적 리소스
```

### Docker 배포 (향후)

```dockerfile
# Dockerfile (향후 구현 예정)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel 배포 (권장)

**장점**:
- Next.js 개발사인 Vercel과 완벽한 통합
- 자동 HTTPS, CDN, Edge Functions
- Zero Configuration으로 배포 간단
- 프리뷰 배포 자동 생성

**배포 단계**:
1. GitHub 레포지토리 연결
2. Vercel 프로젝트 생성
3. 환경변수 설정
4. 자동 배포

## 주요 라이브러리 및 의존성

### 핵심 의존성

**프론트엔드**:
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.7",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/*": "9개 패키지",
    "framer-motion": "^12.34.0",
    "dnd-kit": "Latest"
  }
}
```

**백엔드 (Server Components)**:
```json
{
  "dependencies": {
    "@trpc/server": "^11.0.0",
    "drizzle-orm": "Latest",
    "postgres": "Latest",
    "jose": "^6.1.3",
    "bcrypt-ts": "^5.0.3",
    "date-fns": "^4.1.0"
  }
}
```

### 개발 의존성

```json
{
  "devDependencies": {
    "@playwright/test": "Latest",
    "@testing-library/react": "Latest",
    "@testing-library/jest-dom": "Latest",
    "vitest": "Latest",
    "@vitest/coverage-v8": "^4.0.18",
    "biome": "Latest",
    "drizzle-kit": "Latest",
    "typescript": "^5.7"
  }
}
```

## 성능 최적화 전략

### 프론트엔드 최적화

1. **코드 분할**: Next.js App Router 자동 코드 분할
2. **이미지 최적화**: next/Image로 자동 최적화 (WebP,_lazy loading)
3. **폰트 최적화**: next/Font로 자동 폰트 최적화
4. **서버 컴포넌트**: RSC로 자바스크립트 번들 크기 감소
5. **스트리밍 SSR**: 점진적 페이지 렌더링으로 TTI 개선
6. **TanStack Query 캐싱**: 자동 데이터 캐싱으로 중복 요청 방지
7. **번들 크기 모니터링**: @next/bundle-analyzer로 번들 분석

### 백엔드 최적화

1. **데이터베이스 인덱싱**: 자주 조회하는 컬럼에 인덱스 추가
2. **쿼리 최적화**: Drizzle select, eager loading으로 N+1 문제 방지
3. **커넥션 풀링**: PostgreSQL 커넥션 풀로 재사용
4. **결과 스트리밍**: tRPC 스트리밍으로 대량 데이터 전송 최적화
5. **페이지네이션**: limit/offset으로 대량 데이터 조회 최적화

## 보안 고려사항

### 인증 및 권한

1. **JWT 기반 인증**: jose 라이브러리로 안전한 JWT 생성/검증
2. **비밀번호 해싱**: bcrypt-ts로 안전한 해싱 (cost factor: 10)
3. **세션 관리**: Secure, HttpOnly 쿠키로 XSS 방지
4. **CSRF 방지**: SameSite 쿠키 속성으로 CSRF 방지
5. **RBAC**: 역할 기반 권한 제어 (Role-Based Access Control)

### 데이터 보안

1. **입력 검증**: Zod로 런타임 스키마 검증
2. **SQL 주입 방지**: Drizzle ORM의 파라미터화된 쿼리
3. **XSS 방지**: React 19의 자동 XSS 이스케이프
4. **환경변수**: 민감한 정보를 .env로 관리
5. **HTTPS**: 프로덕션에서 HTTPS 강제

### API 보안

1. **Rate Limiting**: 향후 API Rate Limiting 구현
2. **CORS**: 안전한 CORS 설정
3. ** helmets**: 보안 헤더 설정 (Content-Security-Policy 등)

## 품질 standards

### TRUST 5 프레임워크

- **Tested**: 85%+ 테스트 커버리지 목표
  - Vitest 단위 테스트
  - @testing-library/react 컴포넌트 테스트
  - Playwright E2E 테스트

- **Readable**: 명확한 네이밍, 영어 주석
  - Biome 린팅 규칙
  - 의미 있는 변수/함수명
  - 복잡도 제한

- **Unified**: 일관된 스타일
  - Biome 자동 포맷팅
  - Tailwind CSS 디자인 토큰
  - shadcn/ui 컴포넌트 통일

- **Secured**: OWASP 준수
  - 입력 검증
  - 인증/권한 체크
  - 보안 헤더 설정

- **Trackable**: 커밋 메시지 규칙
  - Conventional Commits
  - GitHub Issue 연동

## 다음 단계

1. **개발 환경 구성**: 로컬 개발 환경 설정
2. **데이터베이스 스키마 설계**: Drizzle 스키마 정의
3. **tRPC 라우터 구현**: 도메인별 API 라우터 개발
4. **UI 컴포넌트 개발**: shadcn/ui 기반 컴포넌트 개발
5. **테스트 작성**: 단위 테스트 및 E2E 테스트 작성
6. **배포**: Vercel에 프로덕션 배포

## 추가 학습 리소스

### 공식 문서
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)
- [shadcn/ui Documentation](https://ui.shadcn.com)

### 학습 가이드
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
