import { useEffect, useState } from 'react';
import { useSkillStore } from './store/skillStore';
import { SkillList } from './components/SkillList';
import { invoke } from '@tauri-apps/api/core';

function App() {
  const { setSkills, setLoading, searchQuery, setSearchQuery } = useSkillStore();
  const [error, setError] = useState<string | null>(null);

  const loadSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const skills = await invoke<any[]>('scan_skills');
      setSkills(skills);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h1 className="text-lg font-bold mb-2">Skill 浏览器</h1>
        <input
          type="text"
          placeholder="搜索 Skill..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {error && (
          <div className="text-red-400 text-sm mb-2">{error}</div>
        )}
        <SkillList />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 flex justify-between items-center text-sm text-gray-400">
        <span>共 {useSkillStore(s => s.skills.length)} 个 Skills</span>
        <button onClick={loadSkills} className="text-blue-400 hover:text-blue-300">
          🔄 刷新
        </button>
      </div>
    </div>
  );
}

export default App;
