# 🐰 CuteRabbitChat

> AI-powered character chat platform — talk with a cute rabbit, powered by large language models.

**Live → [cuterabbitchat.vercel.app](https://cuterabbitchat.vercel.app)**

---

## Overview

CuteRabbitChat is a lightweight AI character chat demo built as part of the [LUXY VENOM](https://luxyvenom.com) platform stack. It lets users have real-time conversations with a personality-driven AI character — a starting point for exploring character consistency, tone control, and conversational UX on top of LLM APIs.

This project serves as a public prototype for the core interaction loop that LUXY VENOM's full platform is built on.

---

## Features

- 💬 **Real-time character chat** — streaming responses with character-consistent tone
- 🐰 **Persistent character persona** — system prompt architecture keeps the character in-role
- ⚡ **Edge-deployed** — hosted on Vercel for low-latency global access
- 📱 **Responsive UI** — works on desktop and mobile browsers
- 🔒 **Stateless sessions** — no login required, no data stored

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| State Management | Zustand |
| LLM Backend | BytePlus ModelArk |
| Deployment | Vercel |
| Styling | Tailwind CSS |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A BytePlus ModelArk API key (or compatible OpenAI-format endpoint)

### Local Development

```bash
# Clone the repository
git clone https://github.com/luxyvenom/cuterabbitchat.git
cd cuterabbitchat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# → Add your BYTEPLUS_API_KEY and BYTEPLUS_MODEL to .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
BYTEPLUS_API_KEY=your_api_key_here
BYTEPLUS_MODEL=your_model_endpoint_id
BYTEPLUS_BASE_URL=https://ark.ap-southeast.bytepluses.com/api/v3
```

---

## Project Structure

```
cuterabbitchat/
├── app/
│   ├── page.tsx          # Main chat UI
│   ├── api/
│   │   └── chat/
│   │       └── route.ts  # Streaming LLM API route
│   └── layout.tsx
├── components/
│   ├── ChatWindow.tsx    # Message list + scroll
│   ├── MessageBubble.tsx # Individual message rendering
│   └── InputBar.tsx      # User input + send
├── store/
│   └── chatStore.ts      # Zustand state (messages, loading)
├── lib/
│   └── byteplus.ts       # ModelArk client wrapper
└── public/
    └── rabbit.png        # Character avatar
```

---

## Character System Prompt Design

The character's personality is defined in `lib/byteplus.ts` as a system prompt injected at the start of every conversation. Key design principles used:

- **Role anchoring** — opens with a clear identity statement
- **Tone constraints** — defines speaking style (cute, warm, slightly playful)
- **Boundary rules** — keeps the character from breaking persona on edge inputs
- **Language flexibility** — responds in the same language as the user (Korean / English / Japanese)

To customize the character, edit the `SYSTEM_PROMPT` constant in `lib/byteplus.ts`.

---

## Roadmap

- [ ] Character memory across sessions (Upstash Redis)
- [ ] Multiple character support (character selection screen)
- [ ] Voice input/output (Web Speech API)
- [ ] Creator dashboard to define custom characters (LUXY VENOM Studio)
- [ ] Age-gated content tier (Lv.0 / Lv.1 / Lv.2 system)
- [ ] Japanese / Korean UI localization

---

## Related Projects

This repo is part of the LUXY VENOM multi-repo architecture:

| Repo | Description |
|---|---|
| `luxy-venom-web` | Main platform (Next.js) |
| `luxy-venom-api` | Backend API (Go + sqlc + pgx) |
| `luxy-venom-studio` | Creator dashboard |
| `luxy-venom-common` | Shared harness / CI templates |
| `luxy-venom-policy` | Privacy & terms (MDX) |

---

## License

MIT © [LUXY VENOM Inc.](https://luxyvenom.com)

---

<p align="center">
  Built with ☕ by <a href="https://luxyvenom.com">LUXY VENOM Inc.</a> · Seoul, Korea
</p>
