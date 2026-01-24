# CLAUDE.md - AI 캐릭터 채팅 플랫폼 프로젝트

## 프로젝트 개요

**프로젝트명**: AI Character Chat Platform (Caveduck.io 레퍼런스 기반)
**설명**: AI 캐릭터와 실시간 대화할 수 있는 웹 플랫폼. 사용자는 캐릭터를 생성하고, 다른 사용자가 만든 캐릭터와 대화할 수 있음.
**레퍼런스**: https://caveduck.io

---

## 기술 스택

### 프론트엔드

| 기술                  | 용도          |
| --------------------- | ------------- |
| React 19 + TypeScript | UI 프레임워크 |
| Vite                  | 빌드 도구     |
| Tailwind CSS          | 스타일링      |
| React Router          | 라우팅        |
| Zustand               | 상태 관리     |
| lucide-react          | 아이콘        |

### 백엔드/서비스

| 기술              | 용도               |
| ----------------- | ------------------ |
| Supabase          | 인증, DB, 스토리지 |
| Google Gemini API | AI 대화 생성       |
| PostHog           | 분석/트래킹        |

---

## 핵심 기능 (레퍼런스 분석 기반)

### 1. 캐릭터 시스템

- 캐릭터 생성/편집/삭제
- 캐릭터 검색 (태그 기반 필터링)
- 캐릭터 즐겨찾기
- 태그 카테고리: general, relationship, genre, concept, personality, species

### 2. AI 채팅

- 실시간 AI 캐릭터 대화
- 토큰 카운팅 (tiktoken)
- 마크다운 렌더링
- 대화 히스토리 관리

### 3. 사용자 시스템

- 로그인/회원가입
- 프로필 관리

### 4. 소셜 기능

- 댓글/답글
- 캐릭터 공유
- 신고 기능

### 5. 다국어 지원

- 영어(기본), 한국어

### 6. 이미지 생성

- AI 이미지 생성 (캐릭터 프로필/대화 내)
- 프롬프트 기반 이미지 생성

---

## 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/          # Button, Modal, Input 등 공통 컴포넌트
│   ├── chat/            # 채팅 관련 컴포넌트
│   ├── character/       # 캐릭터 카드, 목록, 생성 폼
│   ├── auth/            # 인증 관련 컴포넌트
│   └── layout/          # Header, Footer, Navigation
├── pages/               # 페이지 컴포넌트
│   ├── HomePage.tsx     # 메인 (캐릭터 탐색)
│   ├── ChatPage.tsx     # AI 채팅 인터페이스
│   ├── CharacterPage.tsx # 캐릭터 상세
│   ├── CreatePage.tsx   # 캐릭터 생성/편집
│   ├── ProfilePage.tsx  # 사용자 프로필
│   └── SettingsPage.tsx # 설정
├── services/            # API/외부 서비스 연동
│   ├── aiService.ts     # Gemini AI 통신
│   ├── authService.ts   # 인증 로직
│   └── characterService.ts # 캐릭터 CRUD
├── stores/              # Zustand 상태 관리
│   ├── useAuthStore.ts
│   ├── useChatStore.ts
│   └── useCharacterStore.ts
├── hooks/               # 커스텀 React 훅
├── types/               # TypeScript 타입 정의
│   ├── character.ts
│   ├── chat.ts
│   └── user.ts
├── utils/               # 유틸리티 함수
├── i18n/                # 다국어 번역 파일
├── App.tsx              # 루트 컴포넌트
├── main.tsx             # 엔트리 포인트
└── index.css            # 글로벌 스타일
```

---

## 코딩 규칙

### 1. 파일 크기 제한

- **파일당 최대 300줄**
- 300줄 초과 시 컴포넌트 분리 또는 커스텀 훅 추출

### 2. 코드 스타일

- TypeScript strict 모드 필수
- 인터페이스 우선 (type보다 interface 사용)
- 불변성 유지 (spread operator, map/filter 사용)
- console.log 프로덕션 코드에 사용 금지
- 함수형 컴포넌트 + 훅 패턴만 사용

### 3. 네이밍 규칙

```typescript
// 컴포넌트: PascalCase
const CharacterCard = () => { ... }

// 훅: camelCase (use 접두사)
const useCharacterList = () => { ... }

// 타입/인터페이스: PascalCase
interface Character { ... }

// 상수: UPPER_SNAKE_CASE
const MAX_TOKEN_COUNT = 4096;

// 파일명: 컴포넌트는 PascalCase.tsx, 그 외 camelCase.ts
```

### 4. 컴포넌트 패턴

```tsx
interface CharacterCardProps {
  character: Character;
  onSelect: (id: string) => void;
}

const CharacterCard = ({ character, onSelect }: CharacterCardProps) => {
  return <div className="...">{/* 컨텐츠 */}</div>;
};

export default CharacterCard;
```

### 5. 에러 핸들링

```typescript
// 서비스 레이어에서 에러 처리
try {
  const result = await aiService.generateResponse(prompt);
  return { success: true, data: result };
} catch (error) {
  console.error("[ChatService] 응답 생성 실패:", error);
  return { success: false, error: "응답을 생성할 수 없습니다." };
}
```

---

## UI/디자인 규칙

### 테마

- **기본 테마**: 다크 모드 (배경: #1C1B20)
- Tailwind CSS 유틸리티 클래스 사용
- 커스텀 색상 팔레트:

```css
/* 다크 테마 기본 색상 (레퍼런스 기반) */
--bg-primary: #1c1b20;
--bg-secondary: #262727;
--text-primary: #ffffff;
--text-secondary: #a0a0a0;
--accent: #7c3aed; /* 보라색 계열 */
```

### 레이아웃

- 모바일 퍼스트 반응형 디자인
- 최대 너비: 모바일 393px / 데스크탑 1200px
- 하단 네비게이션 바 (모바일)
- 사이드 네비게이션 (데스크탑)

---

## 핵심 타입 정의

```typescript
// 캐릭터
interface Character {
  id: string;
  name: string;
  description: string;
  greeting: string; // 첫 인사 메시지
  personality: string; // 성격 설정
  scenario: string; // 시나리오/배경
  tags: Tag[];
  imageUrl?: string;
  creatorId: string;
  chatCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
}

// 태그
interface Tag {
  id: string;
  group:
    | "general"
    | "relationship"
    | "genre"
    | "concept"
    | "personality"
    | "species"
    | "meta";
}

// 채팅 메시지
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  tokenCount?: number;
}

// 채팅 세션
interface ChatSession {
  id: string;
  characterId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  lastMessageAt: string;
}

// 사용자
interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  locale: string;
  createdAt: string;
}
```

---

## 환경 변수

```bash
# 필수
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GEMINI_API_KEY=

# 선택
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=
VITE_CHANNEL_TALK_KEY=
```

**중요**: API 키를 코드에 직접 하드코딩하지 않을 것. 반드시 환경 변수 사용.

---

## AI 서비스 패턴

```typescript
// AI 대화 생성 기본 패턴
const generateCharacterResponse = async (
  character: Character,
  messages: ChatMessage[],
  userMessage: string,
): Promise<string> => {
  const systemPrompt = buildSystemPrompt(character);
  const chatHistory = formatChatHistory(messages);

  // Gemini API 호출
  const response = await geminiService.chat({
    systemInstruction: systemPrompt,
    history: chatHistory,
    message: userMessage,
  });

  return response;
};
```

---

## 보안 규칙

1. **API 키**: 환경 변수로만 관리, .env 파일 gitignore에 포함
2. **입력 검증**: 사용자 입력 XSS 방지 (DOMPurify 사용)
3. **인증**: Supabase Auth + Row Level Security

---

## Git 규칙

### 커밋 메시지 포맷

```
feat: 새 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 스타일 변경 (UI)
docs: 문서 수정
test: 테스트 추가/수정
chore: 빌드/설정 변경
```

### 브랜치 전략

- `main`: 프로덕션 배포
- `dev`: 개발 통합
- `feat/*`: 기능 개발
- `fix/*`: 버그 수정

---

## 질문해야 하는 상황

| 상황                | 질문 예시                                      |
| ------------------- | ---------------------------------------------- |
| AI 모델 선택        | "Gemini Flash vs Pro 중 어떤 것을 사용할까요?" |
| 데이터베이스 스키마 | "이 테이블 구조가 적합할까요?"                 |
| UI 디자인 결정      | "이 화면의 레이아웃을 어떻게 할까요?"          |
| 배포 환경           | "Vercel/Railway 중 어디에 배포할까요?"         |

---

## 금지사항

- API 키를 코드에 하드코딩하기
- console.log를 프로덕션 코드에 남기기
- any 타입 사용 (필요 시 unknown + 타입 가드)
- 인라인 스타일 사용 (Tailwind 클래스 사용)
- 테스트 없이 AI 프롬프트 변경
- 환경 변수 없이 외부 서비스 직접 연결

---

## 참고 라이브러리 (레퍼런스에서 확인된 기능)

| 기능            | 추천 라이브러리         |
| --------------- | ----------------------- |
| 마크다운 렌더링 | react-markdown          |
| 토큰 카운팅     | tiktoken (js-tiktoken)  |
| 알림/토스트     | react-hot-toast         |
| 드래그앤드롭    | @dnd-kit                |
| 이미지 갤러리   | swiper                  |
| 코드 에디터     | @uiw/react-codemirror   |
| 다국어          | i18next + react-i18next |
| XSS 방지        | dompurify               |
| 날짜 처리       | date-fns                |
| 폼 검증         | zod + react-hook-form   |
