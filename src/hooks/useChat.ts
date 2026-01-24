import { useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { generateChatResponse } from '@/services/chatService';
import { saveMessage, fetchMessages, createSession } from '@/services/sessionService';
import type { Character } from '@/types/character';
import type { ChatMessage } from '@/types/chat';

export function useChat(character: Character | null) {
  const { currentSession, isGenerating, setCurrentSession, addMessage, setGenerating } = useChatStore();
  const user = useAuthStore((s) => s.user);

  const startSession = useCallback(async () => {
    if (!user || !character) return;

    const session = await createSession(user.id, character.id);

    if (character.greeting) {
      const greetingMsg: Omit<ChatMessage, 'id'> = {
        role: 'assistant',
        content: character.greeting,
        timestamp: new Date().toISOString(),
      };
      const saved = await saveMessage(session.id, greetingMsg);
      session.messages = [saved];
    }

    setCurrentSession(session);
  }, [user, character, setCurrentSession]);

  const loadSession = useCallback(async (sessionId: string) => {
    const messages = await fetchMessages(sessionId);
    setCurrentSession({
      id: sessionId,
      characterId: character?.id ?? '',
      userId: user?.id ?? '',
      messages,
      createdAt: '',
      lastMessageAt: '',
    });
  }, [character, user, setCurrentSession]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentSession || !character || isGenerating) return;

    const userMsg: Omit<ChatMessage, 'id'> = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const savedUserMsg = await saveMessage(currentSession.id, userMsg);
    addMessage(savedUserMsg);

    setGenerating(true);
    try {
      const responseText = await generateChatResponse(
        character,
        currentSession.messages,
        content
      );

      const assistantMsg: Omit<ChatMessage, 'id'> = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };

      const savedAssistantMsg = await saveMessage(currentSession.id, assistantMsg);
      addMessage(savedAssistantMsg);
    } catch (err) {
      console.error('[useChat] 응답 생성 실패:', err);
      const errorMsg: Omit<ChatMessage, 'id'> = {
        role: 'assistant',
        content: '죄송합니다, 응답을 생성하지 못했습니다. 다시 시도해주세요.',
        timestamp: new Date().toISOString(),
      };
      const savedError = await saveMessage(currentSession.id, errorMsg);
      addMessage(savedError);
    } finally {
      setGenerating(false);
    }
  }, [currentSession, character, isGenerating, addMessage, setGenerating]);

  return {
    messages: currentSession?.messages ?? [],
    isGenerating,
    startSession,
    loadSession,
    sendMessage,
  };
}
