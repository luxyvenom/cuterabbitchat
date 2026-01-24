import { MessageCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../stores/useChatStore';
import useCharacterStore from '../stores/useCharacterStore';

const ChatsPage = () => {
  const navigate = useNavigate();
  const { sessions, clearSession } = useChatStore();
  const { getCharacterById } = useCharacterStore();

  const sessionList = Object.values(sessions)
    .filter((s) => s.messages.length > 0)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  if (sessionList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4">
        <MessageCircle size={48} className="text-text-secondary/30 mb-4" />
        <h2 className="text-lg font-semibold text-text-primary">Your Chats</h2>
        <p className="text-sm text-text-secondary mt-1">
          Start chatting with a character!
        </p>
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold text-text-primary">Your Chats</h1>
      </div>
      <div className="flex flex-col">
        {sessionList.map((session) => {
          const character = getCharacterById(session.characterId);
          const lastMsg = session.messages[session.messages.length - 1];
          return (
            <div
              key={session.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-bg-secondary/50 cursor-pointer transition-colors border-b border-border/30"
              onClick={() => navigate(`/chat/${session.characterId}`)}
            >
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-accent">
                  {character?.name?.[0] ?? '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {character?.name ?? 'Unknown'}
                  </span>
                  <span className="text-[10px] text-text-secondary shrink-0 ml-2">
                    {formatTime(session.lastMessageAt)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {lastMsg?.content ?? ''}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSession(session.characterId);
                }}
                className="p-1.5 text-text-secondary/50 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatsPage;
