import type { Character } from '../types/character';
import type { ChatMessage } from '../types/chat';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('VITE_GEMINI_API_KEY is not set');
  return key;
};

const buildSystemPrompt = (character: Character): string => {
  return `You are roleplaying as "${character.name}".

Character Description: ${character.description}
Personality: ${character.personality}
Scenario: ${character.scenario}

Rules:
- Stay in character at all times.
- Respond naturally as this character would.
- Use the character's personality traits in your responses.
- Keep responses concise (2-4 sentences typically).
- You may use *actions* wrapped in asterisks for expressiveness.
- Never break character or mention that you are an AI.`;
};

interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const buildContents = (
  messages: ChatMessage[],
  userMessage: string
): GeminiContent[] => {
  const history: GeminiContent[] = messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  history.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  return history;
};

export const generateCharacterResponse = async (
  character: Character,
  messages: ChatMessage[],
  userMessage: string
): Promise<string> => {
  const apiKey = getApiKey();
  const url = `${API_BASE}/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: buildSystemPrompt(character) }],
    },
    contents: buildContents(messages, userMessage),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('Empty response from AI');

  return text;
};

export const generateCharacterResponseStream = async (
  character: Character,
  messages: ChatMessage[],
  userMessage: string,
  onChunk: (text: string) => void
): Promise<string> => {
  const apiKey = getApiKey();
  const url = `${API_BASE}/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: buildSystemPrompt(character) }],
    },
    contents: buildContents(messages, userMessage),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `HTTP ${res.status}`);
  }

  if (!res.body) {
    return generateCharacterResponse(character, messages, userMessage);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const chunkText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (chunkText) {
            fullText += chunkText;
            onChunk(fullText);
          }
        } catch {
          // skip malformed chunk
        }
      }
    }
  }

  if (!fullText) {
    throw new Error('AI returned empty response');
  }

  return fullText;
};
