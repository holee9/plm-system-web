# SPEC-PLM-002: 수락 기준

## Metadata

- ID: SPEC-PLM-002
- Status: Draft
- Created: 2026-02-15

## 수락 기준 (Given-When-Then)

### 회원가입

- AC-001: Given 회원가입 페이지에서, When 유효한 이메일/비밀번호를 입력하고 제출하면, Then 사용자가 생성되고 대시보드로 리다이렉트된다
- AC-002: Given 회원가입 페이지에서, When 이미 등록된 이메일을 입력하면, Then "이미 등록된 이메일입니다" 에러가 표시된다
- AC-003: Given 회원가입 페이지에서, When 8자 미만 비밀번호를 입력하면, Then 유효성 검증 에러가 표시된다

### 로그인/로그아웃

- AC-004: Given 로그인 페이지에서, When 올바른 자격 증명을 입력하면, Then 세션이 생성되고 대시보드로 이동한다
- AC-005: Given 로그인 페이지에서, When 잘못된 비밀번호를 입력하면, Then 에러 메시지가 표시된다
- AC-006: Given 로그인 상태일 때, When 로그아웃 버튼을 클릭하면, Then 세션이 삭제되고 로그인 페이지로 이동한다

### 세션 및 보호

- AC-007: Given 미인증 상태에서, When 보호된 페이지에 접근하면, Then 로그인 페이지로 리다이렉트된다
- AC-008: Given 세션이 만료되었을 때, When API 호출을 시도하면, Then 401 응답이 반환된다

### 팀 관리

- AC-009: Given 인증된 사용자가, When 팀을 생성하면, Then owner 역할로 팀에 등록된다
- AC-010: Given 팀 owner가, When 다른 사용자를 초대하면, Then member 역할로 팀에 추가된다
- AC-011: Given 팀 owner가, When 멤버의 역할을 admin으로 변경하면, Then 역할이 업데이트된다
- AC-012: Given 팀 member가, When 팀 설정을 수정하려 하면, Then 권한 부족 에러가 반환된다

### 보안

- AC-013: Given 1분 이내에 10회 로그인 실패했을 때, When 추가 로그인을 시도하면, Then rate limit 에러가 반환된다
- AC-014: Given 저장된 비밀번호를 확인했을 때, When 데이터베이스를 조회하면, Then bcrypt 해시로 저장되어 있다

## Quality Gate

- [ ] 회원가입 → 로그인 → 로그아웃 플로우 동작
- [ ] 보호된 페이지 접근 제어 동작
- [ ] 팀 CRUD 및 멤버 관리 동작
- [ ] Rate limiting 동작
- [ ] 비밀번호 bcrypt 해싱 확인
- [ ] 85%+ 코드 커버리지

## Definition of Done

- [ ] 모든 AC 항목 통과
- [ ] 단위/통합/E2E 테스트 작성 및 통과
- [ ] CSRF 보호 활성화 확인
- [ ] secure cookie 설정 확인
