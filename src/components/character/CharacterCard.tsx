import { MessageCircle, Heart } from 'lucide-react';
import type { Character } from '../../types/character';
import { useNavigate } from 'react-router-dom';
import { getCharacterMedia } from '../../utils/videoMap';

interface CharacterCardProps {
  character: Character;
}

const CharacterCard = ({ character }: CharacterCardProps) => {
  const navigate = useNavigate();
  const media = getCharacterMedia(character.id);

  const formatCount = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <button
      onClick={() => navigate(`/character/${character.id}`)}
      className="w-full bg-bg-secondary rounded-xl overflow-hidden hover:ring-1 hover:ring-accent/50 transition-all text-left"
    >
      <div className="w-full h-56 bg-bg-tertiary overflow-hidden">
        {media.type === 'video' ? (
          <video
            src={media.src}
            muted
            loop
            autoPlay
            playsInline
            preload="none"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={media.src}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-text-primary truncate">
          {character.name}
        </h3>
        <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
          {character.greeting || character.description}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-[10px] text-text-secondary">
            <MessageCircle size={10} />
            {formatCount(character.chatCount)}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-text-secondary">
            <Heart size={10} />
            {formatCount(character.favoriteCount)}
          </span>
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {character.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

export default CharacterCard;
