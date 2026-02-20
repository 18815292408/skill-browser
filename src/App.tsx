import { useEffect, useState } from 'react';
import { useSkillStore } from './store/skillStore';
import { SkillList } from './components/SkillList';
import { Settings } from './components/Settings';
import { invoke } from '@tauri-apps/api/core';
import { loadCache, translateAndCache } from './utils/translationCache';

function App() {
  const { setSkills, setLoading, searchQuery, setSearchQuery, setCache, cache, apiKey, setApiKey } = useSkillStore();
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [translating, setTranslating] = useState(false);

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

  // 加载缓存
  useEffect(() => {
    const initCache = async () => {
      try {
        const cached = await loadCache();
        setCache(cached);
      } catch (e) {
        console.error('加载缓存失败:', e);
      }
    };
    initCache();
  }, [setCache]);

  // 加载 API Key
  useEffect(() => {
    const savedKey = localStorage.getItem('apiKey');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [setApiKey]);

  // 翻译所有 Skills
  const translateSkills = async () => {
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    setTranslating(true);
    const { skills } = useSkillStore.getState();
    const currentCache = { ...cache };

    for (const skill of skills) {
      if (!currentCache[skill.id]) {
        const translated = await translateAndCache(skill, currentCache, apiKey);
        currentCache[translated.id] = {
          nameZh: translated.nameZh,
          descriptionZh: translated.descriptionZh,
          lastUpdated: new Date().toISOString()
        };
        setCache({ ...currentCache });
      }
    }

    setTranslating(false);
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('apiKey', key);
    setSettingsOpen(false);
  };

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
        <div className="flex gap-3">
          <button
            onClick={translateSkills}
            disabled={translating}
            className={`text-blue-400 hover:text-blue-300 ${translating ? 'opacity-50' : ''}`}
          >
            {translating ? '翻译中...' : 'AI 翻译'}
          </button>
          <button onClick={() => setSettingsOpen(true)} className="text-gray-400 hover:text-gray-300">
            设置
          </button>
          <button onClick={loadSkills} className="text-blue-400 hover:text-blue-300">
            刷新
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
      />
    </div>
  );
}

export default App;
