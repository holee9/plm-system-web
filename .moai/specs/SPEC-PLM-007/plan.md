# SPEC-PLM-007: 구현 계획

## Metadata

- ID: SPEC-PLM-007
- Status: Draft
- Created: 2026-02-15

## 마일스톤

### Primary Goal: 대시보드 기본

- reporting 모듈 tRPC 라우터
- 프로젝트 통계 카드 (이슈 수, BOM 수, CO 수)
- 이슈 상태/우선순위 분포 차트 (Recharts)
- 메인 대시보드 페이지

### Secondary Goal: 알림 시스템

- notifications, activity_logs Drizzle 스키마
- 알림 CRUD tRPC 라우터
- NotificationBell + NotificationDropdown 컴포넌트
- SSE 기반 실시간 알림 (폴링 폴백)
- 이벤트 버스 연동 (이슈/CO 이벤트 -> 알림 생성)

### Tertiary Goal: 문서/파일 관리

- documents, file_versions Drizzle 스키마
- 파일 업로드/다운로드 tRPC 라우터
- 스토리지 추상화 계층 (로컬 FS / R2)
- FileUploader 컴포넌트 (드래그 앤 드롭)
- 문서 버전 관리

### Final Goal: 활동 피드 및 통합

- 활동 피드 tRPC 라우터
- ActivityFeed 타임라인 컴포넌트
- Empty State 컴포넌트
- 프로젝트 대시보드 (프로젝트별 통계)
- 마일스톤 진행률 표시

## 기술적 접근 방식

1. Recharts로 대시보드 차트 구현
2. SSE (Server-Sent Events)로 실시간 알림 (Vercel 제한 시 폴링 폴백)
3. 파일 스토리지 추상화: Storage interface -> LocalStorage / R2Storage
4. 이벤트 버스 패턴으로 모듈 간 알림/활동 로그 자동 기록
5. 대시보드 통계는 집계 쿼리 + 1분 캐시

## 리스크 및 대응

| 리스크 | 대응 |
|--------|------|
| Vercel SSE 제한 | 폴링 폴백 (5초 간격) |
| 대시보드 쿼리 성능 | 집계 쿼리 최적화 + 캐싱 |
| 파일 보안 | MIME 검증 + 파일명 난독화 |
| 알림 스팸 | 5분 쿨다운 + 일괄 통합 |
