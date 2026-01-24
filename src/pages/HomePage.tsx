import { useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import useCharacterStore from '../stores/useCharacterStore';
import CharacterCard from '../components/character/CharacterCard';
import TagFilter from '../components/character/TagFilter';
import SnowEffect from '../components/effects/SnowEffect';

const HomePage = () => {
  const { filteredCharacters, searchQuery, isLoading, setSearchQuery, loadCharacters } =
    useCharacterStore();

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  return (
    <div className="flex flex-col">
      <SnowEffect />
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-primary px-4 pt-4 pb-3">
        <div className="mb-3">
          <img 
            src="/qrelogo.png" 
            alt="QRE Logo" 
            className="h-16 w-auto object-contain"
          />
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-secondary border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Tag Filter */}
      <div className="px-4 mb-3">
        <TagFilter />
      </div>

      {/* Character Grid */}
      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader size={24} className="animate-spin text-accent" />
          </div>
        ) : filteredCharacters.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredCharacters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
            <p className="text-sm">No characters found</p>
            <p className="text-xs mt-1">Try a different search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
