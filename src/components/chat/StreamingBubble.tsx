import ReactMarkdown from 'react-markdown';

interface StreamingBubbleProps {
  content: string;
  characterName?: string;
}

const StreamingBubble = ({ content, characterName }: StreamingBubbleProps) => {
  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[80%]">
        {characterName && (
          <p className="text-[10px] text-text-secondary mb-1 ml-1">
            {characterName}
          </p>
        )}
        <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-bg-secondary text-text-primary text-sm leading-relaxed border border-border">
          <div className="prose prose-invert prose-sm max-w-none [&_p]:m-0 [&_p]:leading-relaxed">
            <ReactMarkdown>{content}</ReactMarkdown>
            <span className="inline-block w-1.5 h-4 bg-accent/70 animate-pulse ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingBubble;
