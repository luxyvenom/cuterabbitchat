## 현재 상태 진단
- `tra3/CLAUDE.md`는 **프로젝트 설계 문서**이며, 현재 작업공간에는 실제 앱 소스(`src/`, `package.json` 등)가 아직 없습니다.
- 따라서 “필요한 키/토큰”은 **문서 기준 요구사항**이고, 실제 구현을 시작하면 **보안/아키텍처에 맞춰 env 이름/위치가 일부 바뀌는 게 정상**입니다.

## 필요한 API 키/토큰(문서 기준)
- **필수**
  - `VITE_SUPABASE_URL`: Supabase 프로젝트 URL (프론트에서 Supabase 클라이언트 초기화에 사용)
  - `VITE_SUPABASE_ANON_KEY`: Supabase anon key (프론트에서 로그인/DB 접근 시 사용, RLS 전제)
  - `VITE_GEMINI_API_KEY`: Gemini API 키 (AI 응답 생성)
- **선택**
  - `VITE_POSTHOG_KEY`: PostHog 프로젝트 키 (분석/트래킹)
  - `VITE_POSTHOG_HOST`: PostHog 호스트(클라우드면 보통 기본값, 셀프호스트면 필수)
  - `VITE_CHANNEL_TALK_KEY`: 채널톡(고객지원 위젯) 키

## 키/토큰 발급 위치(실무 기준)
- **Supabase**: Project Settings → API
  - URL = `https://xxxx.supabase.co`
  - anon key = `anon` 공개키(프론트용)
  - (추후 서버/엣지함수에서 필요할 수 있음) service role key = 비공개키(클라이언트에 절대 포함 금지)
- **Gemini**: Google AI Studio(또는 Google Cloud)에서 API 키 생성
- **PostHog**: PostHog 프로젝트 설정에서 Project API Key 확인
- **ChannelTalk**: ChannelTalk 관리자/플러그인 설정에서 키 확인

## 보안 관점에서의 중요한 조정(권장)
- Vite에서 `VITE_`로 시작하는 환경변수는 **클라이언트 번들에 포함**됩니다.
- 따라서 **`VITE_GEMINI_API_KEY`는 그대로 쓰면 키 유출 위험**이 큽니다.
- 권장 구조:
  - 프론트: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`만 보유
  - 서버/엣지 함수(Supabase Edge Functions 등): `GEMINI_API_KEY`를 **비공개 시크릿**으로 보유하고, 프론트는 함수 엔드포인트만 호출

## 실행 계획(구현 로드맵)
### 1) 프로젝트 스캐폴딩/기본 세팅
- Vite + React + TypeScript(Strict) 프로젝트 생성
- Tailwind CSS, React Router, Zustand, lucide-react, i18next/react-i18next 등 문서 기준 의존성 추가
- 다크 테마 토큰/레이아웃(모바일 하단 네비 + 데스크탑 사이드) 기본 틀 구현

### 2) Supabase 연동(인증 + RLS 전제)
- Supabase 클라이언트 초기화 모듈 구성
- 로그인/회원가입/세션 유지 흐름 + `useAuthStore` 구성
- DB 스키마 초안(Characters, Tags, ChatSessions, Messages, Favorites, Comments 등) + RLS 정책 설계

### 3) 캐릭터 시스템
- 캐릭터 CRUD(생성/편집/삭제), 태그 그룹 필터 검색, 즐겨찾기
- 캐릭터 상세/목록 카드 UI와 상태 관리(Zustand) 연결

### 4) AI 채팅
- 채팅 UI(메시지 리스트/입력/마크다운 렌더링/XSS 방지)
- 대화 히스토리 저장/로드(ChatSessions)
- 토큰 카운팅(tiktoken) 및 컨텍스트 관리
- (권장) **Gemini 호출을 Edge Function으로 분리**해서 키를 서버에만 보관

### 5) 선택 기능 통합
- PostHog 초기화/이벤트 설계(로그인, 캐릭터 조회, 채팅 전송 등)
- ChannelTalk 위젯 탑재(옵션)

### 6) 테스트/품질/보안
- 서비스 레이어 에러 핸들링 표준화(문서 패턴 준수)
- XSS 방지(DOMPurify) 적용 범위 확정
- 키/시크릿 관리(.env 로컬, 배포환경 시크릿) 정리

## 산출물(다음 단계에서 내가 만들 것)
- `.env.example`(프론트용/서버용 분리)
- Supabase 스키마/정책 초안
- Edge Function 기반 Gemini 프록시 + 프론트 채팅 연동
- 문서의 `src/` 구조를 실제 코드로 생성
