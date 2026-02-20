import { invoke } from '@tauri-apps/api/core';
import { Skill } from '../store/skillStore';

interface CacheData {
  [skillId: string]: {
    nameZh: string;
    descriptionZh: string;
    lastUpdated: string;
  };
}

const CACHE_FILE = 'translation-cache.json';

export async function loadCache(): Promise<CacheData> {
  try {
    const data = await invoke<string>('load_cache', { fileName: CACHE_FILE });
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function saveCache(cache: CacheData): Promise<void> {
  try {
    await invoke('save_cache', { fileName: CACHE_FILE, content: JSON.stringify(cache) });
  } catch (e) {
    console.error('保存缓存失败:', e);
  }
}

export async function translateAndCache(
  skill: Skill,
  cache: CacheData,
  apiKey: string
): Promise<Skill> {
  if (cache[skill.id]) {
    return { ...skill, ...cache[skill.id] };
  }

  if (!apiKey) {
    return skill;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个翻译助手，将英文翻译成中文。只需要翻译，不要解释。'
          },
          {
            role: 'user',
            content: `翻译以下 Skill 名称和描述：\n名称: ${skill.name}\n描述: ${skill.description.slice(0, 500)}`
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content || '';

    // 解析翻译结果（简单处理）
    const lines = translation.split('\n').filter((l: string) => l.trim());
    const nameZh = lines[0]?.replace(/^名称[:：]\s*/, '') || skill.name;
    const descriptionZh = lines.slice(1).join('\n').replace(/^描述[:：]\s*/, '') || skill.description;

    const cacheEntry = {
      nameZh,
      descriptionZh,
      lastUpdated: new Date().toISOString()
    };

    cache[skill.id] = cacheEntry;
    await saveCache(cache);

    return { ...skill, ...cacheEntry };
  } catch (e) {
    console.error('翻译失败:', e);
    return skill;
  }
}
