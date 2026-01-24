import { create } from 'zustand';
import type { ChatMessage, ChatSession } from '@/types/chat';

interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isGenerating: boolean;
  setSessions: (sessions: ChatSession[]) => void;
  setCurrentSession: (session: ChatSession | null) => void;
  addMessage: (message: ChatMessage) => void;
  setGenerating: (generating: boolean) => void;
  clearCurrentSession: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessions: [],
  currentSession: null,
  isGenerating: false,

  setSessions: (sessions) => set({ sessions }),

  setCurrentSession: (session) => set({ currentSession: session }),

  addMessage: (message) => set((state) => ({
    currentSession: state.currentSession
      ? {
          ...state.currentSession,
          messages: [...state.currentSession.messages, message],
          lastMessageAt: new Date().toISOString(),
        }
      : null,
  })),

  setGenerating: (isGenerating) => set({ isGenerating }),

  clearCurrentSession: () => set({ currentSession: null }),
}));
