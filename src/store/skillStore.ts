import { create } from 'zustand';

export interface Skill {
  id: string;
  name: string;
  nameZh?: string;
  description: string;
  descriptionZh?: string;
  path: string;
}

interface SkillStore {
  skills: Skill[];
  loading: boolean;
  searchQuery: string;
  cache: Record<string, any>;
  apiKey: string;
  setSkills: (skills: Skill[]) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCache: (cache: Record<string, any>) => void;
  setApiKey: (key: string) => void;
  filteredSkills: () => Skill[];
}

export const useSkillStore = create<SkillStore>((set, get) => ({
  skills: [],
  loading: false,
  searchQuery: '',
  cache: {},
  apiKey: '',
  setSkills: (skills) => set({ skills }),
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCache: (cache) => set({ cache }),
  setApiKey: (key) => set({ apiKey: key }),
  filteredSkills: () => {
    const { skills, searchQuery, cache } = get();
    if (!searchQuery) return skills;
    const q = searchQuery.toLowerCase();
    return skills.map(s => ({
      ...s,
      descriptionZh: cache[s.id]?.descriptionZh || s.descriptionZh,
      nameZh: cache[s.id]?.nameZh || s.nameZh
    })).filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.descriptionZh || s.description).toLowerCase().includes(q)
    );
  },
}));
