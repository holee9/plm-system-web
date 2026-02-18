# SPEC-PLM-012: Acceptance Criteria

## Metadata

- ID: SPEC-PLM-012
- Status: Draft
- Priority: P3
- Created: 2026-02-18

---

## Test Scenarios (Given-When-Then Format)

### Widget Management

#### AC-001: 위젯 추가 패널 표시

```gherkin
Feature: 위젯 추가 패널

Scenario: 대시보드 편집 모드에서 위젯 패널 열기
  Given 사용자가 프로젝트 대시보드 페이지에 있고
  And 사용자는 프로젝트 멤버이다
  When 사용자가 "위젯 추가" 버튼을 클릭하면
  Then 사이드 패널이 열린다
  And 사용 가능한 위젯 목록이 표시된다
  And 각 위젯은 이름, 아이콘, 설명과 함께 표시된다
```

#### AC-002: 위젯 추가

```gherkin
Feature: 위젯 추가

Scenario: 위젯 패널에서 위젯 추가
  Given 위젯 추가 패널이 열려 있고
  And 대시보드에 3개의 위젯이 있다
  When 사용자가 "통계 카드" 위젯을 클릭하면
  Then 새 위젯이 대시보드 그리드에 추가된다
  And 위젯은 빈 공간에 배치된다
  And 레이아웃이 자동으로 저장된다

Scenario: 위젯 추가 시 빈 공간 없음
  Given 대시보드가 꽉 차 있고
  And 최대 위젯 수(20개)에 도달했다
  When 사용자가 위젯을 추가하려 하면
  Then "최대 위젯 수에 도달했습니다" 메시지가 표시된다
  And 위젯이 추가되지 않는다
```

#### AC-003: 위젯 드래그 앤 드롭

```gherkin
Feature: 위젯 드래그 앤 드롭

Scenario: 위젯을 다른 위치로 이동
  Given 대시보드에 여러 위젯이 배치되어 있고
  And 편집 모드가 활성화되어 있다
  When 사용자가 위젯 A를 드래그하여
  And 위젯 B의 위치에 드롭하면
  Then 위젯 A가 새 위치로 이동한다
  And 위젯 B가 기존 위젯 A 위치로 이동한다 (교환)
  And 변경사항이 자동으로 저장된다

Scenario: 드래그 중 실시간 미리보기
  Given 사용자가 위젯을 드래그 중이고
  When 위젯이 다른 그리드 셀 위를 지나면
  Then 해당 위치에 놓일 때의 미리보기가 표시된다
  And 기존 위젯들이 이동할 위치가 표시된다
```

#### AC-004: 위젯 크기 조절

```gherkin
Feature: 위젯 크기 조절

Scenario: 위젯 크기 확장
  Given 위젯이 3x1 크기로 배치되어 있고
  And 오른쪽에 충분한 빈 공간이 있다
  When 사용자가 오른쪽 리사이즈 핸들을 드래그하여
  And 크기를 6x1로 늘리면
  Then 위젯이 새 크기로 확장된다
  And 레이아웃이 재구성된다
  And 변경사항이 저장된다

Scenario: 위젯 크기 축소
  Given 위젯이 6x2 크기로 배치되어 있고
  When 사용자가 크기를 3x1로 줄이면
  Then 위젯이 새 크기로 축소된다
  And 빈 공간이 생긴다

Scenario: 최소 크기 제한
  Given 위젯이 3x1 크기 (최소 크기)
  When 사용자가 더 작게 줄이려 하면
  Then 크기가 줄어들지 않는다
```

#### AC-005: 위젯 삭제

```gherkin
Feature: 위젯 삭제

Scenario: 위젯 삭제 확인
  Given 대시보드에 5개의 위젯이 있고
  When 사용자가 위젯의 삭제 버튼을 클릭하면
  Then 확인 다이얼로그가 표시된다
  And "이 위젯을 삭제하시겠습니까?" 메시지가 나온다

Scenario: 위젯 삭제 실행
  Given 삭제 확인 다이얼로그가 표시되어 있고
  When 사용자가 "삭제"를 클릭하면
  Then 위젯이 대시보드에서 제거된다
  And 나머지 위젯들이 재배치된다
  And 변경사항이 저장된다

Scenario: 위젯 삭제 취소
  Given 삭제 확인 다이얼로그가 표시되어 있고
  When 사용자가 "취소"를 클릭하면
  Then 다이얼로그가 닫힌다
  And 위젯이 유지된다
```

---

### Layout Persistence

#### AC-006: 레이아웃 자동 저장

```gherkin
Feature: 레이아웃 자동 저장

Scenario: 위젯 이동 후 자동 저장
  Given 사용자가 위젯을 이동했다
  When 500ms가 경과하면
  Then 레이아웃이 서버에 저장된다
  And 저장 완료 표시가 나타난다

Scenario: 다중 변경 일괄 저장
  Given 사용자가 위젯을 연속으로 3번 이동했다
  When 마지막 이동 후 500ms가 경과하면
  Then 최종 레이아웃만 저장된다 (중간 상태 무시)
```

#### AC-007: 레이아웃 복원

```gherkin
Feature: 레이아웃 복원

Scenario: 페이지 로드 시 레이아웃 복원
  Given 사용자가 이전에 대시보드를 커스터마이즈했고
  And 저장된 레이아웃이 있다
  When 사용자가 대시보드 페이지를 로드하면
  Then 저장된 레이아웃이 복원된다
  And 모든 위젯이 올바른 위치에 표시된다
  And 위젯 크기가 올바르게 적용된다

Scenario: 첫 방문 시 기본 레이아웃
  Given 사용자가 처음으로 대시보드에 접근하고
  And 저장된 레이아웃이 없다
  When 페이지가 로드되면
  Then 기본 레이아웃이 표시된다
  And 기본 위젯 세트가 포함된다
```

#### AC-008: 기본 레이아웃으로 복원

```gherkin
Feature: 기본 레이아웃 복원

Scenario: 기본 레이아웃 복원 실행
  Given 사용자가 커스터마이즈한 대시보드가 있고
  When 사용자가 "기본 레이아웃으로 복원"을 클릭하면
  Then 확인 다이얼로그가 표시된다

Scenario: 기본 레이아웃 복원 확인
  Given 기본 레이아웃 복원 확인 다이얼로그가 표시되어 있고
  When 사용자가 "복원"을 클릭하면
  Then 기본 레이아웃이 적용된다
  And 기존 커스터마이즈된 레이아웃이 대체된다
  And 성공 메시지가 표시된다
```

---

### Template System

#### AC-009: 템플릿 저장

```gherkin
Feature: 템플릿 저장

Scenario: 현재 레이아웃을 템플릿으로 저장
  Given 사용자가 커스터마이즈한 레이아웃이 있고
  When 사용자가 "템플릿으로 저장"을 클릭하면
  Then 템플릿 저장 다이얼로그가 열린다
  And 이름 입력 필드가 표시된다
  And 설명 입력 필드가 표시된다 (선택)

Scenario: 템플릿 저장 완료
  Given 템플릿 저장 다이얼로그가 열려 있고
  When 사용자가 이름 "PM용 대시보드"를 입력하고
  And "저장"을 클릭하면
  Then 템플릿이 저장된다
  And 템플릿 목록에 추가된다
  And 성공 메시지가 표시된다

Scenario: 중복 템플릿 이름
  Given "PM용 대시보드" 템플릿이 이미 존재하고
  When 사용자가 동일한 이름으로 저장하려 하면
  Then "이미 존재하는 템플릿 이름입니다" 에러가 표시된다
```

#### AC-010: 템플릿 적용

```gherkin
Feature: 템플릿 적용

Scenario: 템플릿 목록에서 템플릿 선택
  Given 저장된 템플릿이 3개 있고
  When 사용자가 "템플릿 불러오기"를 클릭하면
  Then 템플릿 목록 다이얼로그가 열린다
  And 모든 템플릿이 미리보기와 함께 표시된다

Scenario: 템플릿 적용 실행
  Given 템플릿 목록이 표시되어 있고
  When 사용자가 "PM용 대시보드" 템플릿을 선택하고
  And "적용"을 클릭하면
  Then 현재 대시보드 레이아웃이 템플릿 레이아웃으로 대체된다
  And 모든 위젯이 템플릿 위치로 이동한다

Scenario: 템플릿 적용 취소
  Given 템플릿 목록이 표시되어 있고
  When 사용자가 "취소"를 클릭하면
  Then 다이얼로그가 닫힌다
  And 현재 레이아웃이 유지된다
```

#### AC-011: 템플릿 삭제

```gherkin
Feature: 템플릿 삭제

Scenario: 커스텀 템플릿 삭제
  Given 사용자가 생성한 템플릿이 있고
  When 사용자가 템플릿의 삭제 버튼을 클릭하면
  Then 확인 다이얼로그가 표시된다
  And 확인 후 템플릿이 삭제된다

Scenario: 시스템 기본 템플릿 삭제 방지
  Given 시스템 기본 템플릿이 표시되어 있고
  When 사용자가 삭제하려 하면
  Then 삭제 버튼이 비활성화되어 있다
  또는 "기본 템플릿은 삭제할 수 없습니다" 메시지가 표시된다
```

---

### Multi-Dashboard Tabs

#### AC-012: 대시보드 탭 생성

```gherkin
Feature: 대시보드 탭 생성

Scenario: 새 대시보드 탭 추가
  Given 프로젝트에 대시보드 탭이 1개 있고
  When 사용자가 "+" 버튼을 클릭하면
  Then 새 대시보드 탭이 생성된다
  And 기본 이름 "Dashboard 2"가 할당된다
  And 빈 레이아웃으로 시작한다

Scenario: 새 탭 자동 활성화
  Given 새 대시보드 탭이 생성되었고
  When 생성이 완료되면
  Then 새 탭이 자동으로 활성화된다
  And 탭 이름이 편집 모드로 전환된다
```

#### AC-013: 대시보드 탭 이름 변경

```gherkin
Feature: 대시보드 탭 이름 변경

Scenario: 탭 이름 직접 편집
  Given 대시보드 탭이 있고
  When 사용자가 탭 이름을 더블 클릭하면
  Then 이름 편집 모드로 전환된다
  And 새 이름을 입력할 수 있다

Scenario: 탭 이름 저장
  Given 탭 이름 편집 모드가 활성화되어 있고
  When 사용자가 "이슈 트래커"를 입력하고 Enter를 누르면
  Then 탭 이름이 "이슈 트래커"로 변경된다
  And 변경사항이 저장된다
```

#### AC-014: 대시보드 탭 삭제

```gherkin
Feature: 대시보드 탭 삭제

Scenario: 탭 삭제 실행
  Given 대시보드 탭이 3개 있고
  When 사용자가 탭의 X 버튼을 클릭하면
  Then 확인 다이얼로그가 표시된다
  And 확인 후 탭과 레이아웃이 삭제된다

Scenario: 마지막 탭 삭제 방지
  Given 대시보드 탭이 1개만 있다
  When 사용자가 삭제하려 하면
  Then X 버튼이 비활성화되어 있다
  또는 "최소 하나의 대시보드가 필요합니다" 메시지가 표시된다
```

---

### Error Handling

#### AC-015: 위젯 데이터 로딩 실패

```gherkin
Feature: 위젯 데이터 로딩 실패

Scenario: 위젯 데이터 조회 실패
  Given 위젯이 이슈 통계를 표시하고
  When 이슈 API 호출이 실패하면
  Then 위젯에 에러 상태가 표시된다
  And "데이터를 불러올 수 없습니다" 메시지가 표시된다
  And "다시 시도" 버튼이 표시된다

Scenario: 위젯 재시도
  Given 위젯이 에러 상태로 표시되어 있고
  When 사용자가 "다시 시도"를 클릭하면
  Then 데이터가 다시 로드된다
```

#### AC-016: 레이아웃 저장 실패

```gherkin
Feature: 레이아웃 저장 실패

Scenario: 자동 저장 실패
  Given 사용자가 레이아웃을 변경했고
  When 자동 저장이 실패하면
  Then 에러 토스트가 표시된다
  And "저장 실패 - 다시 시도 중..." 메시지가 표시된다
  And 자동 재시도가 수행된다
```

---

### Accessibility

#### AC-017: 키보드 네비게이션

```gherkin
Feature: 키보드 네비게이션

Scenario: 위젯 키보드 이동
  Given 위젯이 포커스되어 있고
  When 사용자가 Tab 키를 누르면
  Then 다음 위젯으로 포커스가 이동한다

Scenario: 위젯 키보드 드래그
  Given 위젯이 포커스되어 있고
  When 사용자가 Space 키를 누르면
  Then 위젯이 드래그 모드로 전환된다
  And 화살표 키로 위치를 이동할 수 있다
```

#### AC-018: 스크린 리더 지원

```gherkin
Feature: 스크린 리더 지원

Scenario: 위젯 추가 알림
  When 사용자가 위젯을 추가하면
  Then "통계 카드 위젯이 대시보드에 추가됨" 스크린 리더 알림이 발생한다

Scenario: 드래그 상태 알림
  Given 사용자가 위젯을 드래그 중이고
  Then "위젯 이동 중, 현재 위치: 행 2, 열 3" 알림이 발생한다
```

---

### Mobile Responsiveness

#### AC-019: 모바일 레이아웃

```gherkin
Feature: 모바일 레이아웃

Scenario: 모바일에서 단일 열 레이아웃
  Given 화면 너비가 768px 미만이고
  When 대시보드가 로드되면
  Then 모든 위젯이 단일 열로 표시된다
  And 위젯 너비가 전체 너비로 설정된다

Scenario: 모바일에서 드래그 앤 드롭
  Given 모바일 디바이스에서 대시보드를 보고
  When 사용자가 위젯을 길게 누르면
  Then 위젯이 드래그 가능 상태가 된다
```

---

## Quality Gate Checklist

### Functional Completeness

- [ ] All 7 FRs for Widget Management implemented
- [ ] All 6 FRs for Dashboard Customization implemented
- [ ] All 4 FRs for Multi-Dashboard Support implemented
- [ ] All 7 NFRs verified

### Test Coverage

- [ ] Unit tests >= 85% coverage
- [ ] Integration tests for all critical paths
- [ ] E2E tests for user journeys
- [ ] Accessibility tests pass

### Performance

- [ ] Drag response time < 100ms
- [ ] Auto-save latency < 500ms
- [ ] Initial load time < 1s
- [ ] Lighthouse score >= 90

### Cross-Browser/Device

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Security

- [ ] Project membership verified for all operations
- [ ] Template ownership verified
- [ ] Input validation on all endpoints
- [ ] XSS prevention in widget config

---

## Definition of Done

1. **Code Complete**: All planned files created and implemented
2. **Tests Pass**: All unit, integration, and E2E tests passing
3. **Coverage Met**: 85%+ test coverage achieved
4. **Code Review**: Peer reviewed and approved
5. **Documentation**: Component props documented
6. **Accessibility**: WCAG 2.1 AA compliance verified
7. **Performance**: All NFRs met
8. **Security**: No vulnerabilities in dependency scan
