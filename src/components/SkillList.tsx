import { useSkillStore } from '../store/skillStore';
import { SkillItem } from './SkillItem';

interface Props {
  selectMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onCopy?: (cmd: string) => void;
}

export function SkillList({ selectMode, selectedIds, onToggleSelect, onCopy }: Props) {
  const { filteredSkills, loading, cache, toggleFavorite, togglePinned } = useSkillStore();
  const skills = filteredSkills();

  if (loading) {
    return <div className="text-gray-400 text-center py-8">加载中...</div>;
  }

  if (skills.length === 0) {
    return <div className="text-gray-400 text-center py-8">未找到 Skills</div>;
  }

  return (
    <div className="space-y-2">
      {skills.map(skill => (
        <SkillItem
          key={skill.id}
          skill={skill}
          onCopy={onCopy || (() => {})}
          selectMode={selectMode}
          selected={selectedIds?.has(skill.id)}
          isTranslated={!!cache[skill.id]}
          onToggleSelect={onToggleSelect}
          onToggleFavorite={toggleFavorite}
          onTogglePinned={togglePinned}
        />
      ))}
    </div>
  );
}
