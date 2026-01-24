import { create } from 'zustand';
import type { Character, TagGroup } from '../types/character';
import { fetchCharacters, incrementViewCount, updateFavoriteCount } from '../services/characterService';
import { MOCK_CHARACTERS } from '../utils/mockData';

const FAVORITES_KEY = 'qre_favorites';

function loadLocalFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLocalFavorites(favorites: Set<string>): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

interface CharacterStore {
  characters: Character[];
  filteredCharacters: Character[];
  searchQuery: string;
  selectedTag: string | null;
  selectedGroup: TagGroup | null;
  isLoading: boolean;
  favorites: Set<string>;
  loadCharacters: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tagId: string | null) => void;
  setSelectedGroup: (group: TagGroup | null) => void;
  getCharacterById: (id: string) => Character | undefined;
  toggleFavorite: (characterId: string) => void;
  trackView: (characterId: string) => void;
  isFavorite: (characterId: string) => boolean;
}

const useCharacterStore = create<CharacterStore>((set, get) => ({
  characters: [],
  filteredCharacters: [],
  isLoading: false,
  searchQuery: '',
  selectedTag: null,
  selectedGroup: null,
  favorites: loadLocalFavorites(),

  loadCharacters: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchCharacters();
      if (data.length > 0) {
        set({ characters: data, filteredCharacters: data });
      } else {
        set({ characters: MOCK_CHARACTERS, filteredCharacters: MOCK_CHARACTERS });
      }
    } catch {
      set({ characters: MOCK_CHARACTERS, filteredCharacters: MOCK_CHARACTERS });
    } finally {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    const { characters, selectedTag } = get();
    let filtered = characters;

    if (query.trim()) {
      const lower = query.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((c) =>
        c.tags.some((t) => t.id === selectedTag)
      );
    }

    set({ filteredCharacters: filtered });
  },

  setSelectedTag: (tagId: string | null) => {
    set({ selectedTag: tagId });
    const { characters, searchQuery } = get();
    let filtered = characters;

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      );
    }

    if (tagId) {
      filtered = filtered.filter((c) =>
        c.tags.some((t) => t.id === tagId)
      );
    }

    set({ filteredCharacters: filtered });
  },

  setSelectedGroup: (group: TagGroup | null) => {
    set({ selectedGroup: group, selectedTag: null });
    const { characters, searchQuery } = get();
    let filtered = characters;

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)
      );
    }

    if (group) {
      filtered = filtered.filter((c) =>
        c.tags.some((t) => t.group === group)
      );
    }

    set({ filteredCharacters: filtered });
  },

  getCharacterById: (id: string) => {
    return get().characters.find((c) => c.id === id);
  },

  isFavorite: (characterId: string) => {
    return get().favorites.has(characterId);
  },

  toggleFavorite: (characterId: string) => {
    const { favorites, characters, filteredCharacters } = get();
    const newFavorites = new Set(favorites);
    const isCurrentlyFavorite = newFavorites.has(characterId);

    if (isCurrentlyFavorite) {
      newFavorites.delete(characterId);
    } else {
      newFavorites.add(characterId);
    }

    saveLocalFavorites(newFavorites);

    const updateCount = (list: Character[]) =>
      list.map((c) =>
        c.id === characterId
          ? { ...c, favoriteCount: Math.max(0, c.favoriteCount + (isCurrentlyFavorite ? -1 : 1)) }
          : c
      );

    set({
      favorites: newFavorites,
      characters: updateCount(characters),
      filteredCharacters: updateCount(filteredCharacters),
    });

    updateFavoriteCount(characterId, !isCurrentlyFavorite);
  },

  trackView: (characterId: string) => {
    const { characters, filteredCharacters } = get();

    const updateCount = (list: Character[]) =>
      list.map((c) =>
        c.id === characterId
          ? { ...c, chatCount: c.chatCount + 1 }
          : c
      );

    set({
      characters: updateCount(characters),
      filteredCharacters: updateCount(filteredCharacters),
    });

    incrementViewCount(characterId);
  },
}));

export default useCharacterStore;
