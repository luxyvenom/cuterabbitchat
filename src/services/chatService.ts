import { geminiModel } from '@/lib/gemini';
import type { Character } from '@/types/character';
import type { ChatMessage } from '@/types/chat';

function buildSystemPrompt(character: Character): string {
  return [
    `You are "${character.name}".`,
    `Description: ${character.description}`,
    `Personality: ${character.personality}`,
    character.scenario ? `Scenario: ${character.scenario}` : '',
    '',
    'Rules:',
    '- Stay in character at all times.',
    '- Respond naturally based on your personality.',
    '- Keep responses concise but engaging.',
    '- Use the language the user speaks.',
  ].filter(Boolean).join('\n');
}

function buildChatHistory(messages: ChatMessage[]) {
  return messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: msg.content }],
  }));
}

export async function generateChatResponse(
  character: Character,
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(character);

  const chat = geminiModel.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: character.greeting }] },
      ...buildChatHistory(messages),
    ],
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response;

  return response.text();
}

export async function generateGreeting(character: Character): Promise<string> {
  if (character.greeting) {
    return character.greeting;
  }

  const prompt = [
    `You are "${character.name}".`,
    `Personality: ${character.personality}`,
    'Write a short greeting message to start a conversation.',
    'Stay in character. Keep it under 2 sentences.',
  ].join('\n');

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}
