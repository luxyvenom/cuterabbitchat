export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokenCount?: number;
}

export interface ChatSession {
  id: string;
  characterId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  lastMessageAt: string;
}
