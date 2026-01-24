import { supabase } from '@/lib/supabase';
import type { ChatMessage, ChatSession } from '@/types/chat';

export async function fetchSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map(mapSessionRow);
}

export async function fetchSessionById(sessionId: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) return null;

  return mapSessionRow(data);
}

export async function createSession(
  userId: string,
  characterId: string
): Promise<ChatSession> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      character_id: characterId,
      created_at: now,
      last_message_at: now,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return mapSessionRow(data);
}

export async function fetchMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map(mapMessageRow);
}

export async function saveMessage(
  sessionId: string,
  message: Omit<ChatMessage, 'id'>
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role: message.role,
      content: message.content,
      token_count: message.tokenCount ?? null,
      created_at: message.timestamp,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from('chat_sessions')
    .update({ last_message_at: message.timestamp })
    .eq('id', sessionId);

  return mapMessageRow(data);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await supabase.from('chat_messages').delete().eq('session_id', sessionId);
  await supabase.from('chat_sessions').delete().eq('id', sessionId);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSessionRow(row: any): ChatSession {
  return {
    id: row.id,
    characterId: row.character_id,
    userId: row.user_id,
    messages: [],
    createdAt: row.created_at,
    lastMessageAt: row.last_message_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessageRow(row: any): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    timestamp: row.created_at,
    tokenCount: row.token_count ?? undefined,
  };
}
