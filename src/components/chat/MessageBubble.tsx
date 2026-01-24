import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  characterName?: string;
}

const MessageBubble = ({ message, characterName }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-1'}`}>
        {!isUser && characterName && (
          <p className="text-[10px] text-text-secondary mb-1 ml-1">
            {characterName}
          </p>
        )}
        <div
          className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-accent text-white rounded-br-sm'
              : 'bg-bg-secondary text-text-primary rounded-bl-sm border border-border'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none [&_p]:m-0 [&_p]:leading-relaxed">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <p
          className={`text-[9px] text-text-secondary/50 mt-0.5 ${
            isUser ? 'text-right mr-1' : 'ml-1'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
