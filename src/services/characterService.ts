import { supabase } from '@/lib/supabase';
import type { Character } from '@/types/character';

interface CreateCharacterDto {
  name: string;
  description: string;
  greeting: string;
  personality: string;
  scenario?: string;
  tags: string[];
  imageUrl?: string;
}

export async function fetchCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*, character_tags(tag_id, tags(*))')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map(mapCharacterRow);
}

export async function fetchCharacterById(id: string): Promise<Character | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('*, character_tags(tag_id, tags(*))')
    .eq('id', id)
    .single();

  if (error) return null;

  return mapCharacterRow(data);
}

export async function searchCharacters(query: string): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*, character_tags(tag_id, tags(*))')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('chat_count', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map(mapCharacterRow);
}

export async function createCharacter(
  dto: CreateCharacterDto,
  userId: string
): Promise<Character> {
  const { data, error } = await supabase
    .from('characters')
    .insert({
      name: dto.name,
      description: dto.description,
      greeting: dto.greeting,
      personality: dto.personality,
      scenario: dto.scenario ?? '',
      image_url: dto.imageUrl ?? null,
      creator_id: userId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (dto.tags.length > 0) {
    const tagRows = dto.tags.map((tagId) => ({
      character_id: data.id,
      tag_id: tagId,
    }));
    await supabase.from('character_tags').insert(tagRows);
  }

  const created = await fetchCharacterById(data.id);
  if (!created) throw new Error('캐릭터 생성 후 조회 실패');

  return created;
}

export async function incrementViewCount(characterId: string): Promise<void> {
  await supabase.rpc('increment_chat_count', { char_id: characterId }).then(({ error }) => {
    if (error) {
      // Fallback: direct update
      supabase
        .from('characters')
        .select('chat_count')
        .eq('id', characterId)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase
              .from('characters')
              .update({ chat_count: (data.chat_count ?? 0) + 1 })
              .eq('id', characterId)
              .then(() => {});
          }
        });
    }
  });
}

export async function updateFavoriteCount(
  characterId: string,
  increment: boolean
): Promise<void> {
  const { data } = await supabase
    .from('characters')
    .select('favorite_count')
    .eq('id', characterId)
    .single();

  if (data) {
    const newCount = Math.max(0, (data.favorite_count ?? 0) + (increment ? 1 : -1));
    await supabase
      .from('characters')
      .update({ favorite_count: newCount })
      .eq('id', characterId);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCharacterRow(row: any): Character {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    greeting: row.greeting,
    personality: row.personality,
    scenario: row.scenario ?? '',
    tags: (row.character_tags ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ct: any) => ct.tags
    ).filter(Boolean),
    imageUrl: row.image_url ?? undefined,
    creatorId: row.creator_id,
    creatorName: row.creator_name ?? undefined,
    chatCount: row.chat_count ?? 0,
    favoriteCount: row.favorite_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
