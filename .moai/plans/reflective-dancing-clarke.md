# MCP 서버 권한 추가 계획

## Context

사용자가 MCP 서버 중 pencil만 보인다고 보고하여 분석한 결과, 전역 settings.json에 context7과 sequential-thinking MCP 서버에 대한 권한이 누락된 것을 확인함.

전역 `.mcp.json`에는 4개의 MCP 서버가 정의되어 있으나, 전역 `settings.json`에는 codex와 pencil에 대한 권한만 설정되어 있어 context7과 sequential-thinking을 사용할 수 없는 상태임.

## 변경 대상 파일

- `C:\Users\user\.claude\settings.json`

## 권한 추가 내용

`permissions.allow` 배열에 다음 항목들을 추가:

1. `"mcp__context7__*"` - Context7 라이브러리 문서 조회 서버 전체 권한
2. `"mcp__sequential-thinking__*"` - Sequential Thinking 추론 서버 전체 권한

## 검증 방법

1. settings.json 파일을 읽어 변경사항 확인
2. Claude Code 재시작 후 MCP 서버가 정상 로드되는지 확인
3. 사용 가능한 MCP 툴 리스트 확인

---

**참고**: 프로젝트 settings.json에는 이미 해당 권한이 설정되어 있으나, 전역 settings.json이 우선 적용되는 것으로 판단됨.
