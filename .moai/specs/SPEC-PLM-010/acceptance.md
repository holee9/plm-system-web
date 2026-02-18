# SPEC-PLM-010: 인수 기준 (Acceptance Criteria)

## 메타데이터

| 필드 | 값 |
|------|-----|
| SPEC ID | SPEC-PLM-010 |
| 제목 | 문서 고급 기능 인수 기준 |
| 형식 | Gherkin (Given-When-Then) |

---

## 1. 문서 미리보기 (D-010)

### 1.1 PDF 미리보기

#### TC-PREVIEW-001: PDF 파일 미리보기 기본

```gherkin
Feature: PDF 문서 미리보기

  Scenario: 사용자가 PDF 파일 미리보기 요청
    Given 사용자가 인증된 상태이다
    And 프로젝트 "PRJ-001"에 문서 "document.pdf"가 존재한다
    And 파일 형식은 "application/pdf"이다
    And 파일 크기는 5MB이다

    When 사용자가 문서 목록에서 "미리보기" 버튼을 클릭한다

    Then 미리보기 모달이 열린다
    And PDF 첫 번째 페이지가 렌더링된다
    And 문서 메타데이터가 표시된다
      | 필드 | 값 |
      | 파일명 | document.pdf |
      | 크기 | 5MB |
      | 형식 | PDF |
      | 업로드 일시 | 2026-02-18 |
      | 업로더 | 사용자명 |
    And 다운로드 버튼이 표시된다
```

#### TC-PREVIEW-002: PDF 페이지 네비게이션

```gherkin
Feature: PDF 페이지 네비게이션

  Scenario: 사용자가 다중 페이지 PDF 탐색
    Given 사용자가 인증된 상태이다
    And 10페이지짜리 PDF 파일 "manual.pdf"의 미리보기가 열려있다

    When 사용자가 "다음 페이지" 버튼을 클릭한다

    Then 2번째 페이지가 렌더링된다
    And 페이지 인디케이터가 "2 / 10"으로 업데이트된다

    When 사용자가 페이지 입력 필드에 "5"를 입력하고 엔터를 누른다

    Then 5번째 페이지가 렌더링된다
    And 페이지 인디케이터가 "5 / 10"으로 업데이트된다
```

#### TC-PREVIEW-003: PDF 줌 기능

```gherkin
Feature: PDF 줌 기능

  Scenario: 사용자가 PDF 확대/축소
    Given PDF 미리보기가 열려있다
    And 현재 줌 레벨은 100%이다

    When 사용자가 "확대" 버튼을 클릭한다

    Then 줌 레벨이 125%로 변경된다
    And PDF가 확대되어 표시된다

    When 사용자가 "축소" 버튼을 3번 클릭한다

    Then 줌 레벨이 50%로 변경된다
```

#### TC-PREVIEW-004: 대용량 PDF 파일 처리

```gherkin
Feature: 대용량 PDF 파일 처리

  Scenario: 사용자가 10MB 초과 PDF 미리보기
    Given 사용자가 인증된 상태이다
    And 파일 크기가 25MB인 PDF 파일이 존재한다

    When 사용자가 "미리보기" 버튼을 클릭한다

    Then "파일이 커서 로딩 시간이 길 수 있습니다" 경고가 표시된다
    And 로딩 진행률이 표시된다
    And 3초 이내에 첫 번째 페이지가 렌더링된다
```

#### TC-PREVIEW-005: PDF 렌더링 실패 처리

```gherkin
Feature: PDF 렌더링 실패 처리

  Scenario: 손상된 PDF 파일 미리보기
    Given 사용자가 인증된 상태이다
    And 손상된 PDF 파일 "corrupted.pdf"가 존재한다

    When 사용자가 "미리보기" 버튼을 클릭한다

    Then "PDF를 렌더링할 수 없습니다" 오류 메시지가 표시된다
    And "파일 다운로드" 옵션이 제공된다
```

### 1.2 이미지 미리보기

#### TC-PREVIEW-006: 이미지 파일 미리보기

```gherkin
Feature: 이미지 파일 미리보기

  Scenario: 사용자가 PNG 이미지 미리보기
    Given 사용자가 인증된 상태이다
    And PNG 이미지 "diagram.png"가 존재한다
    And 파일 크기는 2MB이다

    When 사용자가 "미리보기" 버튼을 클릭한다

    Then 미리보기 모달이 열린다
    And 이미지가 렌더링된다
    And 문서 메타데이터가 표시된다
    And 다운로드 버튼이 표시된다
```

#### TC-PREVIEW-007: 이미지 줌 및 팬

```gherkin
Feature: 이미지 줌 및 팬

  Scenario: 사용자가 이미지 확대 및 이동
    Given 이미지 미리보기가 열려있다

    When 사용자가 마우스 휠을 위로 굴린다

    Then 이미지가 확대된다

    When 사용자가 확대된 상태에서 이미지를 드래그한다

    Then 이미지가 드래그 방향으로 이동한다
```

#### TC-PREVIEW-008: SVG 안전 렌더링

```gherkin
Feature: SVG 안전 렌더링

  Scenario: SVG 파일에 악성 스크립트 포함 방지
    Given 사용자가 인증된 상태이다
    And 스크립트가 포함된 SVG 파일이 존재한다

    When 사용자가 "미리보기" 버튼을 클릭한다

    Then SVG가 안전하게 렌더링된다
    And 스크립트가 실행되지 않는다
    And 이미지 콘텐츠만 표시된다
```

### 1.3 미지원 형식 처리

#### TC-PREVIEW-009: 미리보기 불가능한 파일 형식

```gherkin
Feature: 미리보기 불가능한 파일 형식

  Scenario: 사용자가 바이너리 파일 미리보기 시도
    Given 사용자가 인증된 상태이다
    And ZIP 파일 "archive.zip"이 존재한다

    When 사용자가 "미리보기" 버튼을 클릭한다

    Then "이 파일 형식은 미리보기를 지원하지 않습니다" 메시지가 표시된다
    And "파일 다운로드" 버튼이 표시된다
    And 문서 메타데이터는 표시된다
```

#### TC-PREVIEW-010: 미리보기 권한 없음

```gherkin
Feature: 미리보기 권한 제어

  Scenario: 권한 없는 사용자의 미리보기 시도
    Given 사용자가 인증된 상태이다
    And 사용자는 프로젝트 "PRJ-001"에 접근 권한이 없다
    And 프로젝트 "PRJ-001"의 문서가 존재한다

    When 사용자가 해당 문서의 미리보기를 시도한다

    Then "접근 권한이 없습니다" 오류가 표시된다
    And 미리보기 모달이 열리지 않는다
```

---

## 2. 버전 간 비교 (D-011)

### 2.1 텍스트 파일 비교

#### TC-COMPARE-001: 텍스트 파일 버전 비교

```gherkin
Feature: 텍스트 파일 버전 비교

  Scenario: 사용자가 두 텍스트 파일 버전 비교
    Given 사용자가 인증된 상태이다
    And 문서 "spec.txt"의 버전 1, 2, 3이 존재한다
    And 버전 1 내용은 "Hello World"이다
    And 버전 3 내용은 "Hello MoAI World"이다

    When 사용자가 "버전 비교" 버튼을 클릭한다
    And 왼쪽 드롭다운에서 "버전 1"을 선택한다
    And 오른쪽 드롭다운에서 "버전 3"을 선택한다
    And "비교" 버튼을 클릭한다

    Then side-by-side 비교 화면이 표시된다
    And "Hello" 텍스트는 변경 없음으로 표시된다
    And "MoAI" 텍스트는 추가됨(녹색)으로 하이라이트된다
    And "World" 텍스트는 변경 없음으로 표시된다
```

#### TC-COMPARE-002: 변경 사항 요약

```gherkin
Feature: 변경 사항 요약

  Scenario: 사용자가 변경 통계 확인
    Given 두 버전의 텍스트 파일 비교가 완료되었다
    And 10줄 추가, 5줄 삭제, 3줄 수정되었다

    Then 변경 요약이 표시된다
      | 항목 | 수량 |
      | 추가된 줄 | 10 |
      | 삭제된 줄 | 5 |
      | 수정된 줄 | 3 |
```

#### TC-COMPARE-003: 동일한 버전 비교

```gherkin
Feature: 동일한 버전 비교

  Scenario: 사용자가 동일한 버전 두 개 선택
    Given 문서 "readme.txt"의 버전 1, 2가 존재한다

    When 사용자가 왼쪽과 오른쪽 모두 "버전 2"를 선택한다
    And "비교" 버튼을 클릭한다

    Then "선택한 두 버전이 동일합니다" 메시지가 표시된다
    And 변경 사항이 0으로 표시된다
```

#### TC-COMPARE-004: 메타데이터 비교

```gherkin
Feature: 메타데이터 비교

  Scenario: 사용자가 파일 메타데이터 차이 확인
    Given 두 버전의 파일이 존재한다
    And 버전 1은 사용자 "Alice"가 업로드 (크기: 1MB)
    And 버전 2는 사용자 "Bob"가 업로드 (크기: 1.5MB)

    When 두 버전 비교를 수행한다

    Then 메타데이터 비교 테이블이 표시된다
      | 항목 | 버전 1 | 버전 2 |
      | 파일 크기 | 1MB | 1.5MB |
      | 업로더 | Alice | Bob |
      | 업로드 일시 | 2026-02-17 | 2026-02-18 |
```

### 2.2 이미지 파일 비교

#### TC-COMPARE-005: 이미지 슬라이더 비교

```gherkin
Feature: 이미지 슬라이더 비교

  Scenario: 사용자가 두 이미지 버전 슬라이더로 비교
    Given 이미지 "diagram.png"의 버전 1, 2가 존재한다

    When 사용자가 두 버전을 선택하고 비교를 수행한다

    Then 이미지 슬라이더 비교 화면이 표시된다
    And 왼쪽은 버전 1 이미지가 표시된다
    And 오른쪽은 버전 2 이미지가 표시된다
    And 중앙에 슬라이더가 위치한다

    When 사용자가 슬라이더를 오른쪽으로 드래그한다

    Then 버전 2 이미지가 더 많이 표시된다
    And 버전 1 이미지는 가려진다
```

#### TC-COMPARE-006: 이미지 메타데이터 비교

```gherkin
Feature: 이미지 메타데이터 비교

  Scenario: 이미지 파일 크기 및 업로더 정보 비교
    Given 이미지 파일의 두 버전이 존재한다

    When 두 버전 비교를 수행한다

    Then 메타데이터 비교 테이블이 표시된다
    And "이미지 콘텐츠 비교는 슬라이더를 사용하세요" 안내가 표시된다
```

### 2.3 바이너리 파일 비교

#### TC-COMPARE-007: 바이너리 파일 비교 제한

```gherkin
Feature: 바이너리 파일 비교 제한

  Scenario: 사용자가 ZIP 파일 버전 비교
    Given ZIP 파일 "archive.zip"의 버전 1, 2가 존재한다

    When 사용자가 두 버전 비교를 수행한다

    Then "바이너리 파일은 콘텐츠 비교를 지원하지 않습니다" 메시지가 표시된다
    And 메타데이터 비교만 표시된다
      | 항목 | 버전 1 | 버전 2 |
      | 파일 크기 | ... | ... |
      | 업로드 일시 | ... | ... |
```

### 2.4 버전 선택 UI

#### TC-COMPARE-008: 버전 선택 드롭다운

```gherkin
Feature: 버전 선택 드롭다운

  Scenario: 사용자가 비교할 버전 선택
    Given 문서 "report.pdf"의 버전 1~5가 존재한다
    And 버전 비교 모달이 열려있다

    When 사용자가 왼쪽 버전 선택 드롭다운을 클릭한다

    Then 버전 1~5 목록이 표시된다
    And 각 버전의 업로드 일시가 함께 표시된다

    When 사용자가 "버전 3"을 선택한다

    Then 왼쪽 선택지가 "버전 3"으로 업데이트된다
```

#### TC-COMPARE-009: 버전 1개만 존재하는 경우

```gherkin
Feature: 버전 1개만 존재하는 경우

  Scenario: 버전이 1개뿐인 문서의 비교 시도
    Given 문서 "single.pdf"의 버전 1만 존재한다

    When 사용자가 "버전 비교" 버튼을 확인한다

    Then 버튼이 비활성화되어 있다
    And 툴팁으로 "비교할 버전이 2개 이상 필요합니다"가 표시된다
```

### 2.5 접근성

#### TC-COMPARE-010: 키보드 네비게이션

```gherkin
Feature: 키보드 네비게이션

  Scenario: 사용자가 키보드로 버전 비교 수행
    Given 버전 비교 모달이 열려있다
    And 포커스가 왼쪽 버전 선택 드롭다운에 있다

    When 사용자가 Enter 키를 누른다

    Then 드롭다운 목록이 열린다

    When 사용자가 아래 화살표 키를 2번 누르고 Enter를 누른다

    Then 세 번째 버전이 선택된다

    When 사용자가 Tab 키를 눌러 비교 버튼으로 이동하고 Enter를 누른다

    Then 비교가 수행된다
```

#### TC-COMPARE-011: 스크린 리더 지원

```gherkin
Feature: 스크린 리더 지원

  Scenario: 스크린 리더 사용자가 변경 사항 파악
    Given 두 버전의 텍스트 파일 비교가 완료되었다
    And 3줄이 추가되고 1줄이 삭제되었다

    Then 스크린 리더가 "총 4개의 변경 사항: 3줄 추가, 1줄 삭제"를 읽는다
    And 추가된 줄은 "추가됨"으로 표시된다
    And 삭제된 줄은 "삭제됨"으로 표시된다
```

---

## 3. 비기능 테스트

### 3.1 성능 테스트

#### TC-PERF-001: PDF 미리보기 로딩 시간

```gherkin
Feature: PDF 미리보기 로딩 시간

  Scenario: 10MB PDF 파일 미리보기
    Given 10MB 크기의 PDF 파일이 존재한다

    When 사용자가 미리보기를 요청한다

    Then 3초 이내에 첫 번째 페이지가 렌더링된다
    And 로딩 진행률이 표시된다
```

#### TC-PERF-002: 버전 비교 로딩 시간

```gherkin
Feature: 버전 비교 로딩 시간

  Scenario: 1000줄 텍스트 파일 비교
    Given 각각 1000줄인 두 텍스트 파일 버전이 존재한다

    When 사용자가 버전 비교를 요청한다

    Then 5초 이내에 diff 결과가 표시된다
```

### 3.2 보안 테스트

#### TC-SEC-001: XSS 방지

```gherkin
Feature: XSS 방지

  Scenario: 악성 스크립트가 포함된 파일 미리보기
    Given 스크립트 태그가 포함된 SVG 파일이 존재한다

    When 사용자가 미리보기를 요청한다

    Then 스크립트가 실행되지 않는다
    And 이미지 콘텐츠만 안전하게 표시된다
```

#### TC-SEC-002: 권한 검증

```gherkin
Feature: 권한 검증

  Scenario: 다른 프로젝트 문서 접근 시도
    Given 사용자가 프로젝트 A에만 접근 권한이 있다
    And 프로젝트 B의 문서가 존재한다

    When 사용자가 프로젝트 B 문서의 미리보기를 시도한다

    Then "접근 권한이 없습니다" 오류가 발생한다
```

---

## 4. Definition of Done

### 4.1 기능 완료 기준

- [ ] 모든 EARS 요구사항이 구현됨
- [ ] 모든 Gherkin 시나리오 테스트 통과
- [ ] 기능 테스트 커버리지 85% 이상
- [ ] E2E 테스트 통과

### 4.2 품질 완료 기준

- [ ] TypeScript strict 모드 에러 0개
- [ ] ESLint/Biome 에러 0개
- [ ] 접근성 검증 완료 (WCAG 2.1 AA)
- [ ] 성능 요구사항 충족

### 4.3 문서 완료 기준

- [ ] API 문서 업데이트
- [ ] 컴포넌트 스토리북 업데이트 (해당 시)
- [ ] README 변경 사항 반영

---

## 5. 추적성 매트릭스

| 요구사항 | Gherkin 시나리오 | 우선순위 | 상태 |
|----------|-----------------|----------|------|
| REQ-PREVIEW-001 | TC-PREVIEW-001 | High | Pending |
| REQ-PREVIEW-002 | TC-PREVIEW-009 | High | Pending |
| REQ-PREVIEW-003 | TC-PREVIEW-001 | High | Pending |
| REQ-PREVIEW-004 | TC-PREVIEW-001 | High | Pending |
| REQ-PREVIEW-005 | TC-PREVIEW-006 | High | Pending |
| REQ-PREVIEW-006 | TC-PREVIEW-001 | Medium | Pending |
| REQ-PREVIEW-007 | TC-PREVIEW-005 | High | Pending |
| REQ-PREVIEW-008 | TC-PREVIEW-004 | Medium | Pending |
| REQ-PREVIEW-009 | TC-PREVIEW-005 | Medium | Pending |
| REQ-PREVIEW-010 | TC-SEC-001 | High | Pending |
| REQ-PREVIEW-011 | TC-PERF-001 | Medium | Pending |
| REQ-COMPARE-001 | TC-COMPARE-008 | High | Pending |
| REQ-COMPARE-002 | TC-COMPARE-001 | High | Pending |
| REQ-COMPARE-003 | TC-COMPARE-001 | High | Pending |
| REQ-COMPARE-004 | TC-COMPARE-001 | High | Pending |
| REQ-COMPARE-005 | TC-COMPARE-004 | High | Pending |
| REQ-COMPARE-006 | TC-COMPARE-005 | High | Pending |
| REQ-COMPARE-007 | TC-COMPARE-002 | Medium | Pending |
| REQ-COMPARE-008 | TC-COMPARE-003 | Medium | Pending |
| REQ-COMPARE-009 | TC-COMPARE-007 | Medium | Pending |
| REQ-COMPARE-010 | TC-COMPARE-009 | Medium | Pending |
| REQ-COMPARE-011 | - | Low | Pending |
| REQ-COMPARE-012 | - | Low | Pending |
| REQ-COMPARE-013 | TC-SEC-001 | High | Pending |
| REQ-COMPARE-014 | TC-COMPARE-001 | Medium | Pending |
