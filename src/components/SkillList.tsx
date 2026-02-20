import { useSkillStore } from '../store/skillStore';
import { SkillItem } from './SkillItem';
import { invoke } from '@tauri-apps/api/core';

export function SkillList() {
  const { filteredSkills, loading } = useSkillStore();

  const handleCopy = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      alert(`已复制: ${cmd}`);
    } catch {
      alert('复制失败');
    }
  };

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
        <SkillItem key={skill.id} skill={skill} onCopy={handleCopy} />
      ))}
    </div>
  );
}
