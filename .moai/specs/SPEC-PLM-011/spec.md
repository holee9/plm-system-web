# SPEC-PLM-011: 알림 설정 (Notification Settings)

## 메타데이터

| 필드 | 값 |
|------|-----|
| SPEC ID | SPEC-PLM-011 |
| 제목 | 알림 설정 (Notification Settings) |
| 도메인 | Notification (알림) |
| 우선순위 | Medium |
| 상태 | Planned |
| 생성일 | 2026-02-18 |
| 관련 SPEC | SPEC-PLM-003 (프로젝트 관리), SPEC-PLM-004 (이슈 관리) |
| 개발 방식 | Hybrid (TDD for new, DDD for legacy) |

---

## 1. 환경 (Environment)

### 1.1 시스템 컨텍스트

본 SPEC은 PLM System Web의 알림 모듈에 사용자별 알림 설정 기능을 추가합니다. 기존 알림 시스템은 이슈 할당, 멘션, 댓글, 상태 변경, 프로젝트 멤버 추가 등의 이벤트에 대해 실시간 알림을 제공합니다. 본 기능은 사용자가 알림 수신 방식과 빈도를 개인화할 수 있도록 합니다.

### 1.2 기술 스택

**프론트엔드**:
- Next.js 15.0 (App Router)
- React 19.0
- TypeScript 5.7
- shadcn/ui (Switch, Card, Tabs, Select 컴포넌트)
- React Hook Form (폼 상태 관리)
- Zod (스키마 검증)
- TanStack Query (Optimistic Updates)

**백엔드**:
- tRPC v11
- Drizzle ORM
- PostgreSQL 16

### 1.3 제약 조건

**기술적 제약**:
- 설정 변경은 즉시 적용 (실시간 동기화)
- Optimistic Update로 UX 최적화
- 기본 설정값은 모든 알림 활성화

**비즈니스 제약**:
- 알림 설정은 인증된 사용자만 접근 가능
- 프로젝트별 설정은 해당 프로젝트 멤버만 가능
- 시스템 알림(보안, 계정)은 비활성화 불가

### 1.4 가정 (Assumptions)

| 가정 | 신뢰도 | 검증 방법 |
|------|--------|----------|
| 사용자는 알림 유형별로 다른 설정을 원함 | High | UX 리서치 |
| 대부분의 사용자는 기본 설정을 유지함 | Medium | 사용자 행동 분석 |
| 이메일 알림은 선택적 기능으로 취급 | High | 요구사항 분석 |
| 푸시 알림은 향후 확장 기능 | High | 로드맵 확인 |

---

## 2. 요구사항 (Requirements)

### 2.1 D-006: 알림 설정 (Notification Settings)

#### 2.1.1 Ubiquitous Requirements (보편적 요구사항)

**REQ-SETTINGS-001**: 시스템은 **항상** 각 사용자에 대해 알림 설정을 저장하고 유지해야 한다.

**REQ-SETTINGS-002**: 시스템은 **항상** 기본 알림 설정값을 제공해야 한다 (모든 알림 활성화).

**REQ-SETTINGS-003**: 시스템은 **항상** 설정 변경 시 즉시 저장하고 피드백을 제공해야 한다.

#### 2.1.2 Event-Driven Requirements (이벤트 기반 요구사항)

**REQ-SETTINGS-004**: **WHEN** 사용자가 알림 설정 페이지에 접근 **THEN** 시스템은 현재 사용자의 알림 설정을 로드하여 표시해야 한다.

**REQ-SETTINGS-005**: **WHEN** 사용자가 알림 유형 토글을 변경 **THEN** 시스템은 Optimistic Update로 UI를 즉시 업데이트하고 백그라운드에서 서버에 저장해야 한다.

**REQ-SETTINGS-006**: **WHEN** 사용자가 알림 빈도를 변경 **THEN** 시스템은 새로운 빈도 설정을 저장하고 확인 메시지를 표시해야 한다.

**REQ-SETTINGS-007**: **WHEN** 사용자가 프로젝트별 알림 설정을 변경 **THEN** 시스템은 해당 프로젝트에 대해서만 설정을 적용해야 한다.

**REQ-SETTINGS-008**: **WHEN** 저장 실패 발생 **THEN** 시스템은 Optimistic Update를 롤백하고 에러 메시지를 표시해야 한다.

#### 2.1.3 State-Driven Requirements (상태 기반 요구사항)

**REQ-SETTINGS-009**: **IF** 사용자가 특정 프로젝트의 멤버가 아님 **THEN** 시스템은 해당 프로젝트의 알림 설정을 표시하지 않아야 한다.

**REQ-SETTINGS-010**: **IF** 이메일 알림이 비활성화됨 **THEN** 시스템은 이메일 관련 세부 설정을 숨겨야 한다.

**REQ-SETTINGS-011**: **IF** 사용자가 처음 설정 페이지에 접근 **THEN** 시스템은 기본 설정값을 표시해야 한다.

#### 2.1.4 Optional Requirements (선택적 요구사항)

**REQ-SETTINGS-012**: **가능하면** 알림 설정 내보내기/가져오기 기능을 제공한다.

**REQ-SETTINGS-013**: **가능하면** 알림 설정 초기화(기본값 복원) 기능을 제공한다.

#### 2.1.5 Unwanted Behavior Requirements (원치 않는 동작 요구사항)

**REQ-SETTINGS-014**: 시스템은 시스템 알림(보안, 계정)을 비활성화하지 **않아야 한다**.

**REQ-SETTINGS-015**: 시스템은 다른 사용자의 알림 설정을 수정하지 **않아야 한다**.

**REQ-SETTINGS-016**: 시스템은 설정 저장 실패 시 사용자가 인지하지 못한 상태로 두지 **않아야 한다**.

### 2.2 알림 유형별 설정

#### 2.2.1 알림 채널 설정

**REQ-CHANNEL-001**: 시스템은 **항상** 다음 알림 채널에 대한 ON/OFF 설정을 제공해야 한다.
- 인앱 알림 (In-App)
- 이메일 알림 (Email)
- 푸시 알림 (Push) - 향후 확장

**REQ-CHANNEL-002**: **WHEN** 인앱 알림이 비활성화됨 **THEN** 시스템은 실시간 알림 전송을 중단해야 한다.

**REQ-CHANNEL-003**: **WHEN** 이메일 알림이 활성화됨 **THEN** 시스템은 알림 이벤트 발생 시 이메일을 발송해야 한다.

#### 2.2.2 알림 카테고리 설정

**REQ-CATEGORY-001**: 시스템은 **항상** 다음 알림 카테고리에 대한 설정을 제공해야 한다.
- 이슈 관련 (할당, 멘션, 댓글, 상태 변경)
- 프로젝트 관련 (멤버 추가, 마일스톤)
- PLM 관련 (BOM 변경, 변경 요청)
- 시스템 (보안, 계정) - 비활성화 불가

**REQ-CATEGORY-002**: **WHEN** 특정 카테고리가 비활성화됨 **THEN** 시스템은 해당 카테고리의 알림을 생성하지 않아야 한다.

#### 2.2.3 알림 빈도 설정

**REQ-FREQUENCY-001**: 시스템은 **항상** 이메일 알림에 대해 다음 빈도 옵션을 제공해야 한다.
- 즉시 (Immediate)
- 1시간 단위 요약 (Hourly Digest)
- 일일 요약 (Daily Digest)
- 주간 요약 (Weekly Digest)

**REQ-FREQUENCY-002**: **WHEN** 빈도가 요약 형태로 설정됨 **THEN** 시스템은 해당 주기 동안 발생한 알림을 묶어서 발송해야 한다.

#### 2.2.4 프로젝트별 설정

**REQ-PROJECT-001**: 시스템은 **항상** 사용자가 속한 각 프로젝트에 대해 개별 알림 설정을 지원해야 한다.

**REQ-PROJECT-002**: **WHEN** 프로젝트별 설정이 존재하지 않음 **THEN** 시스템은 전역 설정을 사용해야 한다.

**REQ-PROJECT-003**: **WHEN** 사용자가 새 프로젝트에 참여 **THEN** 시스템은 전역 설정을 기반으로 프로젝트별 설정을 생성해야 한다.

---

## 3. 명세 (Specifications)

### 3.1 API 명세

#### 3.1.1 알림 설정 조회 API

**getSettings** - 사용자 알림 설정 조회

```
Input:
  projectId?: string (UUID) - 프로젝트별 설정 조회 시

Output:
  settings: {
    id: string
    userId: string
    projectId: string | null
    channels: {
      inApp: boolean
      email: boolean
      push: boolean
    }
    categories: {
      issues: boolean
      projects: boolean
      plm: boolean
      system: boolean // 항상 true
    }
    emailFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
    createdAt: Date
    updatedAt: Date
  }

Authorization: 인증된 사용자
```

#### 3.1.2 알림 설정 수정 API

**updateSettings** - 알림 설정 수정

```
Input:
  projectId?: string (UUID)
  channels?: {
    inApp?: boolean
    email?: boolean
    push?: boolean
  }
  categories?: {
    issues?: boolean
    projects?: boolean
    plm?: boolean
  }
  emailFrequency?: 'immediate' | 'hourly' | 'daily' | 'weekly'

Output:
  settings: NotificationSettings (업데이트된 설정)

Authorization: 인증된 사용자
```

#### 3.1.3 설정 초기화 API

**resetSettings** - 기본 설정으로 초기화

```
Input:
  projectId?: string (UUID)

Output:
  settings: NotificationSettings (기본값으로 초기화된 설정)

Authorization: 인증된 사용자
```

### 3.2 UI 컴포넌트 명세

#### 3.2.1 NotificationSettingsPage 컴포넌트

```
Path: /settings/notifications

Features:
  - 전역 알림 설정 표시
  - 프로젝트별 설정 탭
  - 설정 저장 상태 표시
  - 기본값 복원 버튼
```

#### 3.2.2 NotificationSettingsForm 컴포넌트

```
Props:
  settings: NotificationSettings
  projectId?: string
  onUpdate: (settings: Partial<NotificationSettings>) => void

Features:
  - 채널별 토글 스위치
  - 카테고리별 토글 스위치
  - 이메일 빈도 선택 드롭다운
  - Optimistic Update 지원
```

#### 3.2.3 ProjectNotificationSettings 컴포넌트

```
Props:
  projects: Project[]

Features:
  - 프로젝트 목록 표시
  - 프로젝트별 알림 설정 오버라이드
  - 전역 설정 상속 표시
```

### 3.3 데이터베이스 스키마

#### 3.3.1 notification_preferences 테이블 (신규)

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- 채널 설정
  in_app_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  email_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  push_enabled BOOLEAN DEFAULT FALSE NOT NULL,

  -- 카테고리 설정
  issues_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  projects_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  plm_enabled BOOLEAN DEFAULT TRUE NOT NULL,

  -- 빈도 설정
  email_frequency VARCHAR(20) DEFAULT 'immediate' NOT NULL,

  -- 메타데이터
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,

  -- 제약조건
  UNIQUE(user_id, project_id)
);

-- 인덱스
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_project ON notification_preferences(project_id);
```

---

## 4. 파일 수정 목록

### 4.1 신규 파일

| 파일 경로 | 설명 |
|----------|------|
| `src/app/settings/notifications/page.tsx` | 알림 설정 페이지 |
| `src/components/notification/notification-settings.tsx` | 알림 설정 폼 컴포넌트 |
| `src/components/notification/channel-settings.tsx` | 채널별 설정 컴포넌트 |
| `src/components/notification/category-settings.tsx` | 카테고리별 설정 컴포넌트 |
| `src/components/notification/project-notification-settings.tsx` | 프로젝트별 설정 컴포넌트 |
| `src/modules/notification/schemas/notification-preferences.ts` | 알림 설정 Zod 스키마 |
| `server/db/notification_preferences.ts` | 데이터베이스 스키마 정의 |

### 4.2 수정 파일

| 파일 경로 | 변경 사항 |
|----------|----------|
| `src/modules/notification/router.ts` | 설정 관련 tRPC 프로시저 추가 |
| `src/modules/notification/service.ts` | 설정 조회/수정 서비스 로직 추가 |
| `src/modules/notification/types.ts` | NotificationSettings 타입 추가 |
| `src/server/db/schema.ts` | notification_preferences 테이블 스키마 추가 |
| `src/app/settings/page.tsx` | 알림 설정 메뉴 항목 추가 (존재 시) |
| `src/components/layout/navbar.tsx` | 설정 페이지 링크 추가 (필요 시) |

### 4.3 테스트 파일

| 파일 경로 | 설명 |
|----------|------|
| `src/modules/notification/__tests__/settings-service.test.ts` | 설정 서비스 단위 테스트 |
| `src/components/notification/__tests__/notification-settings.test.tsx` | 설정 컴포넌트 테스트 |
| `tests/integration/notification/settings-flow.test.ts` | 설정 통합 테스트 |

---

## 5. 비기능 요구사항

### 5.1 성능 요구사항

| 항목 | 요구사항 |
|------|----------|
| 설정 페이지 로딩 | 1초 이내 |
| 설정 변경 반영 | 100ms 이내 (Optimistic) |
| 설정 저장 API | 500ms 이내 |

### 5.2 보안 요구사항

| 항목 | 요구사항 |
|------|----------|
| 접근 제어 | 인증된 사용자만 자신의 설정 조회/수정 가능 |
| 데이터 격리 | 다른 사용자의 설정 접근 차단 |
| 입력 검증 | 모든 설정값에 Zod 스키마 검증 적용 |

### 5.3 접근성 요구사항

| 항목 | 요구사항 |
|------|----------|
| 키보드 네비게이션 | 모든 토글 및 선택 기능에 키보드 접근 가능 |
| 스크린 리더 | 설정 상태에 대한 적절한 ARIA 레이블 제공 |
| 색상 대비 | 활성/비활성 상태가 충분한 색상 대비 유지 |

---

## 6. 추적성 매트릭스

| 요구사항 ID | 구현 컴포넌트 | 테스트 케이스 |
|-------------|--------------|---------------|
| REQ-SETTINGS-001 ~ 016 | NotificationSettings, settings-service.ts | TC-SETTINGS-001 ~ 016 |
| REQ-CHANNEL-001 ~ 003 | ChannelSettings | TC-CHANNEL-001 ~ 003 |
| REQ-CATEGORY-001 ~ 002 | CategorySettings | TC-CATEGORY-001 ~ 002 |
| REQ-FREQUENCY-001 ~ 002 | NotificationSettings | TC-FREQUENCY-001 ~ 002 |
| REQ-PROJECT-001 ~ 003 | ProjectNotificationSettings | TC-PROJECT-001 ~ 003 |

---

## 7. 참조 문서

- [CLAUDE.md](../../../CLAUDE.md) - MoAI 실행 지침
- [tech.md](../../project/tech.md) - 기술 스택 가이드
- [structure.md](../../project/structure.md) - 프로젝트 구조
- [notification/router.ts](../../../src/modules/notification/router.ts) - 기존 알림 라우터
- [notification/types.ts](../../../src/modules/notification/types.ts) - 기존 알림 타입
