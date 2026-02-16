# PLM System Web - 배포 환경 분석 및 결정

## 결정 사항: Synology NAS + Cloudflare Tunnel

**확정일**: 2026-02-15
**결정자**: drake

## Context

PLM System Web(Next.js 15 + tRPC + Drizzle ORM + PostgreSQL 16) 구현 완료 후 운영 환경을 결정합니다.
사용자 조건: **무료 우선**, 로컬 테스트 후 프로덕션 전환, Cloudflare DNS 사용 예정.

시스템 요구사항:
- Next.js 15 (Node.js 20+ 런타임, SSR)
- PostgreSQL 16
- 파일 스토리지 (PLM 문서, CAD 파일 등 대용량 가능)
- Docker 지원 필수
- 24/7 가용성 필요 (팀 협업 도구)

---

## 3가지 배포 옵션 비교

### Option A: Synology NAS

| 항목 | 내용 |
|------|------|
| **권장 모델** | DS920+ (Celeron J4125, 4GB→8GB 확장) 또는 DS1621+ (Ryzen V1500B, 4GB→32GB 확장) |
| **Docker** | Container Manager (구 Docker 패키지) 내장, docker-compose 지원 |
| **CPU** | Celeron J4125 (4코어 2.7GHz) 또는 Ryzen V1500B (4코어 2.2GHz) |
| **RAM** | 4GB 기본 → 8~32GB 확장 가능 (PostgreSQL + Next.js에 최소 4GB 권장) |
| **스토리지** | NAS 볼륨 직접 마운트 (대용량 파일 저장에 최적) |
| **전력** | 25~40W (24시간 운영 시 월 2,000~3,000원) |
| **네트워크** | Cloudflare Tunnel로 포트포워딩 없이 외부 접속 가능 |
| **비용** | 하드웨어 초기 비용만 (DS920+ 약 60~70만원, HDD 별도) |
| **장점** | 저전력 24/7 운영, 대용량 파일 스토리지, UPS 연동, 물리적 데이터 소유 |
| **단점** | CPU 성능 제한 (SSR 렌더링 시 병목), 동시접속 50명 이상 시 성능 저하, 외부 접속 속도 가정 인터넷 의존 |
| **적합 규모** | 1~20명 소규모 팀 |

### Option B: 서버/VPS

| 항목 | 내용 |
|------|------|
| **권장 (무료)** | Oracle Cloud Always Free: ARM A1 4 OCPU + 24GB RAM (영구 무료) |
| **권장 (유료)** | Hetzner CAX11 (2 ARM vCPU, 4GB, 40GB) EUR 3.79/월 |
| **CPU** | Ampere Altra ARM 4코어 3.0GHz (Oracle Free) - NAS 대비 3~5배 성능 |
| **RAM** | 24GB (Oracle Free) - PostgreSQL + Next.js에 충분 |
| **스토리지** | 200GB Block Storage (Oracle Free) + Cloudflare R2 연동 |
| **네트워크** | 데이터센터급 네트워크, Cloudflare DNS 직접 연결 |
| **비용** | Oracle Free: 완전 무료 / Hetzner: 월 ~5,000원 |
| **장점** | 강력한 CPU/RAM, 안정적 네트워크, 무료 옵션 존재, 스케일업 용이 |
| **단점** | Oracle Free 인스턴스 확보 어려움 (Out of Capacity 빈번), 데이터 물리적 소유 불가, 파일 스토리지 200GB 제한 |
| **적합 규모** | 1~100명 중규모 팀 |

### Option C: 워크스테이션 (데스크탑/서버)

| 항목 | 내용 |
|------|------|
| **권장 사양** | i5/Ryzen 5 이상, 16GB+ RAM, SSD 500GB+ |
| **Docker** | Docker Desktop 또는 WSL2 + Docker Engine |
| **CPU** | 일반 데스크탑급 (NAS 대비 5~10배 성능) |
| **RAM** | 16~64GB (여유로움) |
| **전력** | 100~300W (24시간 운영 시 월 10,000~30,000원) |
| **비용** | 기존 장비 활용 시 전기료만 / 신규 구매 시 50~100만원 |
| **장점** | 최고 성능, 기존 장비 재활용, 무제한 스토리지 |
| **단점** | 높은 전력 소비, 소음, 24/7 운영 불안정 (업데이트/장애), UPS 필수 |
| **적합 규모** | 개발/테스트 또는 1~10명 소규모 |

---

## 종합 비교 매트릭스

| 평가 항목 | Synology NAS | 서버/VPS (Oracle Free) | 워크스테이션 |
|-----------|:-----------:|:--------------------:|:----------:|
| 초기 비용 | X 60~70만원 | O 무료 | - 기존 장비 시 무료 |
| 월 운영비 | O ~3,000원 | O 무료 | X ~20,000원 |
| CPU 성능 | - 제한적 | O 우수 (ARM 4코어) | O 최고 |
| RAM | - 4~8GB | O 24GB | O 16~64GB |
| 파일 스토리지 | O 최고 (TB급) | - 200GB 제한 | O 우수 |
| 24/7 안정성 | O 우수 | O 최고 | - 불안정 |
| 네트워크 속도 | - 가정 인터넷 | O 데이터센터급 | - 가정 인터넷 |
| 확장성 | - 하드웨어 제한 | O 유료 전환 시 무제한 | - 하드웨어 제한 |
| 데이터 소유 | O 물리적 보유 | X 클라우드 의존 | O 물리적 보유 |
| PLM 파일 관리 | O NAS 특화 | - R2 연동 필요 | - 별도 관리 |
| 관리 난이도 | O DSM 웹 UI | - CLI 관리 | X 직접 관리 |
| 동시접속 한계 | ~20명 | ~100명 | ~50명 |

---

## Option D: Google Cloud Platform (GCP)

### GCP 구성 옵션

**옵션 D-1: Cloud Run + Cloud SQL (관리형 서비스)**

| 항목 | 내용 |
|------|------|
| **앱 호스팅** | Cloud Run (서버리스 컨테이너) |
| **DB** | Cloud SQL for PostgreSQL |
| **스토리지** | Cloud Storage |
| **네트워크** | Cloud Load Balancer + Cloudflare DNS 연동 가능 |

| 구성요소 | 무료 범위 | 초과 시 월 비용 |
|----------|-----------|----------------|
| Cloud Run | 2M requests, 50 CPU-hours, 100 GiB-hours/월 | 소규모: $1~5/월 |
| Cloud SQL (PostgreSQL) | **무료 티어 없음** (30일 체험만) | db-f1-micro: **~$7~10/월**, db-g1-small: **~$25/월** |
| Cloud Storage | 5GB 무료 | $0.020/GB/월 (100GB = $2/월) |
| **합계 (최소)** | | **~$10~15/월 (약 13,000~20,000원)** |
| **합계 (안정적)** | | **~$30~40/월 (약 40,000~53,000원)** |

**옵션 D-2: Compute Engine VM (자체 관리)**

| 항목 | 내용 |
|------|------|
| e2-micro (Always Free) | 0.25 vCPU, 1GB RAM - Next.js + PostgreSQL에 **너무 부족** |
| e2-small | 0.5 vCPU, 2GB RAM - **~$13/월** (최소 운영 가능하나 느림) |
| e2-medium | 1 vCPU, 4GB RAM - **~$27/월** (원활한 운영) |
| e2-standard-2 | 2 vCPU, 8GB RAM - **~$49/월** (여유로운 운영) |

VM에 Next.js + PostgreSQL 직접 설치 시 Cloud SQL 비용 절약.

### GCP vs 다른 클라우드 비교

| 항목 | GCP | Oracle Free | Vercel+Neon Free | AWS Free |
|------|-----|-------------|------------------|----------|
| **월 비용** | $10~40 | **$0** | **$0** | $0 (12개월 후 유료) |
| **CPU** | 0.25~2 vCPU | 4 OCPU ARM | 서버리스 | 1 vCPU (t2.micro) |
| **RAM** | 1~8GB | **24GB** | 서버리스 | 1GB |
| **DB** | Cloud SQL 유료 | 자체 설치 무료 | Neon 500MB 무료 | RDS 유료 |
| **스토리지** | 5GB 무료 | 200GB 무료 | - | 5GB 무료 |
| **무료 지속** | e2-micro만 영구 | **영구** | **영구** | 12개월 한정 |
| **PLM 파일 적합** | Cloud Storage $2/100GB | 200GB 제한 | 별도 필요 | S3 $2.3/100GB |

### GCP 종합 평가

- **장점**: Google 인프라 안정성, Cloud Run 서버리스 편의성, 자동 스케일링, 글로벌 CDN
- **단점**: **PLM에는 가격 대비 성능이 비효율적**. Cloud SQL 무료 티어 없음이 치명적
- **결론**: 무료 우선 전략에는 부적합. Oracle Free(완전 무료) 또는 NAS(초기비용만)가 더 경제적

### 추천 시나리오
- GCP가 적합한 경우: **기업 환경**, 높은 가용성/SLA 필요, 구글 워크스페이스 연동, 예산 월 5만원 이상
- GCP가 부적합한 경우: **무료 우선 개인 프로젝트**, 소규모 팀, 대용량 파일 관리

---

## 전체 클라우드 비용 요약

| 배포 옵션 | 월 비용 | 초기 비용 | 적합 규모 |
|-----------|---------|-----------|-----------|
| **Oracle Cloud Free** | **$0** | $0 | 1~100명 |
| **Vercel + Neon Free** | **$0** | $0 | 1~50명 (제한적) |
| **Synology NAS** | **~3,000원** (전기) | 60~70만원 | 1~20명 |
| **Hetzner CAX11** | **~5,000원** | $0 | 1~50명 |
| **GCP (최소)** | **~15,000원** | $0 | 1~100명 |
| **GCP (안정적)** | **~40,000원** | $0 | 1~500명 |
| **AWS (Free 후)** | **~20,000원** | $0 | 1~100명 |

---

## Synology NAS 최대 사용자 용량 분석

### 병목 요소별 분석

**1. CPU (가장 큰 병목)**

| 모델 | CPU | 코어 | 클럭 | SSR 처리량 |
|------|-----|------|------|-----------|
| DS920+ | Celeron J4125 | 4코어 | 2.0~2.7GHz | ~20~40 req/s |
| DS1621+ | Ryzen V1500B | 4코어 | 2.2GHz | ~25~50 req/s |
| DS925+ (신형) | Ryzen R1600 | 2코어 | 2.6~3.1GHz | ~20~35 req/s |

- Next.js SSR 페이지 렌더링: 페이지당 ~50~200ms CPU 소요
- 4코어 동시 처리: 최대 4개 SSR 요청 병렬 처리
- DB 조회 포함 복잡한 페이지: ~200~500ms

**2. RAM**

| RAM 구성 | 배분 | 동시접속 한계 |
|----------|------|-------------|
| 4GB (기본) | Next.js ~300MB + PostgreSQL ~500MB + Docker ~200MB = ~1GB 여유 | 제한적, 스와핑 발생 |
| 8GB (확장) | Next.js ~500MB + PostgreSQL ~2GB + Docker ~200MB = ~5GB 여유 | 안정적 운영 |
| 16~32GB | 풍부한 DB 캐시, 여러 컨테이너 가능 | 최적 |

**3. 네트워크 (한국 가정 기준)**

| 인터넷 | 업로드 속도 | 페이지 전송 (300KB 기준) | 동시 전송 |
|--------|-----------|----------------------|----------|
| 100Mbps 대칭 | 100Mbps | ~40 페이지/초 | ~40명 |
| 500Mbps 대칭 | 500Mbps | ~200 페이지/초 | ~200명 |
| 1Gbps 대칭 | 1Gbps | ~400 페이지/초 | 충분 |

Cloudflare가 정적 자산(CSS/JS/이미지)을 캐시하므로 실제 NAS 부하는 API 호출 + SSR만.

### 모델별 동시접속 예상치

**DS920+ (4GB RAM, Celeron J4125) - 최소 구성**

| 사용 패턴 | 동시접속 | 설명 |
|-----------|---------|------|
| 가벼운 사용 (대시보드 조회, 이슈 목록) | **15~25명** | 주로 읽기, 캐시 활용 |
| 보통 사용 (이슈 생성/수정, 댓글) | **8~15명** | CRUD + SSR |
| 무거운 사용 (BOM 트리, 대용량 파일 업로드) | **3~8명** | 재귀 쿼리 + 파일 I/O |

등록 가능 사용자: **~50~80명** (피크 동시접속 20~30% 가정)

**DS920+ (8GB RAM, Celeron J4125) - 권장 구성**

| 사용 패턴 | 동시접속 | 설명 |
|-----------|---------|------|
| 가벼운 사용 | **25~40명** | DB 캐시 충분 |
| 보통 사용 | **12~25명** | PostgreSQL shared_buffers 2GB |
| 무거운 사용 | **5~12명** | CPU가 주 병목 |

등록 가능 사용자: **~100~150명**

**DS1621+ (8~32GB RAM, Ryzen V1500B) - 고성능 구성**

| 사용 패턴 | 동시접속 | 설명 |
|-----------|---------|------|
| 가벼운 사용 | **35~60명** | Ryzen이 Celeron 대비 ~30% 빠름 |
| 보통 사용 | **15~35명** | 충분한 RAM + 더 빠른 CPU |
| 무거운 사용 | **8~18명** | 여전히 CPU가 병목 |

등록 가능 사용자: **~150~300명**

### 용량 최적화 전략 (추가 30~50% 성능 향상)

1. **Next.js ISR/SSG 활용**: 정적 페이지 생성으로 SSR 부하 대폭 감소 (대시보드, 목록 페이지)
2. **Cloudflare 캐시**: 정적 자산 + API 응답 캐시로 NAS 요청 50% 이상 감소
3. **PostgreSQL 튜닝**: shared_buffers, work_mem, effective_cache_size 최적화
4. **Node.js Clustering**: PM2로 4코어 모두 활용 (Next.js standalone 모드)
5. **Connection Pooling**: PgBouncer로 DB 연결 효율화

최적화 적용 시:
- DS920+ (8GB): **보통 사용 30~40명 동시접속 가능**
- DS1621+ (16GB+): **보통 사용 40~60명 동시접속 가능**

### PLM 특화 고려사항

| 기능 | 부하 특성 | NAS 영향 |
|------|----------|---------|
| BOM 트리 조회 | 재귀 SQL 쿼리, 깊이에 따라 CPU 부하 | 10+ 레벨 시 쿼리 500ms+ |
| CAD 파일 업로드 | 대용량 파일 I/O (수십MB~수GB) | NAS 스토리지 강점, 네트워크 병목 |
| 변경 주문 승인 | 낮은 부하, 알림 발생 | 거의 영향 없음 |
| 대시보드 차트 | 집계 쿼리, 캐시 가능 | ISR로 캐시 시 부하 최소 |

---

## 권장안: 단계별 하이브리드 전략

### 1단계: 개발/테스트 (현재 ~ MVP 완성)
- **환경**: 로컬 워크스테이션 (Docker Compose)
- **비용**: 0원
- **목적**: 개발 및 기능 검증

### 2단계: 프로덕션 MVP (팀 1~20명)

**권장 A: Synology NAS + Cloudflare Tunnel** (NAS 보유/구매 예정 시)

- PLM 특성상 CAD 파일, BOM 문서 등 대용량 파일 관리가 핵심 → NAS TB급 스토리지 최적
- 24/7 저전력 운영 (월 ~3,000원)
- Cloudflare Tunnel로 포트포워딩 없이 HTTPS 외부 접속
- 물리적 데이터 소유 (제조업 PLM 데이터 보안 중요)

```
Synology NAS (DS920+ / DS1621+)
├── Docker: Next.js App (포트 3000)
├── Docker: PostgreSQL 16 (포트 5432)
├── NAS Volume: /volume1/plm-files/ (PLM 문서 스토리지)
└── Cloudflare Tunnel: plm.yourdomain.com → localhost:3000
```

**권장 B: Oracle Cloud Free Tier** (무료 최우선, 파일 적은 경우)

- 24GB RAM + 4 OCPU로 NAS보다 성능 우수
- 완전 무료, 데이터센터급 네트워크
- 단, 파일 스토리지 200GB 제한 (Cloudflare R2 Free 10GB/월 보완)
- 인스턴스 확보 어려움 주의

### 3단계: 확장 (팀 20명 이상)

NAS(파일) + VPS(앱) 분리 또는 풀 클라우드(Vercel + Neon + R2) 전환

---

## Cloudflare 연동 (공통)

1. **Cloudflare Tunnel** (Zero Trust): 포트포워딩 없이 NAS/서버를 HTTPS로 노출
2. **Cloudflare DNS**: 도메인 → 서버 연결
3. **Cloudflare R2** (선택): 파일 스토리지 CDN (NAS 사용 시 불필요)
4. **Cloudflare WAF**: 무료 보안 보호

---

## 추가 요구사항: BOM 접근 제한

**요구사항**: BOM 관련 기능은 특정 ID(5~10명)에만 접근 허용

### 영향받는 SPEC

| SPEC | 변경 내용 |
|------|----------|
| **SPEC-PLM-002** (인증) | `plm_access` 역할/권한 추가. 프로젝트 멤버 역할에 `plm_viewer`, `plm_editor` 추가 |
| **SPEC-PLM-005** (BOM) | BOM 조회/수정 시 PLM 권한 체크 미들웨어 적용. 무권한 사용자에게 메뉴 비노출 |
| **SPEC-PLM-006** (변경주문) | 변경 주문 생성/승인도 PLM 권한 사용자만 접근 |
| **SPEC-PLM-003** (프로젝트) | 프로젝트 설정에 "PLM 접근 멤버" 관리 UI 추가 |

### 구현 방식

1. **project_members 테이블에 permissions 컬럼 추가**:
   - `permissions: jsonb` - `{ "plm_access": true }` 형태
   - 또는 별도 `plm_members` 테이블 (프로젝트별 PLM 접근 허용 사용자 목록)

2. **tRPC 미들웨어**:
   - `requirePlmAccess` 미들웨어 생성
   - `plm.*` 라우터 전체에 적용
   - 비인가 시 403 Forbidden 반환

3. **UI 접근 제어**:
   - PLM 권한 없는 사용자: 사이드바에서 BOM/변경주문 메뉴 숨김
   - 프로젝트 URL 직접 접근 시 "권한 없음" 페이지 표시
   - 프로젝트 설정 > "PLM 멤버 관리" 탭 (프로젝트 관리자만)

4. **기본값**: 프로젝트 생성 시 PLM 접근은 생성자(owner)만 허용. 관리자가 추가 지정.

---

## 실행 계획

배포 환경이 **Synology NAS + Cloudflare**로 확정되었습니다.

### 다음 단계

1. **SPEC-PLM-001 (스캐폴딩)에 배포 설정 반영**:
   - Docker Compose에 Cloudflare Tunnel 컨테이너 추가
   - NAS 볼륨 마운트 경로 설정 (`/volume1/plm-files/`)
   - 환경변수에 Cloudflare Tunnel 토큰 추가
   - Next.js standalone 빌드 모드 설정 (NAS 최적화)

2. **SPEC 승인 후 구현 시작**:
   - `/moai run SPEC-PLM-001` 실행
   - SPEC-001 ~ SPEC-007 순차/병렬 구현

3. **배포 설정 파일 추가**:
   - `docker/docker-compose.prod.yml` (NAS 프로덕션용)
   - `docker/Dockerfile` (Next.js standalone 빌드)
   - `.env.production.example` (NAS 환경변수 템플릿)

### 검증 방법

1. 로컬 Docker Compose로 전체 스택 테스트
2. `docker compose -f docker/docker-compose.prod.yml up` 으로 프로덕션 구성 검증
3. Cloudflare Tunnel 연결 테스트 (NAS에 배포 후)

## Sources

- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Oracle Always Free Resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
- [Synology Docker PostgreSQL](https://mariushosting.com/how-to-install-postgresql-on-your-synology-nas/)
- [Oracle Free ARM Guide](https://orendra.com/blog/how-to-get-free-lifetime-servers-4-core-arm-24gb-ram-more/)
- [Google Cloud Free Tier](https://cloud.google.com/free)
- [Cloud SQL Pricing](https://cloud.google.com/sql/pricing)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Cloud Run Free Tier Infographic](https://www.freetiers.com/directory/google-cloud-run)
