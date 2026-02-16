# SPEC-PLM-002: 구현 계획

## Metadata

- ID: SPEC-PLM-002
- Status: Draft
- Created: 2026-02-15

## 마일스톤

### Primary Goal: Auth.js 인증 기반

- Auth.js v5 설정 및 Drizzle 어댑터 연결
- users, accounts, sessions 테이블 Drizzle 스키마 작성
- 이메일/비밀번호 Credentials Provider 구현
- 로그인/회원가입 페이지 및 폼 컴포넌트

### Secondary Goal: 세션 및 보호

- tRPC context에 세션 정보 주입
- protectedProcedure 미들웨어 구현
- AuthGuard 컴포넌트 (미인증 사용자 리다이렉트)
- 프로필 수정 기능

### Tertiary Goal: 팀 관리

- teams, team_members 테이블 스키마
- 팀 CRUD tRPC 라우터
- 팀 멤버 관리 (추가/제거/역할 변경)
- 팀 관리 UI 페이지

### Final Goal: 보안 강화

- Rate limiting (인증 엔드포인트)
- CSRF 보호 확인
- OAuth Provider 설정 (GitHub, Google) - 선택사항
- 비밀번호 재설정 플로우

## 기술적 접근 방식

1. Auth.js v5 공식 Next.js 통합 사용
2. Drizzle ORM 어댑터로 세션/계정 관리
3. bcrypt를 사용한 비밀번호 해싱
4. tRPC middleware로 인증 상태 주입
5. Next.js middleware로 페이지 보호
6. Zod로 입력 데이터 검증

## 리스크 및 대응

| 리스크 | 대응 |
|--------|------|
| Auth.js v5 Drizzle Adapter 호환성 | 공식 @auth/drizzle-adapter 패키지 활용 |
| 세션과 tRPC context 통합 | Auth.js getServerSession을 context에 주입 |
| Rate limiting | upstash/ratelimit 또는 in-memory 구현 |
