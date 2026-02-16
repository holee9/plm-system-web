# PostgreSQL 마이그레이션 완료 및 코드 품질 개선

## Context

프로젝트는 PostgreSQL + Docker 환경으로 계획되었고 Docker Compose 설정도 완료되었으나, 개발 과정에서 SQLite가 사용되면서 코드에 불일치가 발생했습니다.

**혼란 요인:**
- 스키마: PostgreSQL (pg-core)
- DB 연결 코드: SQLite (better-sqlite3)
- 의존성: PostgreSQL + SQLite 혼재
- TypeScript 오류: 타입 불일치로 @ts-ignore 남용

이 계획은 PostgreSQL으로 완전히 통일하고 코드 품질을 개선합니다.

---

## 파일 변경 목록

### 1. src/server/db/index.ts
**현재 (SQLite):**
```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const dbPath = process.env.DATABASE_URL || "./db/local.db";
const client = new Database(dbPath);
export const db = drizzle(client, { schema });
```

**변경 (PostgreSQL):**
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/plm_system";
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

### 2. package.json
**제거할 devDependencies:**
- `better-sqlite3: ^12.6.2`
- `@types/better-sqlite3: ^7.6.13`

**추가할 dependencies:**
- `postgres: latest` (이미 있음)

### 3. src/server/trpc/middleware/is-authed.ts
- @ts-ignore 주석 제거
- TypeScript 오류 근본적 해결

### 4. src/server/trpc/routers/user.ts
- @ts-ignore 주석 제거 (lines 180-183)
- 타입 안전한 코드로 수정

### 5. .env (새로 생성 또는 확인)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/plm_system
```

### 6. README.md (선택)
- PostgreSQL 설정 안내 추가
- Docker 실행 명령어 포함

---

## 실행 단계

### Phase 1: PostgreSQL 연결로 변경
1. `src/server/db/index.ts` 수정
2. `.env` 파일 생성/확인
3. `drizzle.config.ts` dialect 확인 (이미 postgresql로 됨)

### Phase 2: 의존성 정리
1. package.json에서 better-sqlite3 관련 제거
2. npm install 실행

### Phase 3: TypeScript 오류 수정
1. is-authed.ts @ts-ignore 제거 및 타입 수정
2. user.ts @ts-ignore 제거 및 타입 수정

### Phase 4: 데이터베이스 마이그레이션
1. Docker PostgreSQL 시작: `npm run docker:up`
2. 마이그레이션 생성: `npm run db:generate`
3. 마이그레이션 적용: `npm run db:push`

### Phase 5: 검증
1. 개발 서버 시작: `npm run dev`
2. 테스트 실행: `npm test`
3. E2E 테스트: `npm run test:e2e`

---

## 영향받는 파일

**필수 수정:**
- `src/server/db/index.ts` - DB 연결 코드
- `package.json` - 의존성
- `.env` - 환경 변수

**선택 수정 (코드 품질):**
- `src/server/trpc/middleware/is-authed.ts`
- `src/server/trpc/routers/user.ts`

---

## 검증 방법

1. **Docker PostgreSQL 실행:**
   ```bash
   npm run docker:up
   docker ps  # plm-postgres 컨테이너 확인
   ```

2. **마이그레이션 확인:**
   ```bash
   npm run db:generate  # 마이그레이션 파일 생성
   npm run db:push      # 스키마 적용
   ```

3. **개발 서버 시작:**
   ```bash
   npm run dev
   # http://localhost:3000 접속 확인
   ```

4. **테스트 통과:**
   ```bash
   npm test      # 단위 테스트
   npm run test:e2e  # E2E 테스트
   ```

5. **TypeScript 타입 검사:**
   ```bash
   npx tsc --noEmit  # 타입 오류 없어야 함
   ```
