import { useEffect, useState } from 'react';
import { useSkillStore } from './store/skillStore';
import { SkillList } from './components/SkillList';
import { Settings } from './components/Settings';
import { Toast } from './components/Toast';
import { invoke } from '@tauri-apps/api/core';
import { loadCache, translateAndCache, clearCache, saveCache } from './utils/translationCache';

function App() {
  const { setSkills, setLoading, searchQuery, setSearchQuery, setCache, cache, apiKey, setApiKey, skills, showFavoritesOnly, setShowFavoritesOnly } = useSkillStore();
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectModeType, setSelectModeType] = useState<'translate' | 'clear'>('translate');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const [cacheLoaded, setCacheLoaded] = useState(false);

  const loadSkills = async () => {
    setError(null);
    try {
      const skills = await invoke<any[]>('scan_skills');
      setSkills(skills);
    } catch (e) {
      setError(String(e));
    }
  };

  // 加载缓存并自动加载 Skills
  useEffect(() => {
    const initApp = async () => {
      try {
        const cached = await loadCache();
        setCache(cached);
        setCacheLoaded(true);

        // 自动加载 Skills
        const skills = await invoke<any[]>('scan_skills');
        setSkills(skills);
      } catch (e) {
        console.error('初始化失败:', e);
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, [setCache, setSkills, setLoading]);

  // 加载 API Key
  useEffect(() => {
    const savedKey = localStorage.getItem('apiKey');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [setApiKey]);

  // 监听缓存变化，保存常用和置顶状态（仅在初始加载后）
  useEffect(() => {
    if (cacheLoaded && Object.keys(cache).length > 0) {
      saveCache(cache);
    }
  }, [cache, cacheLoaded]);

  // 翻译或清除选中的 Skills
  const handleSelectedSkills = async () => {
    if (selectModeType === 'clear') {
      // 清除翻译，但保留常用和置顶状态
      const newCache = { ...cache };
      for (const id of selectedIds) {
        const { isFavorite, isPinned } = newCache[id] || {};
        newCache[id] = {
          nameZh: '',
          descriptionZh: '',
          lastUpdated: '',
          isFavorite: isFavorite || false,
          isPinned: isPinned || false
        };
      }
      await clearCache();
      setCache(newCache);
      setSelectedIds(new Set());
      setSelectMode(false);
      return;
    }

    // 翻译
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    const { skills } = useSkillStore.getState();
    const skillsToTranslate = skills.filter(s => selectedIds.has(s.id) && !cache[s.id]);

    if (skillsToTranslate.length === 0) {
      alert('没有需要翻译的 Skill');
      return;
    }

    setTranslating(true);
    const currentCache = { ...cache };

    for (const skill of skillsToTranslate) {
      const translated = await translateAndCache(skill, currentCache, apiKey);
      const { isFavorite, isPinned } = currentCache[translated.id] || {};
      currentCache[translated.id] = {
        nameZh: translated.nameZh,
        descriptionZh: translated.descriptionZh,
        lastUpdated: new Date().toISOString(),
        isFavorite: isFavorite || false,
        isPinned: isPinned || false
      };
      setCache({ ...currentCache });
    }

    setSelectedIds(new Set());
    setSelectMode(false);
    setTranslating(false);
  };

  // 切换选择模式 (在翻译和清除翻译之间切换)
  const toggleSelectMode = (type: 'translate' | 'clear') => {
    if (selectMode && selectModeType === type) {
      // 退出选择模式
      setSelectedIds(new Set());
      setSelectMode(false);
    } else {
      // 进入选择模式
      setSelectedIds(new Set());
      setSelectModeType(type);
      setSelectMode(true);
    }
  };

  // 切换选择单个 Skill
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('apiKey', key);
    setSettingsOpen(false);
  };

  // 复制到剪贴板
  const handleCopy = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setToast({ visible: true, message: `已复制: ${cmd}` });
    } catch {
      setToast({ visible: true, message: '复制失败' });
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">Skill 浏览器</h1>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`text-xs px-2 py-1 rounded ${showFavoritesOnly ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            {showFavoritesOnly ? '★ 已筛选常用' : '☆ 只看常用'}
          </button>
        </div>
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
        <SkillList
          selectMode={selectMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onCopy={handleCopy}
        />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 flex justify-between items-center text-sm text-gray-400">
        <span>
          {selectMode
            ? `已选 ${selectedIds.size} 个${selectModeType === 'clear' ? '（将清除翻译）' : ''}`
            : `共 ${skills.length} 个 Skills`}
        </span>
        <div className="flex gap-3">
          {selectMode ? (
            <>
              <button
                onClick={handleSelectedSkills}
                disabled={translating || selectedIds.size === 0}
                className={`text-green-400 hover:text-green-300 ${translating || selectedIds.size === 0 ? 'opacity-50' : ''}`}
              >
                {translating ? '处理中...' : (selectModeType === 'clear' ? '清除翻译' : '开始翻译')}
              </button>
              <button
                onClick={() => toggleSelectMode('translate')}
                className="text-gray-400 hover:text-gray-300"
              >
                取消
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => toggleSelectMode('translate')}
                className="text-blue-400 hover:text-blue-300"
              >
                选择翻译
              </button>
              <button
                onClick={() => toggleSelectMode('clear')}
                className="text-orange-400 hover:text-orange-300"
              >
                清除翻译
              </button>
              <button
                onClick={handleSelectedSkills}
                disabled={translating}
                className={`text-blue-400 hover:text-blue-300 ${translating ? 'opacity-50' : ''}`}
              >
                {translating ? '翻译中...' : '全部翻译'}
              </button>
              <button onClick={() => setSettingsOpen(true)} className="text-gray-400 hover:text-gray-300">
                设置
              </button>
              <button onClick={loadSkills} className="text-blue-400 hover:text-blue-300">
                刷新
              </button>
            </>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
      />

      {/* Toast 提示 */}
      <Toast
        message={toast.message}
        visible={toast.visible}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
}

export default App;
