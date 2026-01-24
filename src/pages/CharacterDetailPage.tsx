import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Play } from 'lucide-react';
import useCharacterStore from '../stores/useCharacterStore';
import { getCharacterMedia } from '../utils/videoMap';

const CharacterDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCharacterById, toggleFavorite, trackView, isFavorite } = useCharacterStore();
  const viewTracked = useRef(false);

  const character = id ? getCharacterById(id) : undefined;
  const media = character ? getCharacterMedia(character.id) : undefined;
  const liked = id ? isFavorite(id) : false;

  useEffect(() => {
    if (id && character && !viewTracked.current) {
      viewTracked.current = true;
      trackView(id);
    }
  }, [id, character, trackView]);

  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-secondary">Character not found</p>
      </div>
    );
  }

  const formatCount = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-primary/90 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-text-primary p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold truncate">{character.name}</h1>
      </div>

      {/* Character Video */}
      <div className="w-full h-96 bg-bg-tertiary overflow-hidden">
        {media?.type === 'video' ? (
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
            src={media?.src}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{character.name}</h2>
            <p className="text-xs text-text-secondary">
              by {character.creatorName}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(character.id)}
            className={`p-2 rounded-full transition-colors ${
              liked
                ? 'bg-accent/20 text-accent'
                : 'bg-bg-tertiary text-text-secondary hover:text-accent'
            }`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex gap-4">
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <MessageCircle size={12} />
            {formatCount(character.chatCount)} chats
          </span>
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <Heart size={12} />
            {formatCount(character.favoriteCount)} favorites
          </span>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          {character.description}
        </p>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          {character.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-[11px] px-2.5 py-1 rounded-full bg-accent/10 text-accent"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Greeting Preview */}
        <div className="mt-2 p-3 bg-bg-secondary rounded-lg border border-border">
          <p className="text-[11px] text-text-secondary mb-1">Greeting</p>
          <p className="text-sm text-text-primary italic leading-relaxed">
            "{character.greeting}"
          </p>
        </div>
      </div>

      {/* Start Chat Button */}
      <div className="mt-auto px-4 pb-20">
        <button
          onClick={() => navigate(`/chat/${character.id}`)}
          className="w-full py-3 bg-accent hover:bg-accent-hover rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Play size={16} />
          Start Chat
        </button>
      </div>
    </div>
  );
};

export default CharacterDetailPage;
