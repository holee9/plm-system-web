# SPEC-AUTH-001: 승인 기준

## 메타데이터

| 항목 | 값 |
|------|-----|
| SPEC ID | SPEC-AUTH-001 |
| 버전 | 1.0.0 |
| 생성일 | 2026-02-16 |
| 형식 | Gherkin (Given-When-Then) |

---

## 승인 기준 개요

이 문서는 사용자 인증 시스템의 모든 기능에 대한 상세한 승인 기준을 정의합니다. 각 시나리오는 Gherkin 형식(Given-When-Then)으로 작성되며, 자동화된 테스트로 변환 가능합니다.

---

## US-001: 사용자 등록

### AC-001-01: 정상적인 사용자 등록

**시나리오:** 신규 사용자가 유효한 정보로 등록

```gherkin
GIVEN: 등록되지 않은 이메일 "newuser@example.com"
AND: 비밀번호가 복잡성 요구사항을 충족함 (8자 이상, 대문자, 소문자, 숫자 포함)
AND: 이름이 "신규사용자"임
WHEN: 사용자가 등록 양식을 제출함
THEN: 시스템이 사용자 계정을 PENDING 상태로 생성함
AND: 비밀번호가 bcrypt로 해시화되어 저장됨
AND: 24시간 유효한 이메일 인증 토큰이 생성됨
AND: 인증 이메일이 발송됨
AND: 응답으로 201 Created 상태와 "등록 성공. 이메일을 확인하세요." 메시지가 반환됨
AND: auth_events 테이블에 "register" 이벤트가 기록됨
```

---

### AC-001-02: 중복 이메일 등록 시도

**시나리오:** 이미 등록된 이메일로 등록 시도

```gherkin
GIVEN: 이미 등록된 이메일 "existing@example.com"
WHEN: 사용자가 해당 이메일로 등록 양식을 제출함
THEN: 시스템이 409 Conflict 상태를 반환함
AND: "이미 등록된 이메일입니다." 오류 메시지가 반환됨
AND: 새 사용자 계정이 생성되지 않음
AND: auth_events 테이블에 "register_failed" 이벤트가 기록됨
```

---

### AC-001-03: 약한 비밀번호 등록 시도

**시나리오:** 복잡성 요구사항을 충족하지 않는 비밀번호로 등록 시도

```gherkin
GIVEN: 등록되지 않은 이메일 "newuser@example.com"
AND: 비밀번호가 "12345678"임 (복잡성 미충족)
WHEN: 사용자가 등록 양식을 제출함
THEN: 시스템이 400 Bad Request 상태를 반환함
AND: "비밀번호는 8자 이상이어야 하며, 대문자, 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다." 오류 메시지가 반환됨
AND: 사용자 계정이 생성되지 않음
```

---

### AC-001-04: 잘못된 이메일 형식

**시나리오:** 유효하지 않은 이메일 형식으로 등록 시도

```gherkin
GIVEN: 잘못된 이메일 형식 "invalid-email"
WHEN: 사용자가 등록 양식을 제출함
THEN: 시스템이 400 Bad Request 상태를 반환함
AND: "유효한 이메일 주소를 입력하세요." 오류 메시지가 반환됨
```

---

## US-002: 이메일 인증

### AC-002-01: 정상적인 이메일 인증

**시나리오:** 유효한 인증 토큰으로 이메일 인증 완료

```gherkin
GIVEN: PENDING 상태의 사용자 계정
AND: 24시간 내 생성된 유효한 이메일 인증 토큰
WHEN: 사용자가 인증 링크를 클릭함
THEN: 시스템이 토큰을 검증함
AND: 계정 상태가 ACTIVE로 변경됨
AND: email_verified가 true로 설정됨
AND: email_verified_at에 현재 시간이 기록됨
AND: 인증 토큰이 무효화됨
AND: "이메일 인증이 완료되었습니다." 메시지가 반환됨
AND: auth_events 테이블에 "email_verified" 이벤트가 기록됨
```

---

### AC-002-02: 만료된 인증 토큰

**시나리오:** 24시간이 지난 인증 토큰으로 인증 시도

```gherkin
GIVEN: PENDING 상태의 사용자 계정
AND: 24시간 이상 지난 만료된 인증 토큰
WHEN: 사용자가 인증 링크를 클릭함
THEN: 시스템이 400 Bad Request 상태를 반환함
AND: "인증 링크가 만료되었습니다. 새 인증 이메일을 요청하세요." 메시지가 반환됨
AND: 계정 상태가 PENDING으로 유지됨
```

---

### AC-002-03: 이미 사용된 인증 토큰

**시나리오:** 이미 인증에 사용된 토큰으로 재인증 시도

```gherkin
GIVEN: ACTIVE 상태의 사용자 계정 (이미 인증됨)
AND: 이미 사용된 인증 토큰
WHEN: 사용자가 인증 링크를 다시 클릭함
THEN: 시스템이 400 Bad Request 상태를 반환함
AND: "이미 인증된 계정입니다." 메시지가 반환됨
```

---

### AC-002-04: 인증 이메일 재발송

**시나리오:** 만료된 토큰에 대한 새 인증 이메일 요청

```gherkin
GIVEN: PENDING 상태의 사용자 계정
WHEN: 사용자가 인증 이메일 재발송을 요청함
THEN: 시스템이 새로운 24시간 유효한 인증 토큰을 생성함
AND: 이전 인증 토큰이 무효화됨
AND: 새 인증 이메일이 발송됨
AND: "새 인증 이메일이 발송되었습니다." 메시지가 반환됨
```

---

## US-003: 사용자 로그인

### AC-003-01: 정상적인 로그인

**시나리오:** ACTIVE 상태의 사용자가 올바른 자격 증명으로 로그인

```gherkin
GIVEN: ACTIVE 상태의 사용자 계정 (이메일: "user@example.com")
AND: 올바른 비밀번호
AND: 실패한 로그인 시도가 5회 미만임
WHEN: 사용자가 로그인 양식을 제출함
THEN: 시스템이 비밀번호를 bcrypt로 검증함
AND: 15분 유효한 액세스 토큰(JWT)이 생성됨
AND: 7일 유효한 리프레시 토큰이 생성됨
AND: 리프레시 토큰이 sessions 테이블에 저장됨 (user_agent, ip_address 포함)
AND: 액세스 토큰이 httpOnly + Secure + SameSite=strict 쿠키로 설정됨
AND: 리프레시 토큰이 httpOnly + Secure + SameSite=strict 쿠키로 설정됨
AND: 응답 시간이 500ms 미만임 (p95)
AND: auth_events 테이블에 "login" 이벤트가 기록됨
AND: failed_login_attempts가 0으로 리셋됨
```

---

### AC-003-02: 잘못된 비밀번호

**시나리오:** 올바르지 않은 비밀번호로 로그인 시도

```gherkin
GIVEN: ACTIVE 상태의 사용자 계정
AND: 올바르지 않은 비밀번호
WHEN: 사용자가 로그인 양식을 제출함
THEN: 시스템이 401 Unauthorized 상태를 반환함
AND: "이메일 또는 비밀번호가 올바르지 않습니다." 오류 메시지가 반환됨
AND: failed_login_attempts가 1 증가함
AND: auth_events 테이블에 "login_failed" 이벤트가 기록됨
AND: 어떤 계정이 존재하는지 노출하지 않음 (이메일 존재 여부와 비밀번호 오류를 동일하게 처리)
```

---

### AC-003-03: 존재하지 않는 이메일

**시나리오:** 등록되지 않은 이메일로 로그인 시도

```gherkin
GIVEN: 등록되지 않은 이메일 "nonexistent@example.com"
WHEN: 사용자가 로그인 양식을 제출함
THEN: 시스템이 401 Unauthorized 상태를 반환함
AND: "이메일 또는 비밀번호가 올바르지 않습니다." 오류 메시지가 반환됨
AND: auth_events 테이블에 "login_failed" 이벤트가 기록됨 (user_id는 null)
AND: 어떤 이메일이 등록되어 있는지 노출하지 않음
```

---

### AC-003-04: PENDING 상태 계정 로그인

**시나리오:** 이메일 인증이 완료되지 않은 계정으로 로그인 시도

```gherkin
GIVEN: PENDING 상태의 사용자 계정
AND: 올바른 비밀번호
WHEN: 사용자가 로그인 양식을 제출함
THEN: 시스템이 403 Forbidden 상태를 반환함
AND: "이메일 인증이 완료되지 않았습니다. 이메일을 확인하세요." 메시지가 반환됨
AND: 인증 이메일 재발송 옵션이 제공됨
```

---

### AC-003-05: 계정 잠금 (5회 실패)

**시나리오:** 5회 연속 로그인 실패로 계정 잠금

```gherkin
GIVEN: ACTIVE 상태의 사용자 계정
AND: 최근 5분 내 4회 실패한 로그인 시도
WHEN: 사용자가 5번째로 잘못된 비밀번호로 로그인을 시도함
THEN: 시스템이 423 Locked 상태를 반환함
AND: "계정이 잠겼습니다. 15분 후에 다시 시도하세요." 메시지가 반환됨
AND: locked_until이 현재 시간 + 15분으로 설정됨
AND: auth_events 테이블에 "account_locked" 이벤트가 기록됨
```

---

### AC-003-06: 잠긴 계정 로그인 시도

**시나리오:** 잠긴 계정으로 로그인 시도

```gherkin
GIVEN: LOCKED 상태의 사용자 계정
AND: locked_until이 미래 시간임
WHEN: 사용자가 로그인 양식을 제출함 (올바른 비밀번호)
THEN: 시스템이 423 Locked 상태를 반환함
AND: "계정이 잠겼습니다. X분 후에 다시 시도하세요." 메시지가 반환됨 (X는 남은 시간)
```

---

### AC-003-07: 계정 잠금 자동 해제

**시나리오:** 15분 후 계정 잠금 자동 해제

```gherkin
GIVEN: LOCKED 상태의 사용자 계정
AND: locked_until이 과거 시간임 (15분 경과)
WHEN: 사용자가 올바른 비밀번호로 로그인을 시도함
THEN: 시스템이 정상적으로 로그인을 처리함
AND: locked_until이 null로 설정됨
AND: failed_login_attempts가 0으로 리셋됨
AND: auth_events 테이블에 "account_unlocked" 이벤트가 기록됨
```

---

### AC-003-08: Rate Limiting 적용

**시나리오:** 동일 IP에서 5회/15분 초과 로그인 시도

```gherkin
GIVEN: 동일 IP 주소
AND: 최근 15분 내 5회 로그인 시도 (성공/실패 무관)
WHEN: 사용자가 6번째 로그인을 시도함
THEN: 시스템이 429 Too Many Requests 상태를 반환함
AND: "너무 많은 로그인 시도가 있었습니다. 15분 후에 다시 시도하세요." 메시지가 반환됨
AND: Retry-After 헤더에 남은 시간이 포함됨
```

---

## US-004: 비밀번호 재설정

### AC-004-01: 비밀번호 재설정 요청

**시나리오:** 등록된 이메일로 비밀번호 재설정 요청

```gherkin
GIVEN: ACTIVE 상태의 사용자 계정 (이메일: "user@example.com")
WHEN: 사용자가 비밀번호 재설정을 요청함
THEN: 시스템이 1시간 유효한 재설정 토큰을 생성함
AND: 재설정 이메일이 발송됨
AND: "비밀번호 재설정 이메일이 발송되었습니다." 메시지가 반환됨
AND: auth_events 테이블에 "password_reset_requested" 이벤트가 기록됨
```

---

### AC-004-02: 존재하지 않는 이메일로 재설정 요청

**시나리오:** 등록되지 않은 이메일로 재설정 요청

```gherkin
GIVEN: 등록되지 않은 이메일 "nonexistent@example.com"
WHEN: 사용자가 비밀번호 재설정을 요청함
THEN: 시스템이 200 OK 상태를 반환함 (보안상 존재 여부 노출 금지)
AND: "비밀번호 재설정 이메일이 발송되었습니다." 메시지가 반환됨
AND: 실제로는 이메일이 발송되지 않음
AND: auth_events 테이블에 기록되지 않음 (스팸 방지)
```

---

### AC-004-03: 비밀번호 재설정 실행

**시나리오:** 유효한 재설정 토큰으로 비밀번호 변경

```gherkin
GIVEN: 유효한 재설정 토큰
AND: 새 비밀번호가 복잡성 요구사항을 충족함
WHEN: 사용자가 새 비밀번호를 제출함
THEN: 시스템이 토큰을 검증함
AND: 새 비밀번호가 bcrypt로 해시화되어 저장됨
AND: 재설정 토큰이 무효화됨
AND: 해당 사용자의 모든 활성 세션이 무효화됨 (모든 기기에서 로그아웃)
AND: "비밀번호가 변경되었습니다. 다시 로그인하세요." 메시지가 반환됨
AND: auth_events 테이블에 "password_reset_completed" 이벤트가 기록됨
```

---

### AC-004-04: 만료된 재설정 토큰

**시나리오:** 1시간이 지난 재설정 토큰으로 비밀번호 변경 시도

```gherkin
GIVEN: 1시간 이상 지난 만료된 재설정 토큰
WHEN: 사용자가 새 비밀번호를 제출함
THEN: 시스템이 400 Bad Request 상태를 반환함
AND: "재설정 링크가 만료되었습니다. 새 재설정 이메일을 요청하세요." 메시지가 반환됨
AND: 비밀번호가 변경되지 않음
```

---

### AC-004-05: 비밀번호 재사용 방지

**시나리오:** 최근 사용한 비밀번호로 변경 시도

```gherkin
GIVEN: 유효한 재설정 토큰
AND: 새 비밀번호가 최근 5개 비밀번호 중 하나임
WHEN: 사용자가 새 비밀번호를 제출함
THEN: 시스템이 400 Bad Request 상태를 반환함
AND: "최근 사용한 5개 비밀번호는 재사용할 수 없습니다." 오류 메시지가 반환됨
AND: 비밀번호가 변경되지 않음
```

---

## US-005: 토큰 갱신

### AC-005-01: 정상적인 토큰 갱신

**시나리오:** 유효한 리프레시 토큰으로 액세스 토큰 갱신

```gherkin
GIVEN: 유효한 리프레시 토큰 (7일 내)
AND: 만료된 액세스 토큰
WHEN: 클라이언트가 토큰 갱신을 요청함
THEN: 시스템이 리프레시 토큰을 검증함
AND: 새로운 15분 유효한 액세스 토큰이 생성됨
AND: 새로운 7일 유효한 리프레시 토큰이 생성됨
AND: 기존 리프레시 토큰이 무효화됨 (토큰 로테이션)
AND: 새 토큰이 쿠키로 설정됨
AND: 응답 시간이 200ms 미만임 (p95)
AND: auth_events 테이블에 "token_refresh" 이벤트가 기록됨
```

---

### AC-005-02: 만료된 리프레시 토큰

**시나리오:** 7일이 지난 리프레시 토큰으로 갱신 시도

```gherkin
GIVEN: 7일 이상 지난 만료된 리프레시 토큰
WHEN: 클라이언트가 토큰 갱신을 요청함
THEN: 시스템이 401 Unauthorized 상태를 반환함
AND: "세션이 만료되었습니다. 다시 로그인하세요." 메시지가 반환됨
AND: 쿠키가 삭제됨
AND: auth_events 테이블에 "token_refresh_failed" 이벤트가 기록됨
```

---

### AC-005-03: 리프레시 토큰 재사용 방지

**시나리오:** 이미 사용된 리프레시 토큰으로 재갱신 시도

```gherkin
GIVEN: 이미 사용된 (무효화된) 리프레시 토큰
WHEN: 클라이언트가 토큰 갱신을 요청함
THEN: 시스템이 401 Unauthorized 상태를 반환함
AND: 해당 사용자의 모든 세션이 무효화됨 (토큰 탈취 의심)
AND: 보안 알림 이메일이 발송됨
AND: auth_events 테이블에 "token_reuse_detected" 이벤트가 기록됨
```

---

### AC-005-04: 요청 중 토큰 만료 자동 갱신

**시나리오:** API 요청 중 액세스 토큰이 만료됨

```gherkin
GIVEN: 유효한 리프레시 토큰
AND: 만료된 액세스 토큰
WHEN: 클라이언트가 보호된 API를 호출함
THEN: 시스템이 401 Unauthorized 상태를 반환함 (토큰 만료)
AND: 클라이언트 인터셉터가 자동으로 토큰 갱신을 요청함
AND: 새 토큰으로 원래 요청이 재시도됨
AND: 사용자에게 로그인 페이지가 표시되지 않음
```

---

## US-006: 역할 기반 접근 제어 (RBAC)

### AC-006-01: 관리자 권한으로 보호된 리소스 접근

**시나리오:** admin 역할의 사용자가 관리자 전용 API에 접근

```gherkin
GIVEN: admin 역할을 가진 사용자
AND: 유효한 액세스 토큰
WHEN: 사용자가 관리자 전용 API (예: /api/admin/users)를 호출함
THEN: 시스템이 JWT에서 사용자 ID와 역할을 추출함
AND: 요청된 작업에 대한 권한을 확인함
AND: 요청이 정상적으로 처리됨 (200 OK)
```

---

### AC-006-02: 권한 없는 사용자의 보호된 리소스 접근

**시나리오:** member 역할의 사용자가 관리자 전용 API에 접근 시도

```gherkin
GIVEN: member 역할을 가진 사용자
AND: 유효한 액세스 토큰
WHEN: 사용자가 관리자 전용 API를 호출함
THEN: 시스템이 403 Forbidden 상태를 반환함
AND: "접근 권한이 없습니다." 오류 메시지가 반환됨
AND: auth_events 테이블에 "access_denied" 이벤트가 기록됨
```

---

### AC-006-03: 인증되지 않은 사용자의 보호된 리소스 접근

**시나리오:** 로그인하지 않은 사용자가 보호된 API에 접근 시도

```gherkin
GIVEN: 인증되지 않은 사용자 (토큰 없음)
WHEN: 사용자가 보호된 API를 호출함
THEN: 시스템이 401 Unauthorized 상태를 반환함
AND: "로그인이 필요합니다." 오류 메시지가 반환됨
```

---

### AC-006-04: 역할 변경 즉시 적용

**시나리오:** 관리자가 사용자의 역할을 변경한 후 즉시 권한 적용

```gherkin
GIVEN: member 역할의 사용자
AND: 유효한 액세스 토큰 (15분 유효)
WHEN: 관리자가 사용자의 역할을 admin으로 변경함
AND: 사용자가 다음 API 요청을 수행함
THEN: 시스템이 데이터베이스에서 최신 역할을 조회함 (JWT 역할 무시)
AND: 새로운 권한이 즉시 적용됨
AND: 관리자 전용 API에 접근할 수 있음
```

---

### AC-006-05: 다중 역할 사용자

**시나리오:** 여러 역할을 가진 사용자의 권한 확인

```gherkin
GIVEN: member와 owner 역할을 모두 가진 사용자
AND: 유효한 액세스 토큰
WHEN: 사용자가 owner 권한이 필요한 API를 호출함
THEN: 시스템이 사용자의 모든 역할을 확인함
AND: 요청된 작업에 대한 권한이 있음을 확인함
AND: 요청이 정상적으로 처리됨
```

---

## US-007: 세션 관리

### AC-007-01: 활성 세션 목록 조회

**시나리오:** 사용자가 모든 활성 세션 목록을 조회

```gherkin
GIVEN: 로그인된 사용자
AND: 3개의 활성 세션 (Chrome, Firefox, Mobile)
WHEN: 사용자가 세션 목록 API를 호출함
THEN: 시스템이 모든 활성 세션을 반환함
AND: 각 세션에 다음 정보가 포함됨:
  - 세션 ID
  - 기기 정보 (User-Agent에서 파싱)
  - IP 주소
  - 마지막 활동 시간
  - 생성 시간
  - 현재 세션 여부
```

---

### AC-007-02: 개별 세션 로그아웃

**시나리오:** 사용자가 특정 기기에서 로그아웃

```gherkin
GIVEN: 3개의 활성 세션
AND: 세션 ID "session-123"이 Chrome 브라우저임
WHEN: 사용자가 세션 "session-123"을 로그아웃시킴
THEN: 시스템이 해당 세션의 리프레시 토큰을 무효화함
AND: 세션 상태가 "revoked"로 변경됨
AND: 활성 세션 목록에서 제거됨
AND: Chrome 브라우저에서 다음 요청 시 401 Unauthorized가 반환됨
AND: auth_events 테이블에 "session_revoked" 이벤트가 기록됨
```

---

### AC-007-03: 모든 기기에서 로그아웃

**시나리오:** 사용자가 모든 기기에서 로그아웃

```gherkin
GIVEN: 3개의 활성 세션
WHEN: 사용자가 "모든 기기에서 로그아웃"을 요청함
THEN: 시스템이 해당 사용자의 모든 리프레시 토큰을 무효화함
AND: 모든 세션 상태가 "revoked"로 변경됨
AND: 활성 세션 목록이 비어있음
AND: 현재 세션도 로그아웃됨
AND: auth_events 테이블에 "all_sessions_revoked" 이벤트가 기록됨
```

---

### AC-007-04: 최대 세션 수 제한 (5개)

**시나리오:** 6번째 기기에서 로그인 시도

```gherkin
GIVEN: 5개의 활성 세션
AND: 가장 오래된 세션이 "session-oldest"임
WHEN: 사용자가 6번째 기기에서 로그인함
THEN: 시스템이 가장 오래된 세션 "session-oldest"를 자동으로 로그아웃시킴
AND: 새로운 세션이 생성됨
AND: 활성 세션 수가 5개로 유지됨
AND: auth_events 테이블에 "session_limit_enforced" 이벤트가 기록됨
```

---

## US-008: 보호된 라우트 접근

### AC-008-01: 인증되지 않은 사용자의 보호된 페이지 접근

**시나리오:** 로그인하지 않은 사용자가 보호된 페이지에 접근

```gherkin
GIVEN: 인증되지 않은 사용자 (토큰 없음)
WHEN: 사용자가 보호된 페이지 (예: /dashboard)에 접근함
THEN: 시스템이 401 Unauthorized 상태를 반환함
AND: 로그인 페이지 (/login)로 리다이렉트됨
AND: 원래 요청한 URL이 쿼리 파라미터로 저장됨 (?redirect=/dashboard)
```

---

### AC-008-02: 인증된 사용자의 보호된 페이지 접근

**시나리오:** 로그인된 사용자가 보호된 페이지에 접근

```gherkin
GIVEN: 인증된 사용자
AND: 유효한 액세스 토큰
WHEN: 사용자가 보호된 페이지에 접근함
THEN: 시스템이 토큰을 검증함
AND: 요청된 페이지가 정상적으로 렌더링됨
```

---

### AC-008-03: 권한 기반 UI 요소 표시

**시나리오:** 역할에 따라 UI 요소가 다르게 표시됨

```gherkin
GIVEN: member 역할의 사용자
AND: 관리자 전용 버튼이 있는 페이지
WHEN: 사용자가 페이지를 조회함
THEN: 관리자 전용 버튼이 렌더링되지 않음
AND: 일반 사용자용 UI만 표시됨
```

---

### AC-008-04: 로그인 후 원래 페이지로 리다이렉트

**시나리오:** 로그인 후 원래 요청한 페이지로 이동

```gherkin
GIVEN: 인증되지 않은 사용자가 /dashboard에 접근 시도
AND: 로그인 페이지로 리다이렉트됨 (?redirect=/dashboard)
WHEN: 사용자가 로그인을 완료함
THEN: 시스템이 쿼리 파라미터의 redirect 값을 확인함
AND: 원래 요청한 /dashboard 페이지로 리다이렉트됨
```

---

## 비기능 요구사항 승인 기준

### 성능 승인 기준

#### AC-PERF-01: 로그인 응답 시간

```gherkin
GIVEN: ACTIVE 상태의 사용자 계정
WHEN: 사용자가 100회 로그인을 수행함
THEN: 95번째 백분위수(p95) 응답 시간이 500ms 미만임
AND: 99번째 백분위수(p99) 응답 시간이 1000ms 미만임
```

---

#### AC-PERF-02: 토큰 갱신 응답 시간

```gherkin
GIVEN: 유효한 리프레시 토큰
WHEN: 클라이언트가 100회 토큰 갱신을 수행함
THEN: 95번째 백분위수(p95) 응답 시간이 200ms 미만임
AND: 99번째 백분위수(p99) 응답 시간이 500ms 미만임
```

---

#### AC-PERF-03: 동시 로그인 처리

```gherkin
GIVEN: 100명의 동시 사용자
WHEN: 모든 사용자가 동시에 로그인을 요청함
THEN: 시스템이 모든 요청을 처리함
AND: 에러율이 1% 미만임
AND: 평균 응답 시간이 1000ms 미만임
```

---

### 보안 승인 기준

#### AC-SEC-01: 비밀번호 해시화 검증

```gherkin
GIVEN: 사용자가 등록함
WHEN: 데이터베이스를 조회함
THEN: password 컬럼이 존재하지 않음
AND: password_hash 컬럼만 존재함
AND: password_hash가 bcrypt 해시 형식임 ($2b$12$...)
AND: 평문 비밀번호가 저장되지 않음
```

---

#### AC-SEC-02: JWT 서명 검증

```gherkin
GIVEN: 서명되지 않은 JWT
WHEN: 클라이언트가 보호된 API를 호출함
THEN: 시스템이 401 Unauthorized 상태를 반환함
AND: "유효하지 않은 토큰입니다." 오류 메시지가 반환됨
```

---

#### AC-SEC-03: 쿠키 보안 속성

```gherkin
GIVEN: 로그인 응답
WHEN: Set-Cookie 헤더를 확인함
THEN: HttpOnly 플래그가 설정됨
AND: Secure 플래그가 설정됨
AND: SameSite=Strict가 설정됨
AND: Path=/가 설정됨
```

---

#### AC-SEC-04: OWASP Top 10 준수

```gherkin
GIVEN: 완성된 인증 시스템
WHEN: OWASP ZAP으로 보안 스캔을 수행함
THEN: High 심각도 취약점이 0개임
AND: Medium 심각도 취약점이 0개임
AND: Low 심각도 취약점이 5개 미만임
```

---

### 신뢰성 승인 기준

#### AC-REL-01: 데이터베이스 연결 실패 복구

```gherkin
GIVEN: 정상 작동 중인 시스템
WHEN: 데이터베이스 연결이 일시적으로 끊김 (5초)
THEN: 시스템이 연결 풀에서 자동으로 재연결함
AND: 사용자 요청이 실패하지 않음 (커넥션 풀 대기)
AND: 에러 로그가 기록됨
```

---

#### AC-REL-02: 토큰 갱신 실패 시 재시도

```gherkin
GIVEN: 네트워크 불안정 상태
WHEN: 토큰 갱신 요청이 실패함
THEN: 클라이언트가 자동으로 재시도함 (최대 3회)
AND: 지수 백오프가 적용됨 (1초, 2초, 4초)
AND: 3회 실패 시 로그인 페이지로 리다이렉트됨
```

---

## 테스트 실행 계획

### 단위 테스트 (Unit Tests)

**범위:** 서비스 계층, 유틸리티 함수
**도구:** Vitest
**커버리지 목표:** 85%+
**실행 빈도:** 매 커밋

```bash
npm run test:unit -- --coverage
```

---

### 통합 테스트 (Integration Tests)

**범위:** tRPC 라우터, 미들웨어, 데이터베이스 상호작용
**도구:** Vitest + TestContainers (PostgreSQL)
**커버리지 목표:** 80%+
**실행 빈도:** Pull Request 생성 시

```bash
npm run test:integration
```

---

### E2E 테스트 (End-to-End Tests)

**범위:** 전체 인증 플로우 (UI + API)
**도구:** Playwright
**실행 시나리오:**
- AC-001-01 ~ AC-001-04 (사용자 등록)
- AC-002-01 ~ AC-002-04 (이메일 인증)
- AC-003-01 ~ AC-003-08 (로그인)
- AC-004-01 ~ AC-004-05 (비밀번호 재설정)
- AC-005-01 ~ AC-005-04 (토큰 갱신)
- AC-006-01 ~ AC-006-05 (RBAC)
- AC-007-01 ~ AC-007-04 (세션 관리)
- AC-008-01 ~ AC-008-04 (보호된 라우트)

**실행 빈도:** main 브랜치 병합 전

```bash
npm run test:e2e
```

---

### 성능 테스트 (Performance Tests)

**도구:** k6 또는 Artillery
**시나리오:**
- AC-PERF-01: 로그인 응답 시간
- AC-PERF-02: 토큰 갱신 응답 시간
- AC-PERF-03: 동시 로그인 처리

**실행 빈도:** 릴리즈 전

```bash
npm run test:performance
```

---

### 보안 테스트 (Security Tests)

**도구:** OWASP ZAP, npm audit
**시나리오:**
- AC-SEC-01 ~ AC-SEC-04

**실행 빈도:** 주 1회 + 릴리즈 전

```bash
npm run test:security
```

---

## Definition of Done (DoD)

### 기능 완료 기준

- [ ] 모든 승인 기준(Given-When-Then)이 테스트로 구현됨
- [ ] 모든 단위 테스트가 통과함
- [ ] 모든 통합 테스트가 통과함
- [ ] 모든 E2E 테스트가 통과함
- [ ] 코드 커버리지가 85% 이상임

### 품질 완료 기준

- [ ] TypeScript strict mode에서 에러가 없음
- [ ] ESLint 에러가 없음
- [ ] Prettier 포맷팅이 적용됨
- [ ] 모든 함수에 JSDoc 주석이 작성됨
- [ ] 코드 리뷰가 완료됨

### 보안 완료 기준

- [ ] OWASP Top 10 항목이 모두 검증됨
- [ ] OWASP ZAP 스캔에서 High/Medium 취약점이 없음
- [ ] npm audit에서 취약점이 없음 (또는 완화됨)
- [ ] 보안 관련 코드가 보안팀 리뷰를 통과함

### 문서화 완료 기준

- [ ] API 문서(OpenAPI)가 최신 상태임
- [ ] README에 인증 플로우가 설명됨
- [ ] 환경 변수 문서가 작성됨
- [ ] 운영 가이드가 작성됨

### 배포 완료 기준

- [ ] CI/CD 파이프라인이 통과함
- [ ] Staging 환경에서 smoke 테스트가 통과함
- [ ] Performance 테스트가 통과함
- [ ] 롤백 계획이 문서화됨

---

## 추적성 매트릭스 (Traceability Matrix)

| User Story | Acceptance Criteria | Unit Tests | Integration Tests | E2E Tests |
|------------|---------------------|------------|-------------------|-----------|
| US-001 | AC-001-01 ~ 04 | password.test.ts | auth.test.ts | auth-flow.spec.ts |
| US-002 | AC-002-01 ~ 04 | auth-service.test.ts | auth.test.ts | auth-flow.spec.ts |
| US-003 | AC-003-01 ~ 08 | auth-service.test.ts, rate-limiter.test.ts | auth.test.ts | auth-flow.spec.ts |
| US-004 | AC-004-01 ~ 05 | auth-service.test.ts, email-service.test.ts | auth.test.ts | auth-flow.spec.ts |
| US-005 | AC-005-01 ~ 04 | token-service.test.ts | auth.test.ts | auth-flow.spec.ts |
| US-006 | AC-006-01 ~ 05 | authorized.test.ts | user.test.ts | rbac.spec.ts |
| US-007 | AC-007-01 ~ 04 | session-service.test.ts | user.test.ts | session-management.spec.ts |
| US-008 | AC-008-01 ~ 04 | ProtectedRoute.test.tsx | - | auth-flow.spec.ts |

---

## 승인 서명 (Approval Signatures)

| 역할 | 이름 | 승인일 | 서명 |
|------|------|--------|------|
| QA 리드 | | | |
| 개발 리드 | | | |
| 보안 담당자 | | | |
| 제품 관리자 | | | |

---

**참고:** 모든 승인 기준은 Gherkin 형식으로 작성되어 자동화된 테스트로 변환 가능합니다. 테스트 실행 계획에 따라 각 단계에서 적절한 테스트를 수행하세요.
