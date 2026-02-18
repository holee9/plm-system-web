# SPEC-PLM-011: 인수 기준 (Acceptance Criteria)

## 메타데이터

| 필드 | 값 |
|------|-----|
| SPEC ID | SPEC-PLM-011 |
| 제목 | 알림 설정 인수 기준 |
| 형식 | Gherkin (Given-When-Then) |

---

## 1. 알림 설정 페이지 (D-006)

### 1.1 설정 페이지 접근

#### TC-SETTINGS-001: 알림 설정 페이지 로딩

```gherkin
Feature: 알림 설정 페이지 로딩

  Scenario: 사용자가 알림 설정 페이지에 처음 접근
    Given 사용자가 인증된 상태이다
    And 사용자의 알림 설정이 존재하지 않는다

    When 사용자가 "/settings/notifications" 페이지에 접근한다

    Then 알림 설정 페이지가 로딩된다
    And 기본 설정값이 표시된다
      | 설정 항목 | 기본값 |
      | 인앱 알림 | 활성화 |
      | 이메일 알림 | 비활성화 |
      | 푸시 알림 | 비활성화 |
      | 이슈 알림 | 활성화 |
      | 프로젝트 알림 | 활성화 |
      | PLM 알림 | 활성화 |
      | 이메일 빈도 | 즉시 |
```

#### TC-SETTINGS-002: 기존 설정 로딩

```gherkin
Feature: 기존 설정 로딩

  Scenario: 사용자가 저장된 설정이 있는 상태에서 페이지 접근
    Given 사용자가 인증된 상태이다
    And 사용자의 알림 설정이 저장되어 있다
      | 설정 항목 | 저장된 값 |
      | 인앱 알림 | 활성화 |
      | 이메일 알림 | 활성화 |
      | 이슈 알림 | 비활성화 |
      | 이메일 빈도 | 일일 |

    When 사용자가 "/settings/notifications" 페이지에 접근한다

    Then 1초 이내에 저장된 설정이 표시된다
    And 인앱 알림 토글이 활성화 상태로 표시된다
    And 이메일 알림 토글이 활성화 상태로 표시된다
    And 이슈 알림 토글이 비활성화 상태로 표시된다
    And 이메일 빈도가 "일일"로 선택되어 있다
```

### 1.2 채널 설정

#### TC-CHANNEL-001: 인앱 알림 토글

```gherkin
Feature: 인앱 알림 토글

  Scenario: 사용자가 인앱 알림 비활성화
    Given 사용자가 인증된 상태이다
    And 알림 설정 페이지가 로딩되어 있다
    And 인앱 알림이 활성화되어 있다

    When 사용자가 "인앱 알림" 토글을 클릭한다

    Then 토글이 즉시 비활성화 상태로 변경된다 (Optimistic)
    And 100ms 이내에 UI가 업데이트된다
    And 백그라운드에서 설정이 저장된다
    And 저장 완료 시 토스트 알림이 표시되지 않는다 (자동 저장)
```

#### TC-CHANNEL-002: 이메일 알림 토글

```gherkin
Feature: 이메일 알림 토글

  Scenario: 사용자가 이메일 알림 활성화
    Given 사용자가 인증된 상태이다
    And 알림 설정 페이지가 로딩되어 있다
    And 이메일 알림이 비활성화되어 있다
    And 이메일 빈도 선택이 숨겨져 있다

    When 사용자가 "이메일 알림" 토글을 클릭한다

    Then 토글이 활성화 상태로 변경된다
    And 이메일 빈도 선택 드롭다운이 표시된다
    And 기본 빈도가 "즉시"로 설정된다
```

#### TC-CHANNEL-003: 푸시 알림 토글

```gherkin
Feature: 푸시 알림 토글

  Scenario: 사용자가 푸시 알림 토글 확인
    Given 사용자가 인증된 상태이다
    And 알림 설정 페이지가 로딩되어 있다

    When 사용자가 "푸시 알림" 토글을 확인한다

    Then 푸시 알림 토글이 표시된다
    And "향후 지원 예정" 라벨이 함께 표시된다
    And 토글은 비활성화 상태로 표시된다
```

### 1.3 카테고리 설정

#### TC-CATEGORY-001: 이슈 알림 카테고리 설정

```gherkin
Feature: 이슈 알림 카테고리 설정

  Scenario: 사용자가 이슈 알림 비활성화
    Given 사용자가 인증된 상태이다
    And 알림 설정 페이지가 로딩되어 있다
    And 이슈 알림이 활성화되어 있다

    When 사용자가 "이슈 알림" 토글을 클릭한다

    Then 이슈 알림이 비활성화된다
    And 이슈 할당, 멘션, 댓글, 상태 변경 알림이 모두 비활성화된다
```

#### TC-CATEGORY-002: 시스템 알림 비활성화 방지

```gherkin
Feature: 시스템 알림 비활성화 방지

  Scenario: 사용자가 시스템 알림 비활성화 시도
    Given 사용자가 인증된 상태이다
    And 알림 설정 페이지가 로딩되어 있다

    When 사용자가 "시스템 알림" 토글을 확인한다

    Then 시스템 알림 토글이 활성화 상태로 표시된다
    And 토글이 비활성화되어 클릭할 수 없다
    And "시스템 알림은 비활성화할 수 없습니다" 툴팁이 표시된다
```

### 1.4 이메일 빈도 설정

#### TC-FREQUENCY-001: 이메일 빈도 변경

```gherkin
Feature: 이메일 빈도 변경

  Scenario: 사용자가 이메일 빈도를 일일 요약으로 변경
    Given 사용자가 인증된 상태이다
    And 알림 설정 페이지가 로딩되어 있다
    And 이메일 알림이 활성화되어 있다
    And 현재 이메일 빈도가 "즉시"이다

    When 사용자가 이메일 빈도 드롭다운을 클릭한다
    And "일일 요약" 옵션을 선택한다

    Then 이메일 빈도가 "일일 요약"으로 변경된다
    And 설정이 자동 저장된다
```

#### TC-FREQUENCY-002: 이메일 비활성화 시 빈도 숨김

```gherkin
Feature: 이메일 비활성화 시 빈도 숨김

  Scenario: 사용자가 이메일 알림 비활성화
    Given 사용자가 인증된 상태이다
    And 이메일 알림이 활성화되어 있다
    And 이메일 빈도 선택이 표시되어 있다

    When 사용자가 "이메일 알림" 토글을 클릭하여 비활성화한다

    Then 이메일 빈도 선택 드롭다운이 숨겨진다
```

---

## 2. 프로젝트별 설정

### 2.1 프로젝트 설정 탭

#### TC-PROJECT-001: 프로젝트별 설정 탭 접근

```gherkin
Feature: 프로젝트별 설정 탭 접근

  Scenario: 사용자가 프로젝트별 설정 탭 확인
    Given 사용자가 인증된 상태이다
    And 사용자가 3개 프로젝트의 멤버이다
    And 알림 설정 페이지가 로딩되어 있다

    When 사용자가 "프로젝트별 설정" 탭을 클릭한다

    Then 3개 프로젝트 목록이 표시된다
    And 각 프로젝트에 대해 별도의 알림 설정이 표시된다
    And "전역 설정 사용" 표시가 함께 표시된다
```

#### TC-PROJECT-002: 프로젝트별 설정 오버라이드

```gherkin
Feature: 프로젝트별 설정 오버라이드

  Scenario: 사용자가 특정 프로젝트에 대해서만 알림 비활성화
    Given 사용자가 인증된 상태이다
    And 사용자가 프로젝트 "PRJ-001"의 멤버이다
    And 전역 이슈 알림이 활성화되어 있다

    When 사용자가 프로젝트 "PRJ-001"의 "이슈 알림" 토글을 비활성화한다

    Then 프로젝트 "PRJ-001"에 대해서만 이슈 알림이 비활성화된다
    And 다른 프로젝트의 이슈 알림은 여전히 활성화 상태이다
    And "전역 설정 재정의" 표시가 나타난다
```

#### TC-PROJECT-003: 비멤버 프로젝트 설정 숨김

```gherkin
Feature: 비멤버 프로젝트 설정 숨김

  Scenario: 사용자가 탈퇴한 프로젝트 설정 미표시
    Given 사용자가 인증된 상태이다
    And 사용자가 프로젝트 "PRJ-001"의 멤버가 아니다

    When 사용자가 "프로젝트별 설정" 탭을 확인한다

    Then 프로젝트 "PRJ-001"이 목록에 표시되지 않는다
```

---

## 3. 에러 처리

### 3.1 저장 실패 처리

#### TC-ERROR-001: 설정 저장 실패 롤백

```gherkin
Feature: 설정 저장 실패 롤백

  Scenario: 네트워크 오류로 설정 저장 실패
    Given 사용자가 인증된 상태이다
    And 알림 설정 페이지가 로딩되어 있다
    And 인앱 알림이 활성화되어 있다
    And 네트워크 연결이 불안정하다

    When 사용자가 "인앱 알림" 토글을 클릭하여 비활성화한다
    And 서버 저장이 실패한다

    Then 토글이 활성화 상태로 롤백된다
    And "설정 저장에 실패했습니다. 다시 시도해 주세요." 토스트가 표시된다
```

#### TC-ERROR-002: 권한 없는 접근

```gherkin
Feature: 권한 없는 접근

  Scenario: 미인증 사용자의 설정 페이지 접근
    Given 사용자가 인증되지 않은 상태이다

    When 사용자가 "/settings/notifications" 페이지에 접근한다

    Then 로그인 페이지로 리다이렉트된다
```

---

## 4. 기본값 복원

### 4.1 전역 설정 복원

#### TC-RESET-001: 전역 설정 기본값 복원

```gherkin
Feature: 전역 설정 기본값 복원

  Scenario: 사용자가 전역 설정을 기본값으로 복원
    Given 사용자가 인증된 상태이다
    And 알림 설정 페이지가 로딩되어 있다
    And 일부 설정이 기본값과 다르다

    When 사용자가 "기본 설정 복원" 버튼을 클릭한다
    And 확인 다이얼로그에서 "복원" 버튼을 클릭한다

    Then 모든 전역 설정이 기본값으로 복원된다
      | 설정 항목 | 기본값 |
      | 인앱 알림 | 활성화 |
      | 이메일 알림 | 비활성화 |
      | 푸시 알림 | 비활성화 |
      | 이슈 알림 | 활성화 |
      | 프로젝트 알림 | 활성화 |
      | PLM 알림 | 활성화 |
      | 이메일 빈도 | 즉시 |
    And "설정이 기본값으로 복원되었습니다." 토스트가 표시된다
```

#### TC-RESET-002: 프로젝트별 설정 기본값 복원

```gherkin
Feature: 프로젝트별 설정 기본값 복원

  Scenario: 사용자가 특정 프로젝트 설정을 기본값으로 복원
    Given 사용자가 인증된 상태이다
    And 프로젝트 "PRJ-001"의 개별 알림 설정이 존재한다

    When 사용자가 프로젝트 "PRJ-001"의 "기본 설정 복원" 버튼을 클릭한다

    Then 프로젝트 "PRJ-001"의 개별 설정이 삭제된다
    And 전역 설정이 해당 프로젝트에 적용된다
    And "전역 설정 사용" 표시가 나타난다
```

---

## 5. 접근성 테스트

### 5.1 키보드 네비게이션

#### TC-A11Y-001: 키보드로 설정 변경

```gherkin
Feature: 키보드로 설정 변경

  Scenario: 사용자가 키보드만으로 설정 변경
    Given 사용자가 인증된 상태이다
    And 알림 설정 페이지가 로딩되어 있다
    And 포커스가 "인앱 알림" 토글에 있다

    When 사용자가 Enter 키를 누른다

    Then 인앱 알림 토글이 토글된다

    When 사용자가 Tab 키를 3번 눌러 이메일 빈도 드롭다운으로 이동한다
    And 아래 화살표 키를 눌러 "일일 요약" 옵션을 선택한다
    And Enter 키를 누른다

    Then 이메일 빈도가 "일일 요약"으로 변경된다
```

### 5.2 스크린 리더 지원

#### TC-A11Y-002: 스크린 리더 설정 상태 인식

```gherkin
Feature: 스크린 리더 설정 상태 인식

  Scenario: 스크린 리더가 토글 상태 인식
    Given 사용자가 스크린 리더를 사용한다
    And 알림 설정 페이지가 로딩되어 있다
    And 인앱 알림이 활성화되어 있다

    When 사용자가 "인앱 알림" 토글로 포커스를 이동한다

    Then 스크린 리더가 "인앱 알림, 활성화됨, 토글 버튼"을 읽는다

    When 사용자가 Enter 키를 눌러 토글을 비활성화한다

    Then 스크린 리더가 "인앱 알림, 비활성화됨"을 읽는다
```

---

## 6. 성능 테스트

### 6.1 로딩 성능

#### TC-PERF-001: 설정 페이지 로딩 시간

```gherkin
Feature: 설정 페이지 로딩 시간

  Scenario: 사용자가 설정 페이지 로딩
    Given 사용자가 인증된 상태이다

    When 사용자가 "/settings/notifications" 페이지에 접근한다

    Then 1초 이내에 설정 데이터가 로딩된다
    And 스켈레톤 UI가 표시되지 않거나 0.5초 미만으로 표시된다
```

### 6.2 상호작용 성능

#### TC-PERF-002: 토글 반응성

```gherkin
Feature: 토글 반응성

  Scenario: 사용자가 토글 변경
    Given 사용자가 인증된 상태이다
    And 알림 설정 페이지가 로딩되어 있다

    When 사용자가 토글을 클릭한다

    Then 100ms 이내에 UI가 업데이트된다 (Optimistic Update)
```

---

## 7. Definition of Done

### 7.1 기능 완료 기준

- [ ] 모든 EARS 요구사항이 구현됨
- [ ] 모든 Gherkin 시나리오 테스트 통과
- [ ] 기능 테스트 커버리지 85% 이상
- [ ] E2E 테스트 통과

### 7.2 품질 완료 기준

- [ ] TypeScript strict 모드 에러 0개
- [ ] ESLint/Biome 에러 0개
- [ ] 접근성 검증 완료 (WCAG 2.1 AA)
- [ ] 성능 요구사항 충족

### 7.3 문서 완료 기준

- [ ] API 문서 업데이트
- [ ] README 변경 사항 반영

---

## 8. 추적성 매트릭스

| 요구사항 | Gherkin 시나리오 | 우선순위 | 상태 |
|----------|-----------------|----------|------|
| REQ-SETTINGS-001 | TC-SETTINGS-001, TC-SETTINGS-002 | High | Pending |
| REQ-SETTINGS-002 | TC-SETTINGS-001 | High | Pending |
| REQ-SETTINGS-003 | TC-CHANNEL-001 | High | Pending |
| REQ-SETTINGS-004 | TC-SETTINGS-001, TC-SETTINGS-002 | High | Pending |
| REQ-SETTINGS-005 | TC-CHANNEL-001 | High | Pending |
| REQ-SETTINGS-006 | TC-FREQUENCY-001 | High | Pending |
| REQ-SETTINGS-007 | TC-PROJECT-002 | Medium | Pending |
| REQ-SETTINGS-008 | TC-ERROR-001 | High | Pending |
| REQ-SETTINGS-009 | TC-PROJECT-003 | Medium | Pending |
| REQ-SETTINGS-010 | TC-FREQUENCY-002 | Medium | Pending |
| REQ-SETTINGS-011 | TC-SETTINGS-001 | High | Pending |
| REQ-SETTINGS-014 | TC-CATEGORY-002 | High | Pending |
| REQ-SETTINGS-015 | TC-ERROR-002 | High | Pending |
| REQ-SETTINGS-016 | TC-ERROR-001 | High | Pending |
| REQ-CHANNEL-001 | TC-CHANNEL-001, TC-CHANNEL-002, TC-CHANNEL-003 | High | Pending |
| REQ-CHANNEL-002 | TC-CHANNEL-001 | High | Pending |
| REQ-CHANNEL-003 | TC-CHANNEL-002 | High | Pending |
| REQ-CATEGORY-001 | TC-CATEGORY-001, TC-CATEGORY-002 | High | Pending |
| REQ-CATEGORY-002 | TC-CATEGORY-001 | High | Pending |
| REQ-FREQUENCY-001 | TC-FREQUENCY-001 | High | Pending |
| REQ-FREQUENCY-002 | TC-FREQUENCY-001 | Medium | Pending |
| REQ-PROJECT-001 | TC-PROJECT-001 | Medium | Pending |
| REQ-PROJECT-002 | TC-PROJECT-002 | Medium | Pending |
| REQ-PROJECT-003 | TC-PROJECT-003 | Medium | Pending |
