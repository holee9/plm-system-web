# SPEC-PLM-010: 문서 고급 기능 (Document Advanced Features)

## 메타데이터

| 필드 | 값 |
|------|-----|
| SPEC ID | SPEC-PLM-010 |
| 제목 | 문서 고급 기능 (Document Advanced Features) |
| 도메인 | PLM (Product Lifecycle Management) |
| 우선순위 | High |
| 상태 | Planned |
| 생성일 | 2026-02-18 |
| 관련 SPEC | SPEC-PLM-003 (프로젝트 관리), SPEC-PLM-006 (문서 관리 기본) |
| 개발 방식 | Hybrid (TDD for new, DDD for legacy) |

---

## 1. 환경 (Environment)

### 1.1 시스템 컨텍스트

본 SPEC은 PLM System Web의 문서 관리 모듈에 고급 기능을 추가합니다. 기존 문서 관리 시스템은 파일 업로드, 다운로드, 버전 관리 기능을 제공하며, 본 기능은 이를 확장하여 문서 미리보기와 버전 간 비교 기능을 제공합니다.

### 1.2 기술 스택

**프론트엔드**:
- Next.js 15.0 (App Router)
- React 19.0
- TypeScript 5.7
- shadcn/ui (Dialog, Tabs, ScrollArea 컴포넌트)
- PDF.js (PDF 렌더링)
- diff-match-patch 또는 react-diff-viewer (버전 비교)

**백엔드**:
- tRPC v11
- Drizzle ORM
- PostgreSQL 16

**파일 처리**:
- PDF 미리보기: PDF.js 또는 브라우저 네이티브 PDF 뷰어
- 이미지 미리보기: Next.js Image 컴포넌트 또는 브라우저 네이티브

### 1.3 제약 조건

**기술적 제약**:
- PDF 파일 크기: 최대 50MB
- 이미지 파일 크기: 최대 50MB
- 지원 이미지 형식: PNG, JPG, JPEG, GIF, WebP, SVG
- PDF 렌더링: 클라이언트 사이드 렌더링

**비즈니스 제약**:
- 문서 미리보기는 인증된 사용자만 접근 가능
- 버전 비교는 최대 10개 버전까지 지원
- 미리보기 성능: 초기 로딩 3초 이내

### 1.4 가정 (Assumptions)

| 가정 | 신뢰도 | 검증 방법 |
|------|--------|----------|
| 브라우저가 PDF.js를 지원함 | High | 브라우저 호환성 테스트 |
| 대부분의 문서가 10MB 이하임 | Medium | 기존 파일 통계 분석 |
| 사용자가 동시에 2개 버전만 비교함 | High | UX 리서치 |
| 파일 스토리지가 로컬 파일 시스템임 | High | 인프라 확인 |

---

## 2. 요구사항 (Requirements)

### 2.1 D-010: 문서 미리보기 (Document Preview)

#### 2.1.1 Ubiquitous Requirements (보편적 요구사항)

**REQ-PREVIEW-001**: 시스템은 **항상** 문서 미리보기 요청 시 문서 메타데이터(파일명, 크기, MIME 타입, 업로드 일시, 업로더 정보)를 표시해야 한다.

**REQ-PREVIEW-002**: 시스템은 **항상** 미리보기 불가능한 파일 형식에 대해 다운로드 링크를 제공해야 한다.

#### 2.1.2 Event-Driven Requirements (이벤트 기반 요구사항)

**REQ-PREVIEW-003**: **WHEN** 사용자가 문서 목록에서 미리보기 버튼을 클릭 **THEN** 시스템은 미리보기 모달을 열고 문서 콘텐츠를 렌더링해야 한다.

**REQ-PREVIEW-004**: **WHEN** PDF 파일 미리보기가 요청됨 **THEN** 시스템은 PDF.js를 사용하여 클라이언트 사이드에서 PDF를 렌더링해야 한다.

**REQ-PREVIEW-005**: **WHEN** 이미지 파일 미리보기가 요청됨 **THEN** 시스템은 Next.js Image 컴포넌트를 사용하여 최적화된 이미지를 표시해야 한다.

**REQ-PREVIEW-006**: **WHEN** 미리보기 모달이 닫힘 **THEN** 시스템은 렌더링된 리소스를 정리해야 한다.

**REQ-PREVIEW-007**: **WHEN** 미리보기 로딩 중 오류 발생 **THEN** 시스템은 오류 메시지를 표시하고 다운로드 옵션을 제공해야 한다.

#### 2.1.3 State-Driven Requirements (상태 기반 요구사항)

**REQ-PREVIEW-008**: **IF** 파일 크기가 10MB를 초과 **THEN** 시스템은 사용자에게 로딩 시간이 길 수 있음을 알리는 경고를 표시해야 한다.

**REQ-PREVIEW-009**: **IF** 브라우저가 PDF 렌더링을 지원하지 않음 **THEN** 시스템은 브라우저 네이티브 PDF 뷰어로 대체하거나 다운로드 링크를 제공해야 한다.

#### 2.1.4 Unwanted Behavior Requirements (원치 않는 동작 요구사항)

**REQ-PREVIEW-010**: 시스템은 미리보기 중 원본 파일을 수정하거나 삭제하지 **않아야 한다**.

**REQ-PREVIEW-011**: 시스템은 미리보기 위해 전체 파일을 메모리에 로드하지 **않아야 한다** (스트리밍 또는 청크 로딩 사용).

### 2.2 D-011: 버전 간 비교 (Version Comparison)

#### 2.2.1 Ubiquitous Requirements (보편적 요구사항)

**REQ-COMPARE-001**: 시스템은 **항상** 버전 선택 UI를 통해 두 버전 선택을 지원해야 한다.

**REQ-COMPARE-002**: 시스템은 **항상** 비교 결과에 변경 유형(추가, 삭제, 수정)을 명확히 표시해야 한다.

#### 2.2.2 Event-Driven Requirements (이벤트 기반 요구사항)

**REQ-COMPARE-003**: **WHEN** 사용자가 두 버전을 선택하고 비교 버튼 클릭 **THEN** 시스템은 side-by-side 비교 UI를 표시해야 한다.

**REQ-COMPARE-004**: **WHEN** 텍스트 기반 파일 비교 요청 **THEN** 시스템은 diff 알고리즘을 적용하여 변경 사항을 하이라이트해야 한다.

**REQ-COMPARE-005**: **WHEN** 메타데이터 비교 요청 **THEN** 시스템은 파일 크기, 업로드 일시, 업로더 정보의 차이를 표시해야 한다.

**REQ-COMPARE-006**: **WHEN** 이미지 파일 비교 요청 **THEN** 시스템은 두 이미지를 나란히 표시하고 슬라이더 비교 기능을 제공해야 한다.

**REQ-COMPARE-007**: **WHEN** 비교 완료 **THEN** 시스템은 변경 요약(추가된 줄, 삭제된 줄, 수정된 줄 수)을 제공해야 한다.

#### 2.2.3 State-Driven Requirements (상태 기반 요구사항)

**REQ-COMPARE-008**: **IF** 선택된 두 버전이 동일함 **THEN** 시스템은 "변경 사항 없음" 메시지를 표시해야 한다.

**REQ-COMPARE-009**: **IF** 비교할 수 없는 파일 형식 (바이너리 파일) **THEN** 시스템은 메타데이터 비교만 제공해야 한다.

**REQ-COMPARE-010**: **IF** 버전이 2개 미만임 **THEN** 시스템은 비교 기능을 비활성화해야 한다.

#### 2.2.4 Optional Requirements (선택적 요구사항)

**REQ-COMPARE-011**: **가능하면** PDF 파일의 경우 페이지별 비교 기능을 제공한다.

**REQ-COMPARE-012**: **가능하면** 비교 결과를 PDF 또는 이미지로 내보내기 기능을 제공한다.

#### 2.2.5 Unwanted Behavior Requirements (원치 않는 동작 요구사항)

**REQ-COMPARE-013**: 시스템은 비교 과정에서 원본 파일을 수정하지 **않아야 한다**.

**REQ-COMPARE-014**: 시스템은 비교 결과를 캐시하지만 원본 데이터와 불일치하는 결과를 표시하지 **않아야 한다**.

---

## 3. 명세 (Specifications)

### 3.1 API 명세

#### 3.1.1 문서 미리보기 API

**getPreviewUrl** - 문서 미리보기 URL 조회

```
Input:
  documentId: string (UUID)

Output:
  previewUrl: string
  document: {
    id: string
    originalFileName: string
    mimeType: string
    fileSize: number
    uploadedBy: { id: string, name: string }
    createdAt: Date
  }

Authorization: 인증된 사용자
```

#### 3.1.2 버전 비교 API

**compareVersions** - 두 문서 버전 비교

```
Input:
  documentIdA: string (UUID)
  documentIdB: string (UUID)

Output:
  comparison: {
    metaDiff: {
      fileSize: { old: number, new: number }
      uploadedAt: { old: Date, new: Date }
      uploadedBy: { old: User, new: User }
    }
    contentDiff?: {
      additions: number
      deletions: number
      modifications: number
      diffHtml: string
    }
    type: 'text' | 'binary' | 'image'
  }

Authorization: 인증된 사용자
```

### 3.2 UI 컴포넌트 명세

#### 3.2.1 DocumentPreview 컴포넌트

```
Props:
  documentId: string
  isOpen: boolean
  onClose: () => void

Features:
  - PDF 렌더링 (PDF.js)
  - 이미지 렌더링 (Next.js Image)
  - 메타데이터 표시
  - 다운로드 버튼
  - 줌 인/아웃
  - 페이지 네비게이션 (PDF)
```

#### 3.2.2 VersionCompare 컴포넌트

```
Props:
  resourceId: string
  resourceType: 'issue' | 'part' | 'change_order' | 'project' | 'milestone'
  isOpen: boolean
  onClose: () => void

Features:
  - 버전 선택 드롭다운 (2개)
  - Side-by-side diff 뷰
  - 변경 사항 하이라이트
  - 메타데이터 비교 테이블
  - 이미지 슬라이더 비교
```

### 3.3 데이터베이스 스키마 변경

기존 `documents` 테이블 활용 (변경 없음):

```sql
-- 기존 documents 테이블 구조
documents (
  id UUID PRIMARY KEY,
  resource_id UUID NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  original_file_name VARCHAR(500) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path VARCHAR(1000) NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  is_latest BOOLEAN DEFAULT TRUE NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 4. 파일 수정 목록

### 4.1 신규 파일

| 파일 경로 | 설명 |
|----------|------|
| `src/app/projects/[key]/documents/preview/[...id]/page.tsx` | 문서 미리보기 페이지 |
| `src/components/document/document-preview.tsx` | 문서 미리보기 모달 컴포넌트 |
| `src/components/document/version-compare.tsx` | 버전 비교 컴포넌트 |
| `src/components/document/image-slider-compare.tsx` | 이미지 슬라이더 비교 컴포넌트 |
| `src/components/document/version-selector.tsx` | 버전 선택 드롭다운 컴포넌트 |
| `src/modules/document/preview-service.ts` | 미리보기 관련 서비스 로직 |
| `src/modules/document/diff-service.ts` | Diff 알고리즘 서비스 |
| `src/hooks/use-document-preview.ts` | 문서 미리보기 커스텀 훅 |
| `src/hooks/use-version-compare.ts` | 버전 비교 커스텀 훅 |

### 4.2 수정 파일

| 파일 경로 | 변경 사항 |
|----------|----------|
| `src/modules/document/router.ts` | 미리보기, 버전 비교 tRPC 프로시저 추가 |
| `src/modules/document/service.ts` | 미리보기 URL 생성, diff 로직 추가 |
| `src/app/projects/[key]/documents/page.tsx` | 미리보기, 버전 비교 버튼 추가 |
| `src/components/document/document-list.tsx` | 액션 버튼 (미리보기, 비교) 추가 |

### 4.3 의존성 추가

```json
{
  "dependencies": {
    "pdfjs-dist": "^4.0.0",
    "react-diff-viewer-continued": "^4.0.0",
    "diff-match-patch": "^1.0.5"
  }
}
```

---

## 5. 비기능 요구사항

### 5.1 성능 요구사항

| 항목 | 요구사항 |
|------|----------|
| PDF 미리보기 초기 로딩 | 3초 이내 (10MB 이하 파일) |
| 이미지 미리보기 로딩 | 1초 이내 |
| 버전 비교 로딩 | 5초 이내 |
| 동시 미리보기 세션 | 10개까지 지원 |

### 5.2 보안 요구사항

| 항목 | 요구사항 |
|------|----------|
| 접근 제어 | 인증된 사용자만 미리보기/비교 가능 |
| 파일 접근 권한 | 리소스 접근 권한 확인 후 미리보기 허용 |
| XSS 방지 | 미리보기 콘텐츠는 샌드박스 iframe 또는 안전한 렌더링 |

### 5.3 접근성 요구사항

| 항목 | 요구사항 |
|------|----------|
| 키보드 네비게이션 | 모든 미리보기/비교 기능에 키보드 접근 가능 |
| 스크린 리더 | 변경 사항에 대한 적절한 ARIA 레이블 제공 |
| 색상 대비 | 변경 하이라이트는 충분한 색상 대비 유지 |

---

## 6. 추적성 매트릭스

| 요구사항 ID | 구현 컴포넌트 | 테스트 케이스 |
|-------------|--------------|---------------|
| REQ-PREVIEW-001 ~ 011 | DocumentPreview, preview-service.ts | TC-PREVIEW-001 ~ 011 |
| REQ-COMPARE-001 ~ 014 | VersionCompare, diff-service.ts | TC-COMPARE-001 ~ 014 |

---

## 7. 참조 문서

- [CLAUDE.md](../../../CLAUDE.md) - MoAI 실행 지침
- [tech.md](../../project/tech.md) - 기술 스택 가이드
- [structure.md](../../project/structure.md) - 프로젝트 구조
- [documents.ts](../../../src/server/db/documents.ts) - 문서 데이터베이스 스키마
- [document/router.ts](../../../src/modules/document/router.ts) - 기존 문서 라우터
