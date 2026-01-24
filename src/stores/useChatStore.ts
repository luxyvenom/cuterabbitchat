import { create } from 'zustand';
import type { ChatMessage, ChatSession } from '../types/chat';
import type { Character } from '../types/character';
import { generateCharacterResponseStream } from '../services/aiService';
import { createSession, saveMessage, deleteSession, fetchSessions, fetchMessages } from '../services/sessionService';
import { useAuthStore } from './authStore';

interface ChatStore {
  sessions: Record<string, ChatSession>;
  currentSessionId: string | null;
  isGenerating: boolean;
  streamingContent: string;
  dbSessionMap: Record<string, string>;

  getOrCreateSession: (characterId: string, userId?: string) => ChatSession;
  loadSavedSessions: () => Promise<void>;
  sendMessage: (character: Character, content: string) => Promise<void>;
  clearSession: (characterId: string) => void;
}

const createMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const useChatStore = create<ChatStore>((set, get) => ({
  sessions: {},
  currentSessionId: null,
  isGenerating: false,
  streamingContent: '',
  dbSessionMap: {},

  loadSavedSessions: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const saved = await fetchSessions(user.id);
      const sessionsMap: Record<string, ChatSession> = {};
      const dbMap: Record<string, string> = {};
      for (const s of saved) {
        const msgs = await fetchMessages(s.id);
        sessionsMap[s.characterId] = { ...s, messages: msgs };
        dbMap[s.characterId] = s.id;
      }
      set({ sessions: sessionsMap, dbSessionMap: dbMap });
    } catch {
      /* Supabase unavailable, use in-memory */
    }
  },

  getOrCreateSession: (characterId: string, userId = 'anonymous') => {
    const { sessions } = get();
    if (sessions[characterId]) {
      set({ currentSessionId: characterId });
      return sessions[characterId];
    }

    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      characterId,
      userId,
      messages: [],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    };

    set({
      sessions: { ...sessions, [characterId]: newSession },
      currentSessionId: characterId,
    });

    const user = useAuthStore.getState().user;
    if (user) {
      createSession(user.id, characterId).then((dbSession) => {
        const { dbSessionMap } = get();
        set({ dbSessionMap: { ...dbSessionMap, [characterId]: dbSession.id } });
      }).catch(() => {});
    }

    return newSession;
  },

  sendMessage: async (character: Character, content: string) => {
    const { sessions } = get();
    const session = sessions[character.id];
    if (!session) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...session.messages, userMessage];
    set({
      sessions: {
        ...sessions,
        [character.id]: {
          ...session,
          messages: updatedMessages,
          lastMessageAt: new Date().toISOString(),
        },
      },
      isGenerating: true,
      streamingContent: '',
    });

    const dbSessionId = get().dbSessionMap[character.id];

    if (dbSessionId) {
      saveMessage(dbSessionId, { role: 'user', content, timestamp: userMessage.timestamp }).catch(() => {});
    }

    try {
      const fullResponse = await generateCharacterResponseStream(
        character,
        session.messages,
        content,
        (streamText) => {
          set({ streamingContent: streamText });
        }
      );

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
      };

      const currentSessions = get().sessions;
      const currentSession = currentSessions[character.id];
      set({
        sessions: {
          ...currentSessions,
          [character.id]: {
            ...currentSession,
            messages: [...currentSession.messages, assistantMessage],
            lastMessageAt: new Date().toISOString(),
          },
        },
        isGenerating: false,
        streamingContent: '',
      });

      if (dbSessionId) {
        saveMessage(dbSessionId, { role: 'assistant', content: fullResponse, timestamp: assistantMessage.timestamp }).catch(() => {});
      }
    } catch (error) {
      set({ isGenerating: false, streamingContent: '' });
      throw error;
    }
  },

  clearSession: (characterId: string) => {
    const { sessions, dbSessionMap } = get();
    const updated = { ...sessions };
    delete updated[characterId];

    if (dbSessionMap[characterId]) {
      deleteSession(dbSessionMap[characterId]).catch(() => {});
      const newMap = { ...dbSessionMap };
      delete newMap[characterId];
      set({ sessions: updated, dbSessionMap: newMap });
    } else {
      set({ sessions: updated });
    }
  },
}));

export default useChatStore;
