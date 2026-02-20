import { create } from 'zustand';

export interface Skill {
  id: string;
  name: string;
  description: string;
  descriptionZh?: string;
  path: string;
}

interface SkillStore {
  skills: Skill[];
  loading: boolean;
  searchQuery: string;
  setSkills: (skills: Skill[]) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  filteredSkills: () => Skill[];
}

export const useSkillStore = create<SkillStore>((set, get) => ({
  skills: [],
  loading: false,
  searchQuery: '',
  setSkills: (skills) => set({ skills }),
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  filteredSkills: () => {
    const { skills, searchQuery } = get();
    if (!searchQuery) return skills;
    const q = searchQuery.toLowerCase();
    return skills.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.descriptionZh || s.description).toLowerCase().includes(q)
    );
  },
}));
