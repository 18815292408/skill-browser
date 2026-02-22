import { create } from 'zustand';

export interface Skill {
  id: string;
  name: string;
  nameZh?: string;
  description: string;
  descriptionZh?: string;
  path: string;
  isFavorite?: boolean;
  isPinned?: boolean;
}

interface SkillStore {
  skills: Skill[];
  loading: boolean;
  searchQuery: string;
  cache: Record<string, any>;
  apiKey: string;
  showFavoritesOnly: boolean;
  setSkills: (skills: Skill[]) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCache: (cache: Record<string, any>) => void;
  setApiKey: (key: string) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  toggleFavorite: (skillId: string) => void;
  togglePinned: (skillId: string) => void;
  filteredSkills: () => Skill[];
}

export const useSkillStore = create<SkillStore>((set, get) => ({
  skills: [],
  loading: false,
  searchQuery: '',
  cache: {},
  apiKey: '',
  showFavoritesOnly: false,
  setSkills: (skills) => set({ skills }),
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCache: (cache) => set({ cache }),
  setApiKey: (key) => set({ apiKey: key }),
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),
  toggleFavorite: (skillId) => {
    const { cache } = get();
    const isFavorite = !cache[skillId]?.isFavorite;
    set({
      cache: {
        ...cache,
        [skillId]: {
          ...cache[skillId],
          isFavorite,
          isPinned: cache[skillId]?.isPinned || false
        }
      }
    });
  },
  togglePinned: (skillId) => {
    const { cache } = get();
    const isPinned = !cache[skillId]?.isPinned;
    set({
      cache: {
        ...cache,
        [skillId]: {
          ...cache[skillId],
          isFavorite: cache[skillId]?.isFavorite || false,
          isPinned
        }
      }
    });
  },
  filteredSkills: () => {
    const { skills, searchQuery, cache, showFavoritesOnly } = get();
    // 总是从 cache 获取翻译内容和状态
    const translatedSkills = skills.map(s => ({
      ...s,
      nameZh: cache[s.id]?.nameZh || s.nameZh,
      descriptionZh: cache[s.id]?.descriptionZh || s.descriptionZh,
      isFavorite: cache[s.id]?.isFavorite || false,
      isPinned: cache[s.id]?.isPinned || false
    }));

    let filtered = translatedSkills;

    // 筛选只看常用
    if (showFavoritesOnly) {
      filtered = filtered.filter(s => s.isFavorite);
    }

    // 搜索过滤
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.nameZh && s.nameZh.toLowerCase().includes(q)) ||
        s.description.toLowerCase().includes(q) ||
        (s.descriptionZh && s.descriptionZh.toLowerCase().includes(q))
      );
    }

    // 排序：置顶的排在最前面，其他保持原有顺序
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  },
}));
