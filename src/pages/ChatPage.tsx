import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useCharacterStore from '../stores/useCharacterStore';
import useChatStore from '../stores/useChatStore';
import MessageBubble from '../components/chat/MessageBubble';
import StreamingBubble from '../components/chat/StreamingBubble';
import ChatInput from '../components/chat/ChatInput';

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { getCharacterById } = useCharacterStore();
  const {
    sessions,
    isGenerating,
    streamingContent,
    getOrCreateSession,
    sendMessage,
    clearSession,
  } = useChatStore();

  const { loadCharacters } = useCharacterStore();
  const character = id ? getCharacterById(id) : undefined;
  const session = id ? sessions[id] : undefined;

  useEffect(() => {
    if (!character && id) {
      loadCharacters();
    }
  }, [character, id, loadCharacters]);

  useEffect(() => {
    if (id && character) {
      getOrCreateSession(id);
    }
  }, [id, character, getOrCreateSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, streamingContent]);

  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-secondary">Character not found</p>
      </div>
    );
  }

  const handleSend = async (content: string) => {
    try {
      await sendMessage(character, content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`AI 응답 실패: ${msg}`, { duration: 8000 });
      // Also add error as a visible message in chat
      const { sessions } = useChatStore.getState();
      const currentSession = sessions[character.id];
      if (currentSession) {
        const errorMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant' as const,
          content: `⚠️ Error: ${msg}`,
          timestamp: new Date().toISOString(),
        };
        useChatStore.setState({
          sessions: {
            ...sessions,
            [character.id]: {
              ...currentSession,
              messages: [...currentSession.messages, errorMessage],
            },
          },
        });
      }
    }
  };

  const handleClear = () => {
    if (id) {
      clearSession(id);
      getOrCreateSession(id);
      toast.success('Chat cleared');
    }
  };

  const messages = session?.messages ?? [];
  const showGreeting = messages.length === 0 && !isGenerating;

  return (
    <div className="flex flex-col h-screen max-w-[393px] mx-auto">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2.5 bg-bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1 text-text-primary">
            <ArrowLeft size={18} />
          </button>
          <div className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center text-xs font-bold text-text-secondary">
            {character.name[0]}
          </div>
          <span className="text-sm font-medium truncate max-w-[200px]">
            {character.name}
          </span>
        </div>
        <button
          onClick={handleClear}
          className="p-1.5 text-text-secondary hover:text-red-400 transition-colors"
          title="Clear chat"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {showGreeting && (
          <div className="flex justify-start mb-3">
            <div className="max-w-[80%]">
              <p className="text-[10px] text-text-secondary mb-1 ml-1">
                {character.name}
              </p>
              <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-bg-secondary text-text-primary text-sm leading-relaxed border border-border italic">
                {character.greeting}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            characterName={msg.role === 'assistant' ? character.name : undefined}
          />
        ))}

        {isGenerating && streamingContent && (
          <StreamingBubble
            content={streamingContent}
            characterName={character.name}
          />
        )}

        {isGenerating && !streamingContent && (
          <div className="flex justify-start mb-3">
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-bg-secondary border border-border">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0">
        <ChatInput onSend={handleSend} disabled={isGenerating} />
      </div>
    </div>
  );
};

export default ChatPage;
