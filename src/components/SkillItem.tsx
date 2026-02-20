import { Skill } from '../store/skillStore';

interface Props {
  skill: Skill;
  onCopy: (cmd: string) => void;
}

export function SkillItem({ skill, onCopy }: Props) {
  const displayName = skill.nameZh || skill.name;
  const displayDesc = skill.descriptionZh || skill.description;

  return (
    <div className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors cursor-pointer"
         onClick={() => onCopy(`/${skill.name}`)}>
      <div className="flex items-center justify-between">
        <span className="font-medium text-white">📦 {displayName}</span>
        <button className="text-xs bg-blue-600 px-2 py-1 rounded text-white hover:bg-blue-500">
          复制
        </button>
      </div>
      <div className="text-gray-300 text-sm mt-1">{displayDesc}</div>
      <div className="text-gray-500 text-xs mt-1">调用: /{skill.name}</div>
    </div>
  );
}
