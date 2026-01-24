import { useEffect, useMemo } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { fetchCharacters, searchCharacters } from '@/services/characterService';
import { useDebounce } from './useDebounce';

export function useCharacterList() {
  const {
    characters,
    searchQuery,
    selectedTag,
    isLoading,
    setCharacters,
    setLoading,
  } = useCharacterStore();

  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = debouncedQuery
          ? await searchCharacters(debouncedQuery)
          : await fetchCharacters();
        setCharacters(data);
      } catch (err) {
        console.error('[useCharacterList] 로딩 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [debouncedQuery, setCharacters, setLoading]);

  const filteredCharacters = useMemo(() => {
    if (!selectedTag) return characters;
    return characters.filter((char) =>
      char.tags.some((t) => t.id === selectedTag.id)
    );
  }, [characters, selectedTag]);

  return {
    characters: filteredCharacters,
    isLoading,
  };
}
