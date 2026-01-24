export type TagGroup =
  | 'general'
  | 'relationship'
  | 'genre'
  | 'concept'
  | 'personality'
  | 'species'
  | 'meta';

export interface Tag {
  id: string;
  name: string;
  group: TagGroup;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  greeting: string;
  personality: string;
  scenario: string;
  tags: Tag[];
  imageUrl?: string;
  creatorId: string;
  creatorName?: string;
  chatCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
}
