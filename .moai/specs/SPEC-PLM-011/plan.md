# SPEC-PLM-011: 구현 계획 (Implementation Plan)

## 메타데이터

| 필드 | 값 |
|------|-----|
| SPEC ID | SPEC-PLM-011 |
| 제목 | 알림 설정 구현 계획 |
| 개발 방식 | Hybrid (TDD for new, DDD for legacy) |

---

## 1. 마일스톤

### 1.1 Milestone 1: 데이터베이스 스키마 및 타입 정의 (Priority: High)

**목표**: 알림 설정 저장을 위한 데이터베이스 스키마 및 타입 정의

**작업 항목**:
- [ ] `notification_preferences` 테이블 스키마 정의 (Drizzle)
- [ ] `NotificationSettings` 인터페이스 타입 정의
- [ ] Zod 스키마 정의 (`notification-preferences.ts`)
- [ ] 마이그레이션 파일 생성
- [ ] 단위 테스트 작성

**완료 기준**:
- Drizzle 스키마가 올바르게 정의됨
- Zod 스키마가 모든 필드 검증
- 마이그레이션이 성공적으로 실행됨

### 1.2 Milestone 2: tRPC 라우터 및 서비스 구현 (Priority: High)

**목표**: 알림 설정 CRUD API 구현

**작업 항목**:
- [ ] `getSettings` 프로시저 구현
- [ ] `updateSettings` 프로시저 구현
- [ ] `resetSettings` 프로시저 구현
- [ ] 서비스 레이어 로직 구현 (`service.ts` 확장)
- [ ] 기본 설정값 로직 구현
- [ ] 단위 테스트 작성

**완료 기준**:
- 모든 tRPC 프로시저가 정상 동작
- 권한 검증이 올바르게 동작
- 테스트 커버리지 85% 이상

### 1.3 Milestone 3: 채널 설정 컴포넌트 (Priority: High)

**목표**: 알림 채널별 ON/OFF 토글 컴포넌트 구현

**작업 항목**:
- [ ] `channel-settings.tsx` 컴포넌트 생성
- [ ] Switch 컴포넌트를 사용한 토글 UI
- [ ] 상태 변경 핸들러 구현
- [ ] Optimistic Update 로직 구현
- [ ] 컴포넌트 테스트 작성

**완료 기준**:
- 인앱, 이메일, 푸시 채널 토글 동작
- Optimistic Update가 즉시 반영됨
- 저장 실패 시 롤백 동작

### 1.4 Milestone 4: 카테고리 설정 컴포넌트 (Priority: High)

**목표**: 알림 카테고리별 설정 컴포넌트 구현

**작업 항목**:
- [ ] `category-settings.tsx` 컴포넌트 생성
- [ ] 이슈, 프로젝트, PLM 카테고리 토글
- [ ] 시스템 알림 비활성화 방지 로직
- [ ] 컴포넌트 테스트 작성

**완료 기준**:
- 각 카테고리 토글이 독립적으로 동작
- 시스템 카테고리는 항상 활성화 상태 유지

### 1.5 Milestone 5: 이메일 빈도 설정 컴포넌트 (Priority: High)

**목표**: 이메일 알림 빈도 선택 컴포넌트 구현

**작업 항목**:
- [ ] 빈도 선택 Select 컴포넌트 구현
- [ ] 이메일 활성화 시에만 표시 로직
- [ ] 빈도 변경 핸들러 구현
- [ ] 컴포넌트 테스트 작성

**완료 기준**:
- 즉시, 시간별, 일일, 주간 옵션 선택 가능
- 이메일 비활성화 시 숨김 처리

### 1.6 Milestone 6: 메인 설정 폼 컴포넌트 (Priority: High)

**목표**: 모든 설정을 통합하는 메인 폼 컴포넌트 구현

**작업 항목**:
- [ ] `notification-settings.tsx` 컴포넌트 생성
- [ ] 하위 컴포넌트 통합 (채널, 카테고리, 빈도)
- [ ] 로딩 상태 처리
- [ ] 에러 상태 처리
- [ ] 저장 상태 표시 (Toast)
- [ ] 컴포넌트 테스트 작성

**완료 기준**:
- 모든 설정이 하나의 폼에서 관리됨
- 로딩/에러 상태가 적절히 표시됨

### 1.7 Milestone 7: 프로젝트별 설정 컴포넌트 (Priority: Medium)

**목표**: 프로젝트별 알림 설정 오버라이드 기능

**작업 항목**:
- [ ] `project-notification-settings.tsx` 컴포넌트 생성
- [ ] 프로젝트 목록 표시
- [ ] 프로젝트별 설정 폼 구현
- [ ] 전역 설정 상속 표시
- [ ] 컴포넌트 테스트 작성

**완료 기준**:
- 각 프로젝트별로 개별 설정 가능
- 전역 설정과 프로젝트 설정 구분 표시

### 1.8 Milestone 8: 설정 페이지 및 통합 (Priority: High)

**목표**: 알림 설정 페이지 및 최종 통합

**작업 항목**:
- [ ] `src/app/settings/notifications/page.tsx` 페이지 생성
- [ ] 탭 구조 (전역/프로젝트별)
- [ ] 기본값 복원 버튼 구현
- [ ] 설정 메뉴에 알림 항목 추가
- [ ] E2E 테스트 작성

**완료 기준**:
- 설정 페이지에서 모든 기능 접근 가능
- 기본값 복원 기능 동작
- 메뉴에서 접근 가능

### 1.9 Milestone 9: 최종 검증 및 문서화 (Priority: High)

**목표**: 전체 기능 검증 및 문서화

**작업 항목**:
- [ ] 접근성 검증 (키보드, 스크린 리더)
- [ ] 성능 테스트 (Optimistic Update 반응성)
- [ ] 통합 테스트 완료
- [ ] 문서화 업데이트

**완료 기준**:
- 모든 기능 정상 동작
- 접근성 기준 충족
- 전체 테스트 커버리지 85% 이상

---

## 2. 기술 접근법

### 2.1 Optimistic Update 전략

**선택**: TanStack Query Optimistic Update

**이유**:
- 사용자 경험 최적화
- 네트워크 지연 숨김
- 즉각적인 피드백 제공

**구현 방식**:
```typescript
const utils = trpc.useUtils();

const updateSettings = trpc.notification.updateSettings.useMutation({
  onMutate: async (newSettings) => {
    // 진행 중인 쿼리 취소
    await utils.notification.getSettings.cancel();

    // 이전 값 백업
    const previousSettings = utils.notification.getSettings.getData();

    // Optimistic Update
    utils.notification.getSettings.setData(undefined, (old) => ({
      ...old,
      ...newSettings,
    }));

    return { previousSettings };
  },
  onError: (err, newSettings, context) => {
    // 롤백
    utils.notification.getSettings.setData(undefined, context.previousSettings);
    toast.error('설정 저장에 실패했습니다.');
  },
  onSettled: () => {
    // 서버 데이터와 동기화
    utils.notification.getSettings.invalidate();
  },
});
```

### 2.2 상태 관리 전략

**선택**: React Query 캐시 + 로컬 상태

**이유**:
- 서버 상태는 React Query로 관리
- UI 상태는 로컬 useState로 관리
- 추가 상태 관리 라이브러리 불필요

### 2.3 폼 관리 전략

**선택**: React Hook Form + Zod

**이유**:
- 타입 안전성
- 런타임 검증
- 폼 상태 관리 최적화

**구현 방식**:
```typescript
const settingsSchema = z.object({
  inAppEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  issuesEnabled: z.boolean(),
  projectsEnabled: z.boolean(),
  plmEnabled: z.boolean(),
  emailFrequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const form = useForm<SettingsFormData>({
  resolver: zodResolver(settingsSchema),
  defaultValues: initialSettings,
});
```

### 2.4 데이터베이스 설계

**전역 설정 vs 프로젝트별 설정**:
- `project_id = NULL`: 전역 설정
- `project_id = UUID`: 프로젝트별 설정

**설정 조회 로직**:
```typescript
async function getSettings(userId: string, projectId?: string) {
  // 1. 프로젝트별 설정 확인
  if (projectId) {
    const projectSettings = await db
      .select()
      .from(notificationPreferences)
      .where(and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.projectId, projectId)
      ));

    if (projectSettings.length > 0) {
      return projectSettings[0];
    }
  }

  // 2. 전역 설정 반환
  const globalSettings = await db
    .select()
    .from(notificationPreferences)
    .where(and(
      eq(notificationPreferences.userId, userId),
      isNull(notificationPreferences.projectId)
    ));

  if (globalSettings.length > 0) {
    return globalSettings[0];
  }

  // 3. 기본 설정 반환
  return createDefaultSettings(userId);
}
```

---

## 3. 아키텍처 설계

### 3.1 컴포넌트 계층 구조

```
NotificationSettingsPage
├── Tabs
│   ├── Tab: 전역 설정
│   │   └── NotificationSettingsForm
│   │       ├── ChannelSettings
│   │       │   ├── Switch: 인앱 알림
│   │       │   ├── Switch: 이메일 알림
│   │       │   └── Switch: 푸시 알림
│   │       ├── CategorySettings
│   │       │   ├── Switch: 이슈 알림
│   │       │   ├── Switch: 프로젝트 알림
│   │       │   ├── Switch: PLM 알림
│   │       │   └── Switch: 시스템 알림 (disabled)
│   │       └── EmailFrequencySelect
│   └── Tab: 프로젝트별 설정
│       └── ProjectNotificationSettings
│           ├── ProjectList
│           │   └── ProjectSettingsCard
│           │       └── NotificationSettingsForm (재사용)
│           └── ResetButton
└── ResetToDefaultsButton
```

### 3.2 데이터 흐름

```
User Action (Toggle Change)
    ↓
React Hook Form (Local State Update)
    ↓
tRPC Mutation (Optimistic Update)
    ↓
TanStack Query Cache Update
    ↓
UI Re-render
    ↓
Background: Server Save
    ↓
Success: Cache Confirm
Failure: Cache Rollback + Toast
```

### 3.3 tRPC 라우터 확장

```typescript
// src/modules/notification/router.ts 확장
export const notificationRouter = router({
  // ... existing procedures ...

  // 설정 관련 프로시저
  getSettings: protectedProcedure
    .input(z.object({ projectId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      return service.getSettings(ctx.user.id, input.projectId);
    }),

  updateSettings: protectedProcedure
    .input(updateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      return service.updateSettings(ctx.user.id, input);
    }),

  resetSettings: protectedProcedure
    .input(z.object({ projectId: z.string().uuid().optional() }))
    .mutation(async ({ ctx, input }) => {
      return service.resetSettings(ctx.user.id, input.projectId);
    }),
});
```

---

## 4. 리스크 및 대응 계획

### 4.1 기술 리스크

| 리스크 | 확률 | 영향 | 대응 계획 |
|--------|------|------|----------|
| Optimistic Update 롤백 실패 | Low | Medium | 트랜잭션 사용, 에러 바운더리 |
| 동시 설정 변경 충돌 | Low | Low | 마지막 변경 우선, 사용자 알림 |
| 프로젝트 멤버십 변경 시 설정 동기화 | Medium | Low | 이벤트 기반 설정 생성 |

### 4.2 사용자 경험 리스크

| 리스크 | 확률 | 영향 | 대응 계획 |
|--------|------|------|----------|
| 설정이 너무 복잡함 | Medium | Medium | 점진적 공개, 그룹화 |
| 기본값 복원 실수 | Low | Medium | 확인 다이얼로그 |

---

## 5. 의존성 관리

### 5.1 기존 의존성 활용

모든 기능은 기존 의존성으로 구현 가능:
- shadcn/ui (Switch, Card, Tabs, Select)
- React Hook Form
- Zod
- TanStack Query
- tRPC

### 5.2 새로운 의존성 불필요

---

## 6. 테스트 전략

### 6.1 단위 테스트

**커버리지 목표**: 85%

**테스트 대상**:
- `settings-service.ts`: CRUD 로직, 기본값 생성
- Zod 스키마: 검증 로직
- 컴포넌트: 렌더링, 이벤트 처리, 상태 변경

### 6.2 통합 테스트

**테스트 시나리오**:
- 설정 조회 → 수정 → 저장 플로우
- Optimistic Update → 성공/실패 처리
- 프로젝트별 설정 → 전역 설정 fallback

### 6.3 E2E 테스트

**테스트 케이스**:
- TC-E2E-001: 전역 알림 설정 변경
- TC-E2E-002: 프로젝트별 알림 설정 변경
- TC-E2E-003: 기본값 복원

---

## 7. 다음 단계

1. **개발 시작**: `/moai:2-run SPEC-PLM-011` 실행
2. **진행 상황 추적**: 각 마일스톤 완료 시 업데이트
3. **코드 리뷰**: 각 마일스톤 완료 후 리뷰 요청
