import { create } from 'zustand';
import type { Character, Tag } from '@/types/character';

interface CharacterState {
  characters: Character[];
  favorites: string[];
  searchQuery: string;
  selectedTag: Tag | null;
  isLoading: boolean;
  setCharacters: (characters: Character[]) => void;
  toggleFavorite: (characterId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: Tag | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  characters: [],
  favorites: [],
  searchQuery: '',
  selectedTag: null,
  isLoading: false,

  setCharacters: (characters) => set({ characters }),

  toggleFavorite: (characterId) => set((state) => ({
    favorites: state.favorites.includes(characterId)
      ? state.favorites.filter((id) => id !== characterId)
      : [...state.favorites, characterId],
  })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedTag: (selectedTag) => set({ selectedTag }),
  setLoading: (isLoading) => set({ isLoading }),
}));
