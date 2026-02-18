# SPEC-PLM-010: 구현 계획 (Implementation Plan)

## 메타데이터

| 필드 | 값 |
|------|-----|
| SPEC ID | SPEC-PLM-010 |
| 제목 | 문서 고급 기능 구현 계획 |
| 개발 방식 | Hybrid (TDD for new, DDD for legacy) |

---

## 1. 마일스톤

### 1.1 Milestone 1: 문서 미리보기 기반 구조 (Priority: High)

**목표**: 문서 미리보기 기능의 기반 구조 및 API 구현

**작업 항목**:
- [ ] tRPC 라우터에 `getPreviewUrl` 프로시저 추가
- [ ] `preview-service.ts` 서비스 모듈 생성
- [ ] 미리보기 URL 생성 로직 구현
- [ ] 파일 접근 권한 검증 로직 구현
- [ ] 단위 테스트 작성

**완료 기준**:
- tRPC 프로시저가 정상적으로 미리보기 URL 반환
- 권한 검증이 올바르게 동작
- 테스트 커버리지 85% 이상

### 1.2 Milestone 2: PDF 미리보기 컴포넌트 (Priority: High)

**목표**: PDF.js 기반 PDF 미리보기 컴포넌트 구현

**작업 항목**:
- [ ] pdfjs-dist 의존성 추가
- [ ] `document-preview.tsx` 컴포넌트 생성
- [ ] PDF 렌더링 로직 구현
- [ ] 페이지 네비게이션 구현
- [ ] 줌 인/아웃 기능 구현
- [ ] 로딩 상태 및 에러 처리
- [ ] 컴포넌트 테스트 작성

**완료 기준**:
- PDF 파일이 정상적으로 렌더링됨
- 페이지 이동, 줌 기능 동작
- 에러 상황에서 적절한 fallback 제공

### 1.3 Milestone 3: 이미지 미리보기 컴포넌트 (Priority: High)

**목표**: Next.js Image 기반 이미지 미리보기 구현

**작업 항목**:
- [ ] 이미지 미리보기 UI 구현
- [ ] 지원 형식별 렌더링 처리
- [ ] 줌 및 팬 기능 구현
- [ ] SVG 안전 렌더링 처리
- [ ] 컴포넌트 테스트 작성

**완료 기준**:
- PNG, JPG, GIF, WebP, SVG 정상 렌더링
- 줌/팬 기능 동작
- SVG XSS 방지 처리 완료

### 1.4 Milestone 4: 미리보기 페이지 및 통합 (Priority: High)

**목표**: 미리보기 페이지 및 기존 문서 목록과 통합

**작업 항목**:
- [ ] `preview/[...id]/page.tsx` 페이지 생성
- [ ] 문서 목록에 미리보기 버튼 추가
- [ ] 미리보기 모달 통합
- [ ] 메타데이터 표시 UI 구현
- [ ] 다운로드 링크 추가
- [ ] E2E 테스트 작성

**완료 기준**:
- 문서 목록에서 미리보기 접근 가능
- 모달 형태로 미리보기 표시
- 다운로드 기능 정상 동작

### 1.5 Milestone 5: 버전 비교 API (Priority: High)

**목표**: 버전 비교를 위한 백엔드 API 구현

**작업 항목**:
- [ ] tRPC 라우터에 `compareVersions` 프로시저 추가
- [ ] `diff-service.ts` 서비스 모듈 생성
- [ ] diff-match-patch 의존성 추가
- [ ] 텍스트 diff 알고리즘 구현
- [ ] 메타데이터 비교 로직 구현
- [ ] 이미지 비교 메타데이터 생성
- [ ] 단위 테스트 작성

**완료 기준**:
- 두 버전 간 텍스트 diff 생성
- 메타데이터 차이점 정상 반환
- 테스트 커버리지 85% 이상

### 1.6 Milestone 6: 버전 비교 UI (Priority: High)

**목표**: Side-by-side 버전 비교 컴포넌트 구현

**작업 항목**:
- [ ] react-diff-viewer-continued 의존성 추가
- [ ] `version-selector.tsx` 컴포넌트 생성
- [ ] `version-compare.tsx` 컴포넌트 생성
- [ ] Side-by-side diff 뷰 구현
- [ ] 변경 사항 하이라이트
- [ ] 메타데이터 비교 테이블
- [ ] 컴포넌트 테스트 작성

**완료 기준**:
- 두 버전 선택 후 비교 UI 표시
- 추가/삭제/수정 사항 하이라이트
- 메타데이터 차이점 표시

### 1.7 Milestone 7: 이미지 슬라이더 비교 (Priority: Medium)

**목표**: 이미지 파일 버전 간 슬라이더 비교 기능

**작업 항목**:
- [ ] `image-slider-compare.tsx` 컴포넌트 생성
- [ ] 슬라이더 드래그 인터랙션 구현
- [ ] 이미지 오버레이 처리
- [ ] 컴포넌트 테스트 작성

**완료 기준**:
- 슬라이더로 두 이미지 비교 가능
- 드래그 인터랙션 자연스러움

### 1.8 Milestone 8: 통합 및 최종 검증 (Priority: High)

**목표**: 전체 기능 통합 및 최종 검증

**작업 항목**:
- [ ] 문서 목록에 비교 버튼 추가
- [ ] 미리보기/비교 기능 통합
- [ ] 접근성 검증 (키보드, 스크린 리더)
- [ ] 성능 테스트 (10MB 파일)
- [ ] E2E 테스트 완료
- [ ] 문서화 업데이트

**완료 기준**:
- 모든 기능 정상 동작
- 접근성 기준 충족
- 성능 요구사항 충족
- 전체 테스트 커버리지 85% 이상

---

## 2. 기술 접근법

### 2.1 PDF 렌더링 전략

**선택**: PDF.js (클라이언트 사이드 렌더링)

**이유**:
- 브라우저 호환성이 뛰어남
- 서버 리소스 절약
- 오프라인 지원 가능

**구현 방식**:
```typescript
// 1. PDF.js 초기화
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// 2. 문서 로드
const loadingTask = pdfjsLib.getDocument(previewUrl);
const pdf = await loadingTask.promise;

// 3. 페이지 렌더링
const page = await pdf.getPage(pageNumber);
const canvas = canvasRef.current;
const context = canvas.getContext('2d');
page.render({ canvasContext: context, viewport });
```

### 2.2 Diff 알고리즘 전략

**선택**: diff-match-patch + react-diff-viewer-continued

**이유**:
- diff-match-patch: 정확한 텍스트 diff 알고리즘
- react-diff-viewer: 시각화된 side-by-side 뷰

**구현 방식**:
```typescript
// 1. 텍스트 추출 및 비교
import { diffMatchPatch } from 'diff-match-patch';
const dmp = new diffMatchPatch();
const diffs = dmp.diff_main(oldText, newText);
dmp.diff_cleanupSemantic(diffs);

// 2. React Diff Viewer로 렌더링
import ReactDiffViewer from 'react-diff-viewer-continued';
<ReactDiffViewer
  oldValue={oldText}
  newValue={newText}
  splitView={true}
/>
```

### 2.3 이미지 비교 전략

**선택**: 슬라이더 오버레이 방식

**이유**:
- 직관적인 시각적 비교
- 사용자 친화적 인터랙션

**구현 방식**:
```typescript
// 슬라이더 위치에 따른 clip-path 조정
const sliderStyle = {
  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
};
```

### 2.4 상태 관리

**선택**: React 상태 + tRPC 쿼리 캐시

**이유**:
- 미리보기/비교는 일시적 상태
- tRPC 캐시로 서버 상태 관리
- 추가 상태 관리 라이브러리 불필요

---

## 3. 아키텍처 설계

### 3.1 컴포넌트 계층 구조

```
DocumentPage
├── DocumentList
│   ├── DocumentCard
│   │   ├── PreviewButton → DocumentPreview (Modal)
│   │   └── CompareButton → VersionCompare (Modal)
│   └── DocumentFilters
├── DocumentPreview (Modal)
│   ├── PDFViewer
│   │   ├── PDFPage
│   │   └── PDFControls (zoom, page nav)
│   ├── ImageViewer
│   │   ├── ImageDisplay
│   │   └── ImageControls (zoom, pan)
│   └── DocumentMetadata
└── VersionCompare (Modal)
    ├── VersionSelector (x2)
    ├── DiffViewer (text files)
    ├── ImageSliderCompare (images)
    └── MetadataCompareTable
```

### 3.2 데이터 흐름

```
User Action (Preview/Compare)
    ↓
Custom Hook (useDocumentPreview / useVersionCompare)
    ↓
tRPC Procedure (getPreviewUrl / compareVersions)
    ↓
Service Layer (preview-service / diff-service)
    ↓
Database (documents table)
    ↓
File Storage (local filesystem)
    ↓
Response (preview URL / diff result)
    ↓
Component Rendering
```

### 3.3 tRPC 라우터 확장

```typescript
// src/modules/document/router.ts 확장
export const documentRouter = createTRPCRouter({
  // ... existing procedures ...

  // 미리보기 URL 조회
  getPreviewUrl: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // 권한 검증 + URL 생성
    }),

  // 버전 비교
  compareVersions: protectedProcedure
    .input(z.object({
      documentIdA: z.string().uuid(),
      documentIdB: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // diff 계산 + 결과 반환
    }),
});
```

---

## 4. 리스크 및 대응 계획

### 4.1 기술 리스크

| 리스크 | 확률 | 영향 | 대응 계획 |
|--------|------|------|----------|
| PDF.js 대용량 파일 렌더링 성능 | Medium | High | 청크 로딩, 워커 사용, 로딩 인디케이터 |
| 브라우저별 PDF 렌더링 차이 | Medium | Medium | 폴백 to 네이티브 뷰어 |
| diff 알고리즘 성능 (대용량 텍스트) | Low | Medium | 가상 스크롤, diff 최적화 |

### 4.2 사용자 경험 리스크

| 리스크 | 확률 | 영향 | 대응 계획 |
|--------|------|------|----------|
| 모바일에서 미리보기 사용성 | High | Medium | 반응형 디자인, 터치 제스처 지원 |
| 대용량 파일 로딩 대기 | Medium | Medium | 진행률 표시, 백그라운드 로딩 |

---

## 5. 의존성 관리

### 5.1 추가 의존성

```json
{
  "dependencies": {
    "pdfjs-dist": "^4.0.0",
    "react-diff-viewer-continued": "^4.0.0",
    "diff-match-patch": "^1.0.5"
  },
  "devDependencies": {
    "@types/diff-match-patch": "^1.0.36"
  }
}
```

### 5.2 번들 크기 영향

| 패키지 | 크기 | 영향 |
|--------|------|------|
| pdfjs-dist | ~500KB (gzip: ~200KB) | 동적 import로 최적화 |
| react-diff-viewer-continued | ~50KB | 미미함 |
| diff-match-patch | ~30KB | 미미함 |

**최적화 전략**:
- PDF.js는 dynamic import로 필요시에만 로드
- 미리보기 컴포넌트는 lazy loading

---

## 6. 테스트 전략

### 6.1 단위 테스트

**커버리지 목표**: 85%

**테스트 대상**:
- preview-service.ts: URL 생성, 권한 검증
- diff-service.ts: diff 알고리즘, 메타데이터 비교
- 컴포넌트: 렌더링, 상태 관리, 이벤트 처리

### 6.2 통합 테스트

**테스트 시나리오**:
- 미리보기 요청 → 응답 → 렌더링 플로우
- 버전 비교 요청 → diff 계산 → 결과 표시

### 6.3 E2E 테스트

**테스트 케이스**:
- TC-E2E-001: PDF 미리보기 전체 플로우
- TC-E2E-002: 이미지 미리보기 전체 플로우
- TC-E2E-003: 텍스트 파일 버전 비교
- TC-E2E-004: 이미지 파일 버전 비교

---

## 7. 다음 단계

1. **개발 시작**: `/moai:2-run SPEC-PLM-010` 실행
2. **팀 모드**: 복잡도에 따라 팀 모드 고려
3. **진행 상황 추적**: 각 마일스톤 완료 시 업데이트
