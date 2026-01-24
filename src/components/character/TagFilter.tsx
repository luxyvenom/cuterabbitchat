import type { TagGroup } from '../../types/character';
import { MOCK_TAGS } from '../../utils/mockData';
import useCharacterStore from '../../stores/useCharacterStore';

const TAG_GROUPS: { key: TagGroup; label: string }[] = [
  { key: 'genre', label: 'Genre' },
  { key: 'relationship', label: 'Relationship' },
  { key: 'personality', label: 'Personality' },
  { key: 'concept', label: 'Concept' },
  { key: 'species', label: 'Species' },
  { key: 'meta', label: 'Meta' },
];

const TagFilter = () => {
  const { selectedTag, selectedGroup, setSelectedTag, setSelectedGroup } =
    useCharacterStore();

  const filteredTags = selectedGroup
    ? MOCK_TAGS.filter((t) => t.group === selectedGroup)
    : MOCK_TAGS;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedGroup(null)}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
            !selectedGroup
              ? 'bg-accent text-white'
              : 'bg-bg-tertiary text-text-secondary'
          }`}
        >
          All
        </button>
        {TAG_GROUPS.map((group) => (
          <button
            key={group.key}
            onClick={() => setSelectedGroup(group.key)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors ${
              selectedGroup === group.key
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {filteredTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() =>
              setSelectedTag(selectedTag === tag.id ? null : tag.id)
            }
            className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full transition-colors ${
              selectedTag === tag.id
                ? 'bg-accent/20 text-accent border border-accent/50'
                : 'bg-bg-secondary text-text-secondary border border-border'
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
