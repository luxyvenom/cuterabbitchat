import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import useCharacterStore from '../stores/useCharacterStore';
import { createCharacter } from '../services/characterService';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Tag } from '../types/character';
import { MOCK_TAGS } from '../utils/mockData';

const CreatePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { signInWithGoogle } = useAuth();
  const { loadCharacters } = useCharacterStore();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    greeting: '',
    personality: '',
    scenario: '',
  });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase.from('tags').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
          setTags(data.map((t) => ({ id: t.id, name: t.name, group: t.group })));
        } else {
          setTags(MOCK_TAGS);
        }
      } catch {
        setTags(MOCK_TAGS);
      }
    };
    
    fetchTags();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      toast.error('이름과 설명은 필수입니다.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createCharacter(
        { ...form, tags: selectedTags },
        user.id
      );
      toast.success('캐릭터가 생성되었습니다!');
      await loadCharacters();
      navigate(`/character/${created.id}`);
    } catch {
      toast.error('캐릭터 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 gap-4">
        <Sparkles size={48} className="text-text-secondary/30" />
        <h2 className="text-lg font-semibold text-text-primary">Create Character</h2>
        <p className="text-sm text-text-secondary text-center">
          캐릭터를 만들려면 로그인이 필요합니다
        </p>
        <button
          onClick={() => signInWithGoogle()}
          className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover rounded-xl text-white font-semibold text-sm transition-colors"
        >
          <LogIn size={16} />
          Google로 로그인
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-20">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold text-text-primary">Create Character</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
        <input
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="캐릭터 이름 *"
          maxLength={100}
          className="bg-bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <textarea
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="캐릭터 설명 *"
          rows={3}
          maxLength={2000}
          className="bg-bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 resize-none focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <textarea
          value={form.greeting}
          onChange={(e) => handleChange('greeting', e.target.value)}
          placeholder="인사말 (채팅 시작 시 표시)"
          rows={2}
          maxLength={1000}
          className="bg-bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 resize-none focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <textarea
          value={form.personality}
          onChange={(e) => handleChange('personality', e.target.value)}
          placeholder="성격 (AI가 참고하는 성격 설명)"
          rows={3}
          maxLength={5000}
          className="bg-bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 resize-none focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <textarea
          value={form.scenario}
          onChange={(e) => handleChange('scenario', e.target.value)}
          placeholder="시나리오 (대화 배경 상황)"
          rows={2}
          className="bg-bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 resize-none focus:outline-none focus:ring-1 focus:ring-accent"
        />

        {tags.length > 0 && (
          <div>
            <p className="text-xs text-text-secondary mb-2">태그 선택</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-accent text-white'
                      : 'bg-bg-secondary text-text-secondary border border-border'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !form.name.trim() || !form.description.trim()}
          className="mt-2 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles size={16} />
          {isSubmitting ? '생성 중...' : '캐릭터 생성'}
        </button>
      </form>
    </div>
  );
};

export default CreatePage;
